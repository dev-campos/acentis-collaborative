import mongoose, { Schema } from "mongoose";

const VersionSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  content: { type: Buffer, required: true },
  updatedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const DocumentSchema = new Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: Buffer, default: Buffer.from('') },
  versions: [VersionSchema],
  createdBy: { type: String, required: true }
}, { timestamps: true });

export const Document = mongoose.model('Document', DocumentSchema);
