const express = require('express');
const router = express.Router();
const customBroadcastController = require('../controllers/customBroadcastController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET    /api/custom-broadcasts
router.get('/', customBroadcastController.list);

// POST   /api/custom-broadcasts
router.post('/', customBroadcastController.create);

// PUT    /api/custom-broadcasts/:id
router.put('/:id', customBroadcastController.update);

// DELETE /api/custom-broadcasts/:id
router.delete('/:id', customBroadcastController.remove);

module.exports = router;
