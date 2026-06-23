const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET  /api/whatsapp/status
router.get('/status', whatsappController.getStatus);

// POST /api/whatsapp/connect
router.post('/connect', whatsappController.connect);

// POST /api/whatsapp/disconnect
router.post('/disconnect', whatsappController.disconnect);

// GET  /api/whatsapp/broadcasts
router.get('/broadcasts', whatsappController.getBroadcasts);

// GET  /api/whatsapp/contacts
router.get('/contacts', whatsappController.getContacts);

module.exports = router;
