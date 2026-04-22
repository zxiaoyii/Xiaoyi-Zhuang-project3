import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import userRouter from "./api/user.api.js";
import sudokuRouter from "./api/sudoku.api.js";
import highscoreRouter from "./api/highscore.api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const COOKIE_SECRET = process.env.COOKIE_SECRET || "dev-cookie-secret-change-me";
const MONGODB_URL =
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL ||
  "mongodb://127.0.0.1:27017/sudokuapp";

app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(MONGODB_URL);
const db = mongoose.connection;
db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

app.use("/api/user", userRouter);
app.use("/api/sudoku", sudokuRouter);
app.use("/api/highscore", highscoreRouter);

const frontend_dir = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontend_dir));

app.get("*", function (req, res) {
  res.sendFile(path.join(frontend_dir, "index.html"));
});

const port = Number(process.env.PORT) || 8000;
app.listen(port, function () {
  console.log("Starting server now...");
});
