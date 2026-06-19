const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Promisified database helpers
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

// Initialize database tables
const initDB = async () => {
  console.log('Initializing SQLite Database...');
  
  // Create Admins table
  await run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      role TEXT CHECK(role IN ('super_admin', 'admin')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create WhatsApp Sessions table
  await run(`
    CREATE TABLE IF NOT EXISTS whatsapp_sessions (
      admin_id INTEGER PRIMARY KEY,
      status TEXT DEFAULT 'disconnected',
      qr_code TEXT,
      phone_number TEXT,
      push_name TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE
    )
  `);

  // Create Broadcast Lists cache table
  await run(`
    CREATE TABLE IF NOT EXISTS broadcast_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      jid TEXT NOT NULL,
      name TEXT NOT NULL,
      recipient_count INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE,
      UNIQUE(admin_id, jid)
    )
  `);

  // Create Schedules table
  await run(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      broadcast_jid TEXT NOT NULL,
      broadcast_name TEXT NOT NULL,
      message TEXT NOT NULL,
      schedule_date TEXT NOT NULL,
      schedule_time TEXT NOT NULL,
      period TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      next_run_at TEXT,
      last_run_at TEXT,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE
    )
  `);

  // Create Custom Broadcasts table
  await run(`
    CREATE TABLE IF NOT EXISTS custom_broadcasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE
    )
  `);

  // Create Custom Broadcast Numbers table
  await run(`
    CREATE TABLE IF NOT EXISTS custom_broadcast_numbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      broadcast_id INTEGER,
      phone_number TEXT NOT NULL,
      FOREIGN KEY(broadcast_id) REFERENCES custom_broadcasts(id) ON DELETE CASCADE
    )
  `);

  // Create WhatsApp Contacts table
  await run(`
    CREATE TABLE IF NOT EXISTS whatsapp_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      jid TEXT NOT NULL,
      name TEXT,
      phone_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE,
      UNIQUE(admin_id, jid)
    )
  `);

  // Create WhatsApp Messages table
  await run(`
    CREATE TABLE IF NOT EXISTS whatsapp_messages (
      msg_id TEXT PRIMARY KEY,
      admin_id INTEGER,
      remote_jid TEXT NOT NULL,
      message_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE
    )
  `);

  // Seed default super admin if none exists
  const superAdmin = await get("SELECT * FROM admins WHERE role = 'super_admin'");
  if (!superAdmin) {
    const defaultEmail = 'superadmin@example.com';
    const defaultPassword = 'superadmin123';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
    
    await run(
      "INSERT INTO admins (name, email, password, enabled, role) VALUES (?, ?, ?, ?, ?)",
      ['Super Admin', defaultEmail, hashedPassword, 1, 'super_admin']
    );
    console.log('--------------------------------------------------');
    console.log('Seeded default Super Admin:');
    console.log(`Email: ${defaultEmail}`);
    console.log(`Password: ${defaultPassword}`);
    console.log('--------------------------------------------------');
  } else {
    console.log('Super Admin already exists.');
  }
};

module.exports = {
  db,
  run,
  all,
  get,
  initDB
};
