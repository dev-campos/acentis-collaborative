import mongoose, { Schema } from "mongoose";

const VersionSchema = new Schema({
  content: { type: Buffer, required: true },
  updatedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const DocumentSchema = new Schema({
  title: { type: String, required: true },
  content: { type: Buffer, default: Buffer.from('') },
  versions: [VersionSchema],
  createdBy: { type: String, required: true }
}, { timestamps: true });

DocumentSchema.pre('save', function (next) {
  if (!this.title) {
    this.title = this._id.toString();
  }
  next();
});

export const Document = mongoose.model('Document', DocumentSchema);
