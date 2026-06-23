const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const whatsappService = require('../services/whatsapp');

// GET /api/super/admins
const listAdmins = async (req, res) => {
  const { search } = req.query;

  try {
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const adminsList = await Admin.find(query).select('-password').sort({ _id: -1 });
    res.json(adminsList);
  } catch (err) {
    console.error('List admins error:', err);
    res.status(500).json({ error: 'Failed to retrieve admins.' });
  }
};

// POST /api/super/admins
const createAdmin = async (req, res) => {
  const { name, email, password, enabled } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }

  try {
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const enabledVal = enabled === false ? false : true;

    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      enabled: enabledVal,
      role: 'admin'
    });

    res.status(201).json({
      message: 'Admin account created successfully.',
      id: newAdmin.id
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Failed to create admin.' });
  }
};

// PUT /api/super/admins/:id
const updateAdmin = async (req, res) => {
  const adminId = req.params.id;
  const { name, email, password, enabled } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    if (admin.role === 'super_admin' && req.user.id !== admin.id) {
      return res.status(403).json({ error: 'Cannot modify other Super Admins.' });
    }

    const emailCheck = await Admin.findOne({ email, _id: { $ne: adminId } });
    if (emailCheck) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    const enabledVal = enabled === false ? false : true;

    const updateData = { name, email, enabled: enabledVal };
    if (password) {
      updateData.password = bcrypt.hashSync(password, 10);
    }

    await Admin.findByIdAndUpdate(adminId, updateData);

    // If disabled, kill their WhatsApp session
    if (!enabledVal) {
      await whatsappService.disconnectWhatsApp(adminId).catch(() => {});
    }

    res.json({ message: 'Admin account updated successfully.' });
  } catch (err) {
    console.error('Update admin error:', err);
    res.status(500).json({ error: 'Failed to update admin.' });
  }
};

// DELETE /api/super/admins/:id
const deleteAdmin = async (req, res) => {
  const adminId = req.params.id;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    if (admin.role === 'super_admin') {
      return res.status(400).json({ error: 'Super Admin accounts cannot be deleted.' });
    }

    // Disconnect active WhatsApp session if any
    await whatsappService.disconnectWhatsApp(adminId).catch(() => {});

    // Delete admin
    await Admin.findByIdAndDelete(adminId);

    res.json({ message: 'Admin account deleted successfully.' });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ error: 'Failed to delete admin.' });
  }
};

module.exports = { listAdmins, createAdmin, updateAdmin, deleteAdmin };
