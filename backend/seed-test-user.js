import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/database.js';

dotenv.config();

const seedTestUser = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    const email = 'test@gjglobal.com';
    const username = 'testuser';
    const password = 'test123';

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('Test user already exists:', existingUser.username);
      process.exit(0);
    }

const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isEmailVerified: true
    });

    console.log('✅ Test user created:');
    console.log(`Email: ${email}`);
    console.log(`Username: testuser`);
    console.log(`Password: test123`);
    console.log('Login with these credentials!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedTestUser();

