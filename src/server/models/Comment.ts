import mongoose from "mongoose";
import type { Document, Model } from "mongoose";

export interface IComment extends Document {
  content: string;
  createdBy: mongoose.Types.ObjectId;
  tierId: string;
  classmateName: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tierId: {
      type: String,
      required: true,
    },
    classmateName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Comment: Model<IComment> = mongoose.models.Comment ?? mongoose.model<IComment>("Comment", commentSchema);
