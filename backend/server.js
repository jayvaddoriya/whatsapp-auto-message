require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database');
const whatsapp = require('./whatsapp');
const scheduler = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_9876';

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden. Requires ${role} role.` });
    }
    next();
  };
};

// ==========================================
// 1. Authentication Endpoints
// ==========================================

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const admin = await db.get("SELECT * FROM admins WHERE email = ?", [email]);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!admin.enabled) {
      return res.status(403).json({ error: 'Your account is disabled. Contact Super Admin.' });
    }

    const validPassword = bcrypt.compareSync(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const admin = await db.get("SELECT id, name, email, enabled, role FROM admins WHERE id = ?", [req.user.id]);
    if (!admin) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (!admin.enabled) {
      return res.status(403).json({ error: 'Your account is disabled.' });
    }
    res.json({ user: admin });
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ==========================================
// 2. Super Admin - Admin Management Endpoints
// ==========================================

app.get('/api/super/admins', authenticateToken, requireRole('super_admin'), async (req, res) => {
  const { search } = req.query;
  try {
    let sql = "SELECT id, name, email, enabled, role, created_at FROM admins";
    let params = [];
    if (search) {
      sql += " WHERE name LIKE ? OR email LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += " ORDER BY id DESC";
    const adminsList = await db.all(sql, params);
    res.json(adminsList);
  } catch (err) {
    console.error('List admins error:', err);
    res.status(500).json({ error: 'Failed to retrieve admins.' });
  }
});

app.post('/api/super/admins', authenticateToken, requireRole('super_admin'), async (req, res) => {
  const { name, email, password, enabled } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }

  try {
    const existing = await db.get("SELECT id FROM admins WHERE email = ?", [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const enabledVal = enabled === false ? 0 : 1;

    const result = await db.run(
      "INSERT INTO admins (name, email, password, enabled, role) VALUES (?, ?, ?, ?, 'admin')",
      [name, email, hashedPassword, enabledVal]
    );

    res.status(201).json({
      message: 'Admin account created successfully.',
      id: result.lastID
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Failed to create admin.' });
  }
});

app.put('/api/super/admins/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
  const adminId = req.params.id;
  const { name, email, password, enabled } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    const admin = await db.get("SELECT * FROM admins WHERE id = ?", [adminId]);
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    if (admin.role === 'super_admin' && req.user.id !== admin.id) {
      return res.status(403).json({ error: 'Cannot modify other Super Admins.' });
    }

    const emailCheck = await db.get("SELECT id FROM admins WHERE email = ? AND id != ?", [email, adminId]);
    if (emailCheck) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    const enabledVal = enabled === false ? 0 : 1;

    if (password) {
      // Update with new password
      const hashedPassword = bcrypt.hashSync(password, 10);
      await db.run(
        "UPDATE admins SET name = ?, email = ?, password = ?, enabled = ? WHERE id = ?",
        [name, email, hashedPassword, enabledVal, adminId]
      );
    } else {
      // Update without password
      await db.run(
        "UPDATE admins SET name = ?, email = ?, enabled = ? WHERE id = ?",
        [name, email, enabledVal, adminId]
      );
    }

    // If disabled, kill their whatsapp session
    if (enabledVal === 0) {
      await whatsapp.disconnectWhatsApp(adminId).catch(() => {});
    }

    res.json({ message: 'Admin account updated successfully.' });
  } catch (err) {
    console.error('Update admin error:', err);
    res.status(500).json({ error: 'Failed to update admin.' });
  }
});

app.delete('/api/super/admins/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
  const adminId = req.params.id;

  try {
    const admin = await db.get("SELECT role FROM admins WHERE id = ?", [adminId]);
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    if (admin.role === 'super_admin') {
      return res.status(400).json({ error: 'Super Admin accounts cannot be deleted.' });
    }

    // Disconnect active WhatsApp session if any
    await whatsapp.disconnectWhatsApp(adminId).catch(() => {});

    // Delete admin (cascade will delete schedules, whatsapp_sessions, broadcast_lists)
    await db.run("DELETE FROM admins WHERE id = ?", [adminId]);

    res.json({ message: 'Admin account deleted successfully.' });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ error: 'Failed to delete admin.' });
  }
});

// ==========================================
// 3. Admin - WhatsApp QR & Status Endpoints
// ==========================================

app.get('/api/whatsapp/status', authenticateToken, async (req, res) => {
  try {
    const status = await whatsapp.getSessionStatus(req.user.id);
    res.json(status);
  } catch (err) {
    console.error('Get WA status error:', err);
    res.status(500).json({ error: 'Failed to retrieve WhatsApp status.' });
  }
});

app.post('/api/whatsapp/connect', authenticateToken, async (req, res) => {
  try {
    const status = await whatsapp.connectToWhatsApp(req.user.id);
    res.json({ message: 'Connection initialized.', status: status.status });
  } catch (err) {
    console.error('Connect WA error:', err);
    res.status(500).json({ error: 'Failed to connect to WhatsApp.' });
  }
});

app.post('/api/whatsapp/disconnect', authenticateToken, async (req, res) => {
  try {
    await whatsapp.disconnectWhatsApp(req.user.id);
    res.json({ message: 'WhatsApp disconnected and logged out.' });
  } catch (err) {
    console.error('Disconnect WA error:', err);
    res.status(500).json({ error: 'Failed to disconnect from WhatsApp.' });
  }
});

app.get('/api/whatsapp/broadcasts', authenticateToken, async (req, res) => {
  try {
    // Fetch custom broadcast groups (created manually in web console)
    const customLists = await db.all(
      `SELECT cb.id AS jid, cb.name, COUNT(cbn.id) AS recipient_count, 1 AS is_custom
       FROM custom_broadcasts cb
       LEFT JOIN custom_broadcast_numbers cbn ON cb.id = cbn.broadcast_id
       WHERE cb.admin_id = ?
       GROUP BY cb.id`,
      [req.user.id]
    );

    // Format custom lists JIDs as 'custom_list_<id>' so backend can identify them
    const formattedCustom = customLists.map(list => ({
      jid: `custom_list_${list.jid}`,
      name: list.name,
      recipient_count: list.recipient_count,
      is_custom: true
    }));
    
    // Sort by name
    formattedCustom.sort((a, b) => a.name.localeCompare(b.name));

    res.json(formattedCustom);
  } catch (err) {
    console.error('List broadcasts error:', err);
    res.status(500).json({ error: 'Failed to fetch broadcast lists.' });
  }
});

app.get('/api/whatsapp/contacts', authenticateToken, async (req, res) => {
  try {
    const contacts = await db.all(
      `SELECT jid, name, phone_number 
       FROM whatsapp_contacts 
       WHERE admin_id = ? 
       ORDER BY CASE WHEN name IS NULL OR name = '' THEN 1 ELSE 0 END, name ASC`,
      [req.user.id]
    );
    res.json(contacts);
  } catch (err) {
    console.error('List contacts error:', err);
    res.status(500).json({ error: 'Failed to fetch WhatsApp contacts.' });
  }
});

// ==========================================
// Admin - Custom Broadcast Groups Endpoints
// ==========================================

app.get('/api/custom-broadcasts', authenticateToken, async (req, res) => {
  const { search } = req.query;
  try {
    let sql = `
       SELECT cb.id, cb.name, COUNT(cbn.id) AS recipient_count, cb.created_at
       FROM custom_broadcasts cb
       LEFT JOIN custom_broadcast_numbers cbn ON cb.id = cbn.broadcast_id
       WHERE cb.admin_id = ?`;
    let params = [req.user.id];
    if (search) {
      sql += " AND cb.name LIKE ?";
      params.push(`%${search}%`);
    }
    sql += " GROUP BY cb.id ORDER BY cb.id DESC";
    const lists = await db.all(sql, params);
    
    // For each list, load its phone numbers
    for (let list of lists) {
      const numbers = await db.all(
        `SELECT phone_number FROM custom_broadcast_numbers WHERE broadcast_id = ?`,
        [list.id]
      );
      list.numbers = numbers.map(n => n.phone_number);
    }
    
    res.json(lists);
  } catch (err) {
    console.error('Fetch custom broadcasts error:', err);
    res.status(500).json({ error: 'Failed to fetch custom broadcasts.' });
  }
});

app.post('/api/custom-broadcasts', authenticateToken, async (req, res) => {
  const { name, numbers } = req.body;

  if (!name || !numbers || !Array.isArray(numbers)) {
    return res.status(400).json({ error: 'Name and numbers array are required.' });
  }

  try {
    // 1. Insert into custom_broadcasts
    const result = await db.run(
      `INSERT INTO custom_broadcasts (admin_id, name) VALUES (?, ?)`,
      [req.user.id, name]
    );
    const broadcastId = result.lastID;

    // 2. Insert numbers
    for (let number of numbers) {
      // Basic sanitization: strip non-digits
      const cleanNum = number.replace(/\D/g, '');
      if (cleanNum) {
        await db.run(
          `INSERT INTO custom_broadcast_numbers (broadcast_id, phone_number) VALUES (?, ?)`,
          [broadcastId, cleanNum]
        );
      }
    }

    res.status(201).json({
      message: 'Custom broadcast list created successfully.',
      id: broadcastId
    });
  } catch (err) {
    console.error('Create custom broadcast error:', err);
    res.status(500).json({ error: 'Failed to create custom broadcast list.' });
  }
});

app.delete('/api/custom-broadcasts/:id', authenticateToken, async (req, res) => {
  const listId = req.params.id;

  try {
    const result = await db.run(
      `DELETE FROM custom_broadcasts WHERE id = ? AND admin_id = ?`,
      [listId, req.user.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Custom list not found.' });
    }
    res.json({ message: 'Custom list deleted successfully.' });
  } catch (err) {
    console.error('Delete custom list error:', err);
    res.status(500).json({ error: 'Failed to delete custom list.' });
  }
});

app.put('/api/custom-broadcasts/:id', authenticateToken, async (req, res) => {
  const listId = req.params.id;
  const { name, numbers } = req.body;

  if (!name || !numbers || !Array.isArray(numbers)) {
    return res.status(400).json({ error: 'Name and numbers array are required.' });
  }

  try {
    // 1. Verify ownership
    const list = await db.get("SELECT id FROM custom_broadcasts WHERE id = ? AND admin_id = ?", [listId, req.user.id]);
    if (!list) {
      return res.status(404).json({ error: 'Custom list not found.' });
    }

    // 2. Update custom_broadcasts name
    await db.run("UPDATE custom_broadcasts SET name = ? WHERE id = ?", [name, listId]);

    // 3. Clear old numbers
    await db.run("DELETE FROM custom_broadcast_numbers WHERE broadcast_id = ?", [listId]);

    // 4. Insert new numbers
    for (let number of numbers) {
      const cleanNum = number.replace(/\D/g, '');
      if (cleanNum) {
        await db.run(
          "INSERT INTO custom_broadcast_numbers (broadcast_id, phone_number) VALUES (?, ?)",
          [listId, cleanNum]
        );
      }
    }

    res.json({ message: 'Custom broadcast list updated successfully.' });
  } catch (err) {
    console.error('Update custom broadcast error:', err);
    res.status(500).json({ error: 'Failed to update custom broadcast list.' });
  }
});

// ==========================================
// 4. Admin - Schedules Management Endpoints
// ==========================================

app.get('/api/schedules', authenticateToken, async (req, res) => {
  const { search } = req.query;
  try {
    let sql = "SELECT * FROM schedules WHERE admin_id = ?";
    let params = [req.user.id];
    if (search) {
      sql += " AND (broadcast_name LIKE ? OR broadcast_jid LIKE ? OR message LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += " ORDER BY id DESC";
    const schedulesList = await db.all(sql, params);
    res.json(schedulesList);
  } catch (err) {
    console.error('Get schedules error:', err);
    res.status(500).json({ error: 'Failed to retrieve schedules.' });
  }
});

app.post('/api/schedules', authenticateToken, async (req, res) => {
  const { broadcast_jid, broadcast_name, message, schedule_date, schedule_time, period } = req.body;

  if (!broadcast_jid || !broadcast_name || !message || !schedule_date || !schedule_time || !period) {
    return res.status(400).json({ error: 'All schedule details are required.' });
  }

  try {
    // Compute the next_run_at timestamp based on local date/time input
    // The format is YYYY-MM-DD and HH:MM
    const localDateTime = new Date(`${schedule_date}T${schedule_time}`);
    if (isNaN(localDateTime.getTime())) {
      return res.status(400).json({ error: 'Invalid schedule date or time format.' });
    }
    const nextRunAtISO = localDateTime.toISOString();

    const result = await db.run(
      `INSERT INTO schedules 
       (admin_id, broadcast_jid, broadcast_name, message, schedule_date, schedule_time, period, status, next_run_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [req.user.id, broadcast_jid, broadcast_name, message, schedule_date, schedule_time, period, nextRunAtISO]
    );

    res.status(201).json({
      message: 'Schedule created successfully.',
      id: result.lastID,
      next_run_at: nextRunAtISO
    });
  } catch (err) {
    console.error('Create schedule error:', err);
    res.status(500).json({ error: 'Failed to create schedule.' });
  }
});

