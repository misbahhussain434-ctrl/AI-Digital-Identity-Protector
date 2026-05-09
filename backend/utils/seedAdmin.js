require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

async function seedAdmin() {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@identityprotector.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log('Admin account already exists.');
  } else {
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.log(`Admin account created: ${adminEmail}`);
  }

  const testEmail = 'testuser@example.com';
  const existingTest = await User.findOne({ email: testEmail });

  if (!existingTest) {
    await User.create({
      name: 'Test User',
      email: testEmail,
      password: 'Test@123456',
      role: 'user',
    });
    console.log(`Test user created: ${testEmail}`);
  } else {
    console.log('Test user already exists.');
  }

  console.log('\nSample test accounts:');
  console.log('  Admin: admin@identityprotector.com / Admin@123456');
  console.log('  User:  testuser@example.com / Test@123456');

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
