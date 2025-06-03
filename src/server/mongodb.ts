import mongoose from 'mongoose';
import { env } from "../env";

let isConnected = false;

export const db = mongoose.connection;

export async function connectToDatabase() {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}
