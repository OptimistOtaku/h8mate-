import mongoose from "mongoose";
import type { Document, Model } from "mongoose";

interface IPost extends Document {
  name: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Post: Model<IPost> = mongoose.models.Post ?? mongoose.model<IPost>("Post", postSchema); 