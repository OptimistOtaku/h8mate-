import mongoose from "mongoose";
import type { Document, Model } from "mongoose";
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
    },
    image: {
      type: String,
    },
    password: { 
      type: String, 
      required: true 
    }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);
