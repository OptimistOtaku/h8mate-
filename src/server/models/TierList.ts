import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ITier {
  id: string;
  items: string[];
}

export interface ITierList extends Document {
  tiers: ITier[];
  bin: string[];
  lastUpdated: Date;
}

const TierListSchema = new Schema({
  tiers: [{
    id: { type: String, required: true },
    items: [{ type: String }]
  }],
  bin: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now }
});

const TierList: Model<ITierList> = mongoose.models.TierList || mongoose.model<ITierList>('TierList', TierListSchema);

export default TierList;
