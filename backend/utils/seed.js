import bcrypt from 'bcrypt';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const seedTestUser = async () => {
  try {
    const email = 'test@gjglobal.com';
    const username = 'testuser';
    const password = 'password123';

    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
      
      // 🔧 Add sample transactions if user exists but has no data
      if (!existingUser.transactions || existingUser.transactions.length === 0) {
        await existingUser.updateOne({
          $set: {
            transactions: [
              { amount: 1500, category: 'Salary', date: new Date(Date.now() - 3*24*60*60*1000), description: 'Monthly Salary' },
              { amount: -250, category: 'Groceries', date: new Date(Date.now() - 2*24*60*60*1000), description: 'Weekly Grocery' },
              { amount: -75, category: 'Transport', date: new Date(Date.now() - 1*24*60*60*1000), description: 'Uber Ride' },
              { amount: -120, category: 'Dining', date: new Date(), description: 'Lunch at Cafe' },
              { amount: -45, category: 'Coffee', date: new Date(Date.now() - 5*60*60*1000), description: 'Morning Coffee' }
            ]
          }
        });
        console.log('✅ Added sample transactions for test user');
      }
      return { seeded: false, transactionsAdded: true };
    }

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      transactions: [
        { amount: 1500, category: 'Salary', date: new Date(Date.now() - 3*24*60*60*1000), description: 'Monthly Salary' },
        { amount: -250, category: 'Groceries', date: new Date(Date.now() - 2*24*60*60*1000), description: 'Weekly Grocery' },
        { amount: -75, category: 'Transport', date: new Date(Date.now() - 1*24*60*60*1000), description: 'Uber Ride' },
        { amount: -120, category: 'Dining', date: new Date(), description: 'Lunch at Cafe' },
        { amount: -45, category: 'Coffee', date: new Date(Date.now() - 5*60*60*1000), description: 'Morning Coffee' }
      ]
    });

    await user.save();
    console.log('✅ Test user seeded with transactions:', user.email);
    console.log('📧 Login: test@gjglobal.com / password123');
    return { seeded: true, user };
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    return { seeded: false, error: error.message };
  }
};

