import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MongoDB URI is not defined in environment variables');
    throw new Error('MongoDB URI is not defined in environment variables');
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(uri);
    isConnected = true;
    console.log('Successfully connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
