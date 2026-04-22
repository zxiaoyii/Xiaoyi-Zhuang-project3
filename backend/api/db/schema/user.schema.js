import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  wins: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default userSchema;
