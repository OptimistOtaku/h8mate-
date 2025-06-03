import mongoose from "mongoose";
import type { Document, Model } from "mongoose";

interface ITierList extends Document {
  tiers: Array<{
    name: string;
    items: string[];
  }>;
  bin: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const tierListSchema = new mongoose.Schema(
  {
    tiers: [{
      name: {
        type: String,
        required: true,
      },
      items: [{
        type: String,
      }],
    }],
    bin: [{
      type: String,
    }],
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

export const TierList: Model<ITierList> = mongoose.models.TierList ?? mongoose.model<ITierList>("TierList", tierListSchema);
