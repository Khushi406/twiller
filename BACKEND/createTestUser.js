const mongoose = require('mongoose');
const User = require('./models/User');

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/twitter_clone');

    const testUser = new User({
      username: 'testuser123',
      email: 'test@example.com',
      phone: '+1234567890',
      password: 'hashedpassword123',
      isVerified: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log('📧 Email: test@example.com');
    console.log('📱 Phone: +1234567890');
    console.log('🔐 Password: hashedpassword123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
}

createTestUser();
