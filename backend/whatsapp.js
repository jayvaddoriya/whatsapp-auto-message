const { 
  default: makeWASocket, 
  useMultiFileAuthState, 
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const qrcodeGenerator = require('qrcode');
const NodeCache = require('node-cache');
const db = require('./database');

// In-memory store for active socket connections
const sessions = {};

// In-memory store for message retry counts
const retryCaches = {};
const getRetryCache = (adminId) => {
  if (!retryCaches[adminId]) {
    retryCaches[adminId] = new NodeCache({ stdTTL: 24 * 60 * 60, checkperiod: 1 * 60 * 60 });
  }
  return retryCaches[adminId];
};

// Ensure auth directories exist
const getAuthFolderPath = (adminId) => {
  const baseDir = process.env.DATA_DIR 
    ? path.resolve(process.env.DATA_DIR, 'auth')
    : path.resolve(__dirname, 'auth');
  const folderPath = path.resolve(baseDir, `admin_${adminId}`);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  return folderPath;
};

// Initialize WhatsApp connection for an admin
const connectToWhatsApp = async (adminId) => {
  // If session already exists and is connected/connecting, return it
  if (sessions[adminId]) {
    const state = sessions[adminId];
    if (state.status === 'connected' || state.status === 'connecting') {
      return state;
    }
  }

  console.log(`Starting WhatsApp session for Admin ID: ${adminId}`);
  const authFolder = getAuthFolderPath(adminId);
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);

  // Fetch the latest Web version to prevent 405 handshake errors
  let version = [2, 3000, 1015976707];
  try {
    const latestVersion = await fetchLatestBaileysVersion();
    version = latestVersion.version;
    console.log(`Successfully fetched latest Baileys version: ${version.join('.')}`);
  } catch (err) {
    console.warn(`Could not fetch latest Baileys version dynamically. Using fallback. Error:`, err.message);
  }

  const logger = pino({ level: 'silent' });
  const msgRetryCounterCache = getRetryCache(adminId);
  const sock = makeWASocket({
    auth: state,
    version,
    syncFullHistory: false,
    printQRInTerminal: false,
    logger: logger,
    browser: ['Windows', 'Chrome', '120.0.0'],
    msgRetryCounterCache,
    getMessage: async (key) => {
      if (key && key.id) {
        try {
          const row = await db.get(
            `SELECT message_json FROM whatsapp_messages WHERE msg_id = ?`,
            [key.id]
          );
          if (row && row.message_json) {
            return JSON.parse(row.message_json);
          }
        } catch (err) {
          console.error(`Error loading message for retry:`, err);
        }
      }
      return {
        conversation: 'Message decryption retry'
      };
    }
  });

  // Store in active sessions map
  sessions[adminId] = {
    sock,
    status: 'connecting',
    qr: null,
    phoneNumber: null,
    pushName: null
  };

  // Update DB status to connecting
  await db.run(
    `INSERT INTO whatsapp_sessions (admin_id, status, qr_code, updated_at) 
     VALUES (?, 'connecting', NULL, CURRENT_TIMESTAMP)
     ON CONFLICT(admin_id) DO UPDATE SET status = 'connecting', qr_code = NULL, updated_at = CURRENT_TIMESTAMP`,
    [adminId]
  );

  // Setup credentials saving
  sock.ev.on('creds.update', saveCreds);

  // Handle connection updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(`QR Code generated for Admin ID: ${adminId}`);
      try {
        // Generate Base64 Data URL for the QR code
        const qrDataUrl = await qrcodeGenerator.toDataURL(qr);
        sessions[adminId].qr = qrDataUrl;
        sessions[adminId].status = 'qr_ready';

        await db.run(
          `UPDATE whatsapp_sessions SET status = 'qr_ready', qr_code = ?, updated_at = CURRENT_TIMESTAMP WHERE admin_id = ?`,
          [qrDataUrl, adminId]
        );
      } catch (err) {
        console.error('Error generating QR code data URL:', err);
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      console.log(`Connection closed for Admin ID: ${adminId}. Reason code: ${statusCode}. Reconnecting: ${shouldReconnect}`);
      
      // Update DB status
      await db.run(
        `UPDATE whatsapp_sessions SET status = 'disconnected', qr_code = NULL, updated_at = CURRENT_TIMESTAMP WHERE admin_id = ?`,
        [adminId]
      );
      
      if (sessions[adminId]) {
        sessions[adminId].status = 'disconnected';
        sessions[adminId].qr = null;
      }

      if (shouldReconnect) {
        // Retry connection after 5 seconds
        setTimeout(() => {
          connectToWhatsApp(adminId).catch(err => console.error(`Error reconnecting Admin ID ${adminId}:`, err));
        }, 5000);
      } else {
        // User logged out - clean up credentials and delete session
        console.log(`Admin ID ${adminId} logged out. Deleting credentials folder.`);
        try {
          fs.rmSync(authFolder, { recursive: true, force: true });
        } catch (e) {
          console.error(`Failed to delete auth folder for Admin ID ${adminId}:`, e);
        }
        delete sessions[adminId];
        // Clean up cached broadcast lists
        await db.run(`DELETE FROM broadcast_lists WHERE admin_id = ?`, [adminId]);
      }
    }

    if (connection === 'open') {
      console.log(`WhatsApp connection successfully opened for Admin ID: ${adminId}`);
      const phoneNumber = sock.user.id.split(':')[0];
      const pushName = sock.user.name || sock.user.pushName || 'WhatsApp User';

      if (sessions[adminId]) {
        sessions[adminId].status = 'connected';
        sessions[adminId].qr = null;
        sessions[adminId].phoneNumber = phoneNumber;
        sessions[adminId].pushName = pushName;
      }

      await db.run(
        `UPDATE whatsapp_sessions 
         SET status = 'connected', qr_code = NULL, phone_number = ?, push_name = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE admin_id = ?`,
        [phoneNumber, pushName, adminId]
      );
    }
  });

  // Handle incoming / synced chats to extract Broadcast Lists
  const handleChats = async (chatsList) => {
    if (!chatsList || !Array.isArray(chatsList)) return;
    
    for (const chat of chatsList) {
      if (chat.id && chat.id.endsWith('@broadcast') && chat.id !== 'status@broadcast') {
        const name = chat.name || chat.id.split('@')[0];
        // Determine recipient count if available in metadata
        const recipientCount = chat.participants ? chat.participants.length : 0;
        
        try {
          await db.run(
            `INSERT INTO broadcast_lists (admin_id, jid, name, recipient_count, updated_at) 
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(admin_id, jid) DO UPDATE SET name = excluded.name, recipient_count = excluded.recipient_count, updated_at = CURRENT_TIMESTAMP`,
            [adminId, chat.id, name, recipientCount]
          );
        } catch (err) {
          console.error(`Error saving broadcast list ${chat.id} for Admin ID ${adminId}:`, err);
        }
      } else if (chat.id && chat.id.endsWith('@s.whatsapp.net')) {
        const jid = chat.id;
        const phone = jid.split('@')[0];
        const name = chat.name || phone;
        
        try {
          await db.run(
            `INSERT INTO whatsapp_contacts (admin_id, jid, name, phone_number, created_at) 
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(admin_id, jid) DO UPDATE SET name = excluded.name, phone_number = excluded.phone_number`,
            [adminId, jid, name, phone]
          );
        } catch (err) {
          console.error(`Error saving contact from chat ${jid} for Admin ID ${adminId}:`, err);
        }
      }
    }
  };

  // Handle incoming / synced contacts
  const handleContacts = async (contactsList) => {
    if (!contactsList || !Array.isArray(contactsList)) return;
    
    for (const contact of contactsList) {
      if (contact.id && contact.id.endsWith('@s.whatsapp.net')) {
        const jid = contact.id;
        const phone = jid.split('@')[0];
        
        // Priority: Name -> Verified Business Name -> Push Notification Name -> Phone number
        const name = contact.name || contact.verifiedName || contact.notify || phone;
        
        try {
          await db.run(
            `INSERT INTO whatsapp_contacts (admin_id, jid, name, phone_number, created_at) 
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(admin_id, jid) DO UPDATE SET name = excluded.name, phone_number = excluded.phone_number`,
            [adminId, jid, name, phone]
          );
        } catch (err) {
          console.error(`Error saving contact ${jid} for Admin ID ${adminId}:`, err);
        }
      }
    }
  };

  sock.ev.on('chats.set', async ({ chats }) => {
    console.log(`Received chats.set event for Admin ID ${adminId}. Total: ${chats?.length}`);
    await handleChats(chats);
  });

  sock.ev.on('chats.upsert', async (chats) => {
    console.log(`Received chats.upsert event for Admin ID ${adminId}. Total: ${chats?.length}`);
    await handleChats(chats);
  });

  sock.ev.on('chats.update', async (updates) => {
    for (const update of updates) {
      if (update.id && update.id.endsWith('@broadcast') && update.name) {
        try {
          await db.run(
            `UPDATE broadcast_lists SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE admin_id = ? AND jid = ?`,
            [update.name, adminId, update.id]
          );
        } catch (err) {
          console.error(`Error updating broadcast list name for ${update.id}:`, err);
        }
      }
    }
  });

  sock.ev.on('contacts.set', async ({ contacts }) => {
    console.log(`Received contacts.set event for Admin ID ${adminId}. Total: ${contacts?.length}`);
    await handleContacts(contacts);
  });

  sock.ev.on('contacts.upsert', async (contacts) => {
    console.log(`Received contacts.upsert event for Admin ID ${adminId}. Total: ${contacts?.length}`);
    await handleContacts(contacts);
  });

  sock.ev.on('contacts.update', async (updates) => {
    for (const update of updates) {
      if (update.id && update.id.endsWith('@s.whatsapp.net')) {
        const jid = update.id;
        const phone = jid.split('@')[0];
        const current = await db.get("SELECT name FROM whatsapp_contacts WHERE admin_id = ? AND jid = ?", [adminId, jid]);
        const newName = update.name || update.verifiedName || update.notify || (current ? current.name : phone);
        
        try {
          await db.run(
            `INSERT INTO whatsapp_contacts (admin_id, jid, name, phone_number) 
             VALUES (?, ?, ?, ?)
             ON CONFLICT(admin_id, jid) DO UPDATE SET name = excluded.name`,
            [adminId, jid, newName, phone]
          );
        } catch (err) {
          console.error(`Error updating contact ${jid}:`, err);
        }
      }
    }
  });

  sock.ev.on('messaging-history.set', async ({ chats, contacts }) => {
    console.log(`Received messaging-history.set event for Admin ID ${adminId}. Syncing chats and contacts...`);
    await handleChats(chats);
    await handleContacts(contacts);
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    if (!messages || !Array.isArray(messages)) return;
    for (const msg of messages) {
      if (msg.key && msg.key.id && msg.message) {
        // Skip protocol or sender key distribution messages to save space
        if (msg.message.protocolMessage || msg.message.senderKeyDistributionMessage) {
          continue;
        }
        try {
          await db.run(
            `INSERT INTO whatsapp_messages (msg_id, admin_id, remote_jid, message_json)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(msg_id) DO UPDATE SET message_json = excluded.message_json`,
            [msg.key.id, adminId, msg.key.remoteJid, JSON.stringify(msg.message)]
          );
        } catch (err) {
          console.error(`Error saving message ${msg.key.id} in messages.upsert:`, err);
        }
      }
    }
  });

  return sessions[adminId];
};

