const { 
  default: makeWASocket, 
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcodeGenerator = require('qrcode');
const NodeCache = require('node-cache');

// MongoDB-backed auth state
const { useMongoDBAuthState, deleteAuthState } = require('../utils/useMongoDBAuthState');

// Mongoose Models
const WhatsappSession = require('../models/WhatsappSession');
const BroadcastList = require('../models/BroadcastList');
const WhatsappContact = require('../models/WhatsappContact');
const WhatsappMessage = require('../models/WhatsappMessage');
const CustomBroadcastNumber = require('../models/CustomBroadcastNumber');

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
  const { state, saveCreds } = await useMongoDBAuthState(adminId);

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
          const row = await WhatsappMessage.findOne({ msg_id: key.id });
          if (row && row.message_json) {
            return JSON.parse(row.message_json);
          }
        } catch (err) {
          console.error(`Error loading message for retry:`, err);
        }
      }
      return { conversation: 'Message decryption retry' };
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
  await WhatsappSession.findOneAndUpdate(
    { admin_id: adminId },
    { status: 'connecting', qr_code: null, updated_at: new Date() },
    { upsert: true }
  );

  // Setup credentials saving
  sock.ev.on('creds.update', saveCreds);

  // Handle connection updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(`QR Code generated for Admin ID: ${adminId}`);
      try {
        const qrDataUrl = await qrcodeGenerator.toDataURL(qr);
        sessions[adminId].qr = qrDataUrl;
        sessions[adminId].status = 'qr_ready';

        await WhatsappSession.findOneAndUpdate(
          { admin_id: adminId },
          { status: 'qr_ready', qr_code: qrDataUrl, updated_at: new Date() }
        );
      } catch (err) {
        console.error('Error generating QR code data URL:', err);
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      console.log(`Connection closed for Admin ID: ${adminId}. Reason code: ${statusCode}. Reconnecting: ${shouldReconnect}`);
      
      await WhatsappSession.findOneAndUpdate(
        { admin_id: adminId },
        { status: 'disconnected', qr_code: null, updated_at: new Date() }
      );
      
      if (sessions[adminId]) {
        sessions[adminId].status = 'disconnected';
        sessions[adminId].qr = null;
      }

      if (shouldReconnect) {
        setTimeout(() => {
          connectToWhatsApp(adminId).catch(err => console.error(`Error reconnecting Admin ID ${adminId}:`, err));
        }, 5000);
      } else {
        console.log(`Admin ID ${adminId} logged out. Deleting credentials from MongoDB.`);
        try {
          await deleteAuthState(adminId);
        } catch (e) {
          console.error(`Failed to delete auth state for Admin ID ${adminId}:`, e);
        }
        delete sessions[adminId];
        await BroadcastList.deleteMany({ admin_id: adminId });
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

      await WhatsappSession.findOneAndUpdate(
        { admin_id: adminId },
        { status: 'connected', qr_code: null, phone_number: phoneNumber, push_name: pushName, updated_at: new Date() }
      );
    }
  });

  // Handle incoming / synced chats to extract Broadcast Lists
  const handleChats = async (chatsList) => {
    if (!chatsList || !Array.isArray(chatsList)) return;
    
    for (const chat of chatsList) {
      if (chat.id && chat.id.endsWith('@broadcast') && chat.id !== 'status@broadcast') {
        const name = chat.name || chat.id.split('@')[0];
        const recipientCount = chat.participants ? chat.participants.length : 0;
        
        try {
          await BroadcastList.findOneAndUpdate(
            { admin_id: adminId, jid: chat.id },
            { name, recipient_count: recipientCount, updated_at: new Date() },
            { upsert: true }
          );
        } catch (err) {
          console.error(`Error saving broadcast list ${chat.id} for Admin ID ${adminId}:`, err);
        }
      } else if (chat.id && chat.id.endsWith('@s.whatsapp.net')) {
        const jid = chat.id;
        const phone = jid.split('@')[0];
        const name = chat.name || phone;
        
        try {
          await WhatsappContact.findOneAndUpdate(
            { admin_id: adminId, jid },
            { name, phone_number: phone },
            { upsert: true, setDefaultsOnInsert: true }
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
        const name = contact.name || contact.verifiedName || contact.notify || phone;
        
        try {
          await WhatsappContact.findOneAndUpdate(
            { admin_id: adminId, jid },
            { name, phone_number: phone },
            { upsert: true, setDefaultsOnInsert: true }
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
          await BroadcastList.findOneAndUpdate(
            { admin_id: adminId, jid: update.id },
            { name: update.name, updated_at: new Date() }
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
        const current = await WhatsappContact.findOne({ admin_id: adminId, jid });
        const newName = update.name || update.verifiedName || update.notify || (current ? current.name : phone);
        
        try {
          await WhatsappContact.findOneAndUpdate(
            { admin_id: adminId, jid },
            { name: newName, phone_number: phone },
            { upsert: true, setDefaultsOnInsert: true }
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
        if (msg.message.protocolMessage || msg.message.senderKeyDistributionMessage) {
          continue;
        }
        try {
          await WhatsappMessage.findOneAndUpdate(
            { msg_id: msg.key.id },
            { admin_id: adminId, remote_jid: msg.key.remoteJid, message_json: JSON.stringify(msg.message) },
            { upsert: true, setDefaultsOnInsert: true }
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
  await WhatsappSession.findOneAndUpdate(
    { admin_id: adminId },
    { status: 'disconnected', qr_code: null, updated_at: new Date() }
  );

  // Clean up cache
  await BroadcastList.deleteMany({ admin_id: adminId });
  await WhatsappContact.deleteMany({ admin_id: adminId });

  try {
    await deleteAuthState(adminId);
  } catch (e) {
    console.error(`Failed to delete auth state during disconnect for Admin ID ${adminId}:`, e);
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
      const customListId = broadcastJid.replace('custom_list_', '');
      
      // Fetch phone numbers in this custom list
      const numbers = await CustomBroadcastNumber.find({ broadcast_id: customListId });

      console.log(`[Custom Broadcast] Starting sending to ${numbers.length} recipients for Custom List ID ${customListId}`);
      
      // Send individual messages with safe throttle intervals
      for (const entry of numbers) {
        const recipientJid = `${entry.phone_number}@s.whatsapp.net`;
        try {
          const sentMsg = await session.sock.sendMessage(recipientJid, { text: messageText });
          console.log(`[Custom Broadcast] Message sent to ${recipientJid}`);
          if (sentMsg && sentMsg.key && sentMsg.message) {
            try {
              await WhatsappMessage.findOneAndUpdate(
                { msg_id: sentMsg.key.id },
                { admin_id: adminId, remote_jid: recipientJid, message_json: JSON.stringify(sentMsg.message) },
                { upsert: true, setDefaultsOnInsert: true }
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
        await WhatsappMessage.findOneAndUpdate(
          { msg_id: sentMsg.key.id },
          { admin_id: adminId, remote_jid: broadcastJid, message_json: JSON.stringify(sentMsg.message) },
          { upsert: true, setDefaultsOnInsert: true }
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
  const cached = await WhatsappSession.findOne({ admin_id: adminId });
  
  if (sessions[adminId]) {
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
    const connectedSessions = await WhatsappSession.find({
      status: { $in: ['connected', 'connecting', 'qr_ready'] }
    });
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
