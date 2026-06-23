require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../src/config/db');
const Admin = require('../src/models/Admin');
const { calculateNextRun } = require('../src/services/scheduler');

const runTests = async () => {
  console.log('=== STARTING BACKEND SANITY TESTS ===');
  
  try {
    // 1. Connect to MongoDB
    await connectDB();
    console.log('✓ Database connection successful.');

    // 2. Verify or Seed Super Admin
    let superAdmin = await Admin.findOne({ role: 'super_admin' });
    if (!superAdmin) {
      const hashedPassword = bcrypt.hashSync('superadmin123', 10);
      superAdmin = await Admin.create({
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: hashedPassword,
        enabled: true,
        role: 'super_admin'
      });
      console.log('✓ Default Super Admin seeded.');
    }

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
    await Admin.deleteOne({ email: testEmail });
    
    const hashedPassword = bcrypt.hashSync('testpass123', 10);
    const newAdmin = await Admin.create({
      name: 'Test Admin',
      email: testEmail,
      password: hashedPassword,
      enabled: true,
      role: 'admin'
    });
    console.log(`✓ Admin created successfully. Temp ID: ${newAdmin.id}`);

    const retrievedAdmin = await Admin.findById(newAdmin.id);
    if (retrievedAdmin.name !== 'Test Admin' || !retrievedAdmin.enabled) {
      throw new Error('Admin details mismatch after insertion.');
    }
    console.log('✓ Admin insertion details verified.');

    // Update admin
    await Admin.findByIdAndUpdate(newAdmin.id, { name: 'Updated Admin', enabled: false });
    const updatedAdmin = await Admin.findById(newAdmin.id);
    if (updatedAdmin.name !== 'Updated Admin' || updatedAdmin.enabled !== false) {
      throw new Error('Admin update failed.');
    }
    console.log('✓ Admin update details verified.');

    // 4. Test Schedule Calculations
    const baseTimeStr = '2026-06-19T12:00:00.000Z';
    
    const run5min = calculateNextRun(baseTimeStr, '5_min');
    console.log(`✓ Calculate Next Run (5 min): ${run5min.toISOString()} (Expected: 2026-06-19T12:05:00.000Z)`);
    if (run5min.toISOString() !== '2026-06-19T12:05:00.000Z') throw new Error('5_min calculation error');

    const runDaily = calculateNextRun(baseTimeStr, 'daily');
    console.log(`✓ Calculate Next Run (daily): ${runDaily.toISOString()} (Expected: 2026-06-20T12:00:00.000Z)`);
    if (runDaily.toISOString() !== '2026-06-20T12:00:00.000Z') throw new Error('daily calculation error');

    const runOnce = calculateNextRun(baseTimeStr, 'once');
    console.log(`✓ Calculate Next Run (once): ${runOnce} (Expected: null)`);
    if (runOnce !== null) throw new Error('once calculation error');

    // Clean up test admin
    await Admin.findByIdAndDelete(newAdmin.id);
    console.log('✓ Cleaned up temporary test admin.');

    console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST RUN ENCOUNTERED ERROR:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTests();
