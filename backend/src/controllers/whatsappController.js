const whatsappService = require('../services/whatsapp');
const CustomBroadcast = require('../models/CustomBroadcast');
const CustomBroadcastNumber = require('../models/CustomBroadcastNumber');
const WhatsappContact = require('../models/WhatsappContact');
const BroadcastList = require('../models/BroadcastList');

// GET /api/whatsapp/status
const getStatus = async (req, res) => {
  try {
    const status = await whatsappService.getSessionStatus(req.user.id);
    res.json(status);
  } catch (err) {
    console.error('Get WA status error:', err);
    res.status(500).json({ error: 'Failed to retrieve WhatsApp status.' });
  }
};

// POST /api/whatsapp/connect
const connect = async (req, res) => {
  try {
    const status = await whatsappService.connectToWhatsApp(req.user.id);
    res.json({ message: 'Connection initialized.', status: status.status });
  } catch (err) {
    console.error('Connect WA error:', err);
    res.status(500).json({ error: 'Failed to connect to WhatsApp.' });
  }
};

// POST /api/whatsapp/disconnect
const disconnect = async (req, res) => {
  try {
    await whatsappService.disconnectWhatsApp(req.user.id);
    res.json({ message: 'WhatsApp disconnected and logged out.' });
  } catch (err) {
    console.error('Disconnect WA error:', err);
    res.status(500).json({ error: 'Failed to disconnect from WhatsApp.' });
  }
};

// GET /api/whatsapp/broadcasts
const getBroadcasts = async (req, res) => {
  try {
    // 1. Fetch custom broadcast groups (created manually in web console)
    const customLists = await CustomBroadcast.find({ admin_id: req.user.id });

    // Build formatted list with recipient counts
    const formattedCustom = [];
    for (const cb of customLists) {
      const recipientCount = await CustomBroadcastNumber.countDocuments({ broadcast_id: cb._id });
      formattedCustom.push({
        jid: `custom_list_${cb._id}`,
        name: cb.name,
        recipient_count: recipientCount,
        is_custom: true
      });
    }

    // 2. Fetch native WhatsApp broadcast lists
    const nativeLists = await BroadcastList.find({ admin_id: req.user.id });
    const formattedNative = nativeLists.map(nl => ({
      jid: nl.jid,
      name: nl.name,
      recipient_count: nl.recipient_count || 0,
      is_custom: false
    }));

    // Merge both
    const allBroadcasts = [...formattedCustom, ...formattedNative];

    // Sort by name
    allBroadcasts.sort((a, b) => a.name.localeCompare(b.name));

    res.json(allBroadcasts);
  } catch (err) {
    console.error('List broadcasts error:', err);
    res.status(500).json({ error: 'Failed to fetch broadcast lists.' });
  }
};

// GET /api/whatsapp/contacts
const getContacts = async (req, res) => {
  try {
    const contacts = await WhatsappContact.find({ admin_id: req.user.id })
      .sort({ name: 1 })
      .select('jid name phone_number');

    res.json(contacts);
  } catch (err) {
    console.error('List contacts error:', err);
    res.status(500).json({ error: 'Failed to fetch WhatsApp contacts.' });
  }
};

module.exports = { getStatus, connect, disconnect, getBroadcasts, getContacts };
