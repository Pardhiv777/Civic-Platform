require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Issue = require('./models/Issue');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding database...');

  // Clear existing data
  await User.deleteMany({});
  await Issue.deleteMany({});

  // Create admin user
  const admin = await User.create({
    name: 'Admin Official',
    email: 'admin@civic.gov',
    password: 'Admin@123',
    role: 'admin',
  });

  // Create citizen user
  const citizen = await User.create({
    name: 'Ravi Kumar',
    email: 'citizen@test.com',
    password: 'Test@123',
    role: 'citizen',
  });

  // Sample issues
  const sampleIssues = [
    {
      title: 'Large pothole on MG Road near junction',
      description: 'There is a massive pothole near the main junction of MG Road that has caused multiple accidents. Immediate repair needed.',
      category: 'Road',
      status: 'Open',
      location: { lat: 12.9716, lng: 77.5946, address: 'MG Road, Bengaluru' },
      photoURL: null,
      submittedBy: citizen._id,
    },
    {
      title: 'Water supply cut for 3 days in Sector 12',
      description: 'Residents of Sector 12 have been without water for 3 consecutive days. The main pipeline seems to have burst near the park.',
      category: 'Water',
      status: 'In Progress',
      location: { lat: 28.6139, lng: 77.2090, address: 'Sector 12, New Delhi' },
      photoURL: null,
      submittedBy: citizen._id,
    },
    {
      title: 'Street lights not working on Nehru Street',
      description: 'All 8 street lights on Nehru Street have been non-functional for over a week, creating unsafe conditions at night.',
      category: 'Electricity',
      status: 'Resolved',
      location: { lat: 19.0760, lng: 72.8777, address: 'Nehru Street, Mumbai' },
      photoURL: null,
      submittedBy: citizen._id,
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      title: 'Overflowing garbage bin at Main Market',
      description: 'The garbage collection bin at Main Market has been overflowing for 5 days. Waste is spreading on the road and causing hygiene issues.',
      category: 'Garbage',
      status: 'Open',
      location: { lat: 17.3850, lng: 78.4867, address: 'Main Market, Hyderabad' },
      photoURL: null,
      submittedBy: citizen._id,
    },
    {
      title: 'Road flooded after rain near bridge',
      description: 'The road near the old bridge gets completely flooded after every rain. The drainage system seems to be blocked.',
      category: 'Road',
      status: 'In Progress',
      location: { lat: 13.0827, lng: 80.2707, address: 'Bridge Road, Chennai' },
      photoURL: null,
      submittedBy: citizen._id,
    },
  ];

  await Issue.insertMany(sampleIssues);

  console.log('✅ Seed complete!');
  console.log('');
  console.log('👤 Admin credentials:');
  console.log('   Email:    admin@civic.gov');
  console.log('   Password: Admin@123');
  console.log('');
  console.log('👤 Citizen credentials:');
  console.log('   Email:    citizen@test.com');
  console.log('   Password: Test@123');
  console.log('');

  mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
