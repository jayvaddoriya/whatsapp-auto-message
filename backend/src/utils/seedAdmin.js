const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  const superAdmin = await Admin.findOne({ role: 'super_admin' });

  if (!superAdmin) {
    const defaultEmail = 'superadmin@example.com';
    const defaultPassword = 'superadmin123';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

    await Admin.create({
      name: 'Super Admin',
      email: defaultEmail,
      password: hashedPassword,
      enabled: true,
      role: 'super_admin'
    });

    console.log('--------------------------------------------------');
    console.log('Seeded default Super Admin:');
    console.log(`Email: ${defaultEmail}`);
    console.log(`Password: ${defaultPassword}`);
    console.log('--------------------------------------------------');
  } else {
    console.log('Super Admin already exists.');
  }
};

module.exports = seedAdmin;
