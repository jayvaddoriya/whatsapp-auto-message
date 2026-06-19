const db = require('./database');
const bcrypt = require('bcryptjs');
const scheduler = require('./scheduler');

const runTests = async () => {
  console.log('=== STARTING BACKEND SANITY TESTS ===');
  
  try {
    // 1. Initialize DB
    await db.initDB();
    console.log('✓ Database initialization successful.');

    // 2. Verify Super Admin Seed
    const superAdmin = await db.get("SELECT * FROM admins WHERE role = 'super_admin'");
    if (superAdmin && superAdmin.email === 'superadmin@example.com') {
      console.log('✓ Default Super Admin found in database.');
      const passMatch = bcrypt.compareSync('superadmin123', superAdmin.password);
      console.log(`✓ Password hashing match check: ${passMatch ? 'PASSED' : 'FAILED'}`);
      if (!passMatch) throw new Error('Password mismatch');
    } else {
      throw new Error('Super Admin not seeded or incorrect.');
    }

    // 3. Test Admin Creation & Mutation
    const testEmail = 'temp-admin@example.com';
    // Clean up if old test exists
    await db.run("DELETE FROM admins WHERE email = ?", [testEmail]);
    
    const hashedPassword = bcrypt.hashSync('testpass123', 10);
    const insertResult = await db.run(
      "INSERT INTO admins (name, email, password, enabled, role) VALUES (?, ?, ?, ?, 'admin')",
      ['Test Admin', testEmail, hashedPassword, 1]
    );
    const newAdminId = insertResult.lastID;
    console.log(`✓ Admin created successfully. Temp ID: ${newAdminId}`);

    const retrievedAdmin = await db.get("SELECT * FROM admins WHERE id = ?", [newAdminId]);
    if (retrievedAdmin.name !== 'Test Admin' || retrievedAdmin.enabled !== 1) {
      throw new Error('Admin details mismatch after insertion.');
    }
    console.log('✓ Admin insertion details verified.');

    // Update admin
    await db.run("UPDATE admins SET name = 'Updated Admin', enabled = 0 WHERE id = ?", [newAdminId]);
    const updatedAdmin = await db.get("SELECT * FROM admins WHERE id = ?", [newAdminId]);
    if (updatedAdmin.name !== 'Updated Admin' || updatedAdmin.enabled !== 0) {
      throw new Error('Admin update failed.');
    }
    console.log('✓ Admin update details verified.');

    // 4. Test Schedule Calculations
    const baseTimeStr = '2026-06-19T12:00:00.000Z';
    
    const run5min = scheduler.calculateNextRun(baseTimeStr, '5_min');
    console.log(`✓ Calculate Next Run (5 min): ${run5min.toISOString()} (Expected: 2026-06-19T12:05:00.000Z)`);
    if (run5min.toISOString() !== '2026-06-19T12:05:00.000Z') throw new Error('5_min calculation error');

    const runDaily = scheduler.calculateNextRun(baseTimeStr, 'daily');
    console.log(`✓ Calculate Next Run (daily): ${runDaily.toISOString()} (Expected: 2026-06-20T12:00:00.000Z)`);
    if (runDaily.toISOString() !== '2026-06-20T12:00:00.000Z') throw new Error('daily calculation error');

    const runOnce = scheduler.calculateNextRun(baseTimeStr, 'once');
    console.log(`✓ Calculate Next Run (once): ${runOnce} (Expected: null)`);
    if (runOnce !== null) throw new Error('once calculation error');

    // Clean up test admin
    await db.run("DELETE FROM admins WHERE id = ?", [newAdminId]);
    console.log('✓ Cleaned up temporary test admin.');

    console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST RUN ENCOUNTERED ERROR:', err);
    process.exit(1);
  }
};

runTests();