app.put('/api/schedules/:id', authenticateToken, async (req, res) => {
  const scheduleId = req.params.id;
  const { message, schedule_date, schedule_time, period } = req.body;

  if (!message || !schedule_date || !schedule_time || !period) {
    return res.status(400).json({ error: 'Message, date, time and period are required.' });
  }

  try {
    const schedule = await db.get("SELECT * FROM schedules WHERE id = ? AND admin_id = ?", [scheduleId, req.user.id]);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found.' });
    }

    // Recompute next_run_at based on new schedule
    const localDateTime = new Date(`${schedule_date}T${schedule_time}`);
    if (isNaN(localDateTime.getTime())) {
      return res.status(400).json({ error: 'Invalid date or time format.' });
    }
    const nextRunAtISO = localDateTime.toISOString();

    // Reset status to pending so it evaluates next_run_at again
    await db.run(
      `UPDATE schedules 
       SET message = ?, schedule_date = ?, schedule_time = ?, period = ?, status = 'pending', next_run_at = ?, error_message = NULL 
       WHERE id = ? AND admin_id = ?`,
      [message, schedule_date, schedule_time, period, nextRunAtISO, scheduleId, req.user.id]
    );

    res.json({ message: 'Schedule updated successfully.', next_run_at: nextRunAtISO });
  } catch (err) {
    console.error('Update schedule error:', err);
    res.status(500).json({ error: 'Failed to update schedule.' });
  }
});

