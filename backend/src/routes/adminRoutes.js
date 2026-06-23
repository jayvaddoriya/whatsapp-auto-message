const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes require super_admin role
router.use(authenticateToken, requireRole('super_admin'));

// GET    /api/super/admins
router.get('/admins', adminController.listAdmins);

// POST   /api/super/admins
router.post('/admins', adminController.createAdmin);

// PUT    /api/super/admins/:id
router.put('/admins/:id', adminController.updateAdmin);

// DELETE /api/super/admins/:id
router.delete('/admins/:id', adminController.deleteAdmin);

module.exports = router;
