import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
  tierId: string;
  classmateName: string;
}

const CommentSchema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  tierId: { type: String, required: true },
  classmateName: { type: String, required: true }
});

// Add type assertion for the model
const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