app.delete('/api/schedules/:id', authenticateToken, async (req, res) => {
  const scheduleId = req.params.id;

  try {
    const result = await db.run("DELETE FROM schedules WHERE id = ? AND admin_id = ?", [scheduleId, req.user.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Schedule not found.' });
    }
    res.json({ message: 'Schedule deleted successfully.' });
  } catch (err) {
    console.error('Delete schedule error:', err);
    res.status(500).json({ error: 'Failed to delete schedule.' });
  }
});

app.post('/api/schedules/:id/send-now', authenticateToken, async (req, res) => {
  const scheduleId = req.params.id;

  try {
    const schedule = await db.get("SELECT * FROM schedules WHERE id = ? AND admin_id = ?", [scheduleId, req.user.id]);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found.' });
    }

    console.log(`[Send-Now] Triggering immediate send for schedule ${scheduleId}`);
    
    // Call WhatsApp sender directly
    await whatsapp.sendMessage(req.user.id, schedule.broadcast_jid, schedule.message);

    const nowISO = new Date().toISOString();

    // If it's a one-time schedule, mark as sent. If recurring, calculate the NEXT run time based on when it was scheduled to run.
    if (schedule.period === 'once') {
      await db.run(
        `UPDATE schedules SET status = 'sent', last_run_at = ?, next_run_at = NULL, error_message = NULL WHERE id = ?`,
        [nowISO, scheduleId]
      );
    } else {
      // Push next run forward
      const nextRun = scheduler.calculateNextRun(new Date().toISOString(), schedule.period);
      await db.run(
        `UPDATE schedules SET status = 'active', last_run_at = ?, next_run_at = ?, error_message = NULL WHERE id = ?`,
        [nowISO, nextRun ? nextRun.toISOString() : null, scheduleId]
      );
    }

    res.json({ message: 'Message sent immediately.' });
  } catch (err) {
    console.error('Send now error:', err);
    res.status(500).json({ error: err.message || 'Failed to send immediately. Verify WhatsApp connection.' });
  }
});

const path = require('path');

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// ==========================================
// 5. Server Startup
// ==========================================

const startServer = async () => {
  try {
    // 1. Initialize SQLite Tables and Seed Default Super Admin
    await db.initDB();

    // 2. Start background scheduler cron job
    scheduler.startScheduler();

    // 3. Restore any previously active WhatsApp connections
    await whatsapp.initAllSessions();

    // 4. Start listening
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`Server running on port ${PORT}...`);
      console.log(`==================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
