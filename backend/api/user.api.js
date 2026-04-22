import express from "express";
import User from "./db/model/user.model.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { getUsername, setUserCookie, clearUserCookie } from "../middleware/auth.js";

const router = express.Router();

function normalizeName(s) {
  return (s || "").trim().toLowerCase();
}

router.get("/isLoggedIn", function (req, res) {
  const name = getUsername(req);
  if (name) {
    res.json({ username: name });
  } else {
    res.status(200).json({ error: "Not logged in" });
  }
});

router.post("/register", async function (req, res) {
  const username = normalizeName(req.body?.username);
  const password = req.body?.password;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required." });
    return;
  }
  const existing = await User.findOne({ username });
  if (existing) {
    res.status(400).json({ error: "Username already exists." });
    return;
  }
  const passwordHash = await hashPassword(password);
  await User.create({ username, passwordHash });
  setUserCookie(res, username);
  res.json({ ok: true, username });
});

router.post("/login", async function (req, res) {
  const username = normalizeName(req.body?.username);
  const password = req.body?.password;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required." });
    return;
  }
  const user = await User.findOne({ username });
  if (!user) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }
  setUserCookie(res, username);
  res.json({ ok: true, username });
});

router.post("/logout", function (req, res) {
  clearUserCookie(res);
  res.json({ ok: true });
});

export default router;