// Disconnect WhatsApp session
const disconnectWhatsApp = async (adminId) => {
  console.log(`Disconnecting WhatsApp for Admin ID: ${adminId}`);
  const session = sessions[adminId];
  if (session && session.sock) {
    try {
      await session.sock.logout();
    } catch (err) {
      console.error(`Error during socket logout for Admin ID ${adminId}:`, err);
      try {
        session.sock.end();
      } catch (e) {}
    }
  }

  // Clean up database session status
  await db.run(
    `UPDATE whatsapp_sessions SET status = 'disconnected', qr_code = NULL, updated_at = CURRENT_TIMESTAMP WHERE admin_id = ?`,
    [adminId]
  );

  // Clean up cache
  await db.run(`DELETE FROM broadcast_lists WHERE admin_id = ?`, [adminId]);
  await db.run(`DELETE FROM whatsapp_contacts WHERE admin_id = ?`, [adminId]);

  const authFolder = getAuthFolderPath(adminId);
  try {
    fs.rmSync(authFolder, { recursive: true, force: true });
  } catch (e) {
    console.error(`Failed to delete auth folder during disconnect for Admin ID ${adminId}:`, e);
  }

  delete sessions[adminId];
  return { success: true };
};

const sendMessage = async (adminId, broadcastJid, messageText) => {
  const session = sessions[adminId];
  if (!session || session.status !== 'connected' || !session.sock) {
    throw new Error('WhatsApp is not connected for this admin.');
  }

  try {
    // Intercept Custom Broadcast List JIDs
    if (broadcastJid.startsWith('custom_list_')) {
      const customListId = parseInt(broadcastJid.replace('custom_list_', ''), 10);
      
      // Fetch phone numbers in this custom list
      const numbers = await db.all(
        `SELECT phone_number FROM custom_broadcast_numbers WHERE broadcast_id = ?`,
        [customListId]
      );

      console.log(`[Custom Broadcast] Starting sending to ${numbers.length} recipients for Custom List ID ${customListId}`);
      
      // Send individual messages with safe throttle intervals
      for (const entry of numbers) {
        const recipientJid = `${entry.phone_number}@s.whatsapp.net`;
        try {
          const sentMsg = await session.sock.sendMessage(recipientJid, { text: messageText });
          console.log(`[Custom Broadcast] Message sent to ${recipientJid}`);
          if (sentMsg && sentMsg.key && sentMsg.message) {
            try {
              await db.run(
                `INSERT INTO whatsapp_messages (msg_id, admin_id, remote_jid, message_json)
                 VALUES (?, ?, ?, ?)
                 ON CONFLICT(msg_id) DO UPDATE SET message_json = excluded.message_json`,
                [sentMsg.key.id, adminId, recipientJid, JSON.stringify(sentMsg.message)]
              );
            } catch (dbErr) {
              console.error(`Failed to store custom broadcast message:`, dbErr);
            }
          }
        } catch (numErr) {
          console.error(`[Custom Broadcast] Error sending to ${recipientJid}:`, numErr.message);
        }
        // Delay 2.5 seconds to protect account
        await new Promise(resolve => setTimeout(resolve, 2500));
      }
      
      return { success: true };
    }

    // Normal WhatsApp Broadcast JID
    const sentMsg = await session.sock.sendMessage(
      broadcastJid,
      { text: messageText },
      { broadcast: true }
    );
    console.log(`Successfully sent native broadcast message to ${broadcastJid} for Admin ID ${adminId}`);
    if (sentMsg && sentMsg.key && sentMsg.message) {
      try {
        await db.run(
          `INSERT INTO whatsapp_messages (msg_id, admin_id, remote_jid, message_json)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(msg_id) DO UPDATE SET message_json = excluded.message_json`,
          [sentMsg.key.id, adminId, broadcastJid, JSON.stringify(sentMsg.message)]
        );
      } catch (dbErr) {
        console.error(`Failed to store sent broadcast message:`, dbErr);
      }
    }
    return { success: true };
  } catch (err) {
    console.error(`Error sending broadcast to ${broadcastJid} for Admin ID ${adminId}:`, err);
    throw err;
  }
};

