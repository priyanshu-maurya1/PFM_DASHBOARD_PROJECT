import mongoose from 'mongoose';

/**
 * Connect to MongoDB with a retry loop instead of exiting the process.
 * This prevents the whole server from crashing if the DB is temporarily
 * unreachable (useful in local dev or when network hiccups occur).
 */
const connectDB = async () => {
const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.warn('No MONGODB_URI provided; skipping MongoDB connection');
    return;
  }

  const connectWithRetry = async (attempt = 0) => {
    try {
      const conn = await mongoose.connect(uri, {
        // short server selection timeout so failures surface quickly and we can retry
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error) {
      console.error('Database connection error:', error);
      // don't exit; retry with backoff
      const delay = Math.min(30000, 2000 * (attempt + 1));
      console.log(`Retrying MongoDB connection in ${delay / 1000}s (attempt ${attempt + 1})`);
      setTimeout(() => connectWithRetry(attempt + 1), delay);
    }
  };

  connectWithRetry();

  mongoose.connection.on('connected', () => {
    console.log('Mongoose event: connected');
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose event: disconnected');
  });
  mongoose.connection.on('reconnected', () => {
    console.log('Mongoose event: reconnected');
  });
};

export default connectDB;