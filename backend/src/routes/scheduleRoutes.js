const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET    /api/schedules
router.get('/', scheduleController.list);

// POST   /api/schedules
router.post('/', scheduleController.create);

// PUT    /api/schedules/:id
router.put('/:id', scheduleController.update);

// DELETE /api/schedules/:id
router.delete('/:id', scheduleController.remove);

// POST   /api/schedules/:id/send-now
router.post('/:id/send-now', scheduleController.sendNow);

module.exports = router;
