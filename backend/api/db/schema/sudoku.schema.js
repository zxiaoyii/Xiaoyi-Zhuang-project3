import mongoose from "mongoose";

const sudokuSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  difficulty: {
    type: String,
    required: true,
    enum: ["EASY", "NORMAL", "CUSTOM"],
  },
  createdBy: { type: String, required: true, trim: true, lowercase: true },
  puzzle: { type: [Number], required: true },
  solution: { type: [Number], required: true },
  given: { type: [Boolean], required: true },
  state: { type: [Number], required: true },
  completedBy: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default sudokuSchema;
