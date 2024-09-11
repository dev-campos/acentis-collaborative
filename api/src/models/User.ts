import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
    _id: typeof mongoose.Schema.ObjectId
    email: string;
    password: string;
}

const UserSchema: Schema<IUser> = new Schema({
    _id: { type: mongoose.Schema.ObjectId, auto: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, {
    timestamps: true
});

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema)