// Get active session status
const getSessionStatus = async (adminId) => {
  // Try to load from DB first to get cached values
  const cached = await db.get(`SELECT * FROM whatsapp_sessions WHERE admin_id = ?`, [adminId]);
  
  if (sessions[adminId]) {
    // Sync DB status with active session if out of sync
    const active = sessions[adminId];
    return {
      status: active.status,
      qr_code: active.qr,
      phone_number: active.phoneNumber || (cached ? cached.phone_number : null),
      push_name: active.pushName || (cached ? cached.push_name : null)
    };
  }

  if (cached) {
    return {
      status: cached.status,
      qr_code: cached.qr_code,
      phone_number: cached.phone_number,
      push_name: cached.push_name
    };
  }

  return {
    status: 'disconnected',
    qr_code: null,
    phone_number: null,
    push_name: null
  };
};

// Reconnect all previously connected sessions on server start
const initAllSessions = async () => {
  try {
    const connectedSessions = await db.all(
      `SELECT admin_id FROM whatsapp_sessions WHERE status IN ('connected', 'connecting', 'qr_ready')`
    );
    console.log(`Found ${connectedSessions.length} previously active sessions to restore...`);
    for (const session of connectedSessions) {
      connectToWhatsApp(session.admin_id).catch(err => {
        console.error(`Failed to restore session for Admin ID ${session.admin_id}:`, err);
      });
    }
  } catch (err) {
    console.error('Error restoring active sessions:', err);
  }
};

module.exports = {
  connectToWhatsApp,
  disconnectWhatsApp,
  sendMessage,
  getSessionStatus,
  initAllSessions,
  sessions
};
