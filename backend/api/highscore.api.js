import express from "express";
import User from "./db/model/user.model.js";
import SudokuGame from "./db/model/sudoku.model.js";
import { getUsername, requireAuth } from "../middleware/auth.js";

const router = express.Router();

function isSolved(state, solution) {
  for (let i = 0; i < 81; i++) {
    if (state[i] !== solution[i] || state[i] === 0) return false;
  }
  return true;
}

async function recordWinIfSolved(game, username) {
  if (!isSolved(game.state, game.solution)) {
    return { ok: false, error: "Game is not completed." };
  }
  if (game.completedBy.includes(username)) {
    return { ok: true, already: true };
  }
  game.completedBy.push(username);
  await User.updateOne({ username }, { $inc: { wins: 1 } });
  await game.save();
  return { ok: true, already: false };
}

router.get("/", async function (req, res) {
  const rows = await User.find({ wins: { $gt: 0 } })
    .select("username wins")
    .lean();
  rows.sort(
    (a, b) => b.wins - a.wins || a.username.localeCompare(b.username),
  );
  res.json(
    rows.map((r) => ({ username: r.username, wins: r.wins })),
  );
});

router.get("/:gameId", async function (req, res) {
  const g = await SudokuGame.findById(req.params.gameId).lean();
  if (!g) {
    res.status(404).json({ error: "Not found." });
    return;
  }
  res.json({
    gameId: g._id.toString(),
    completedBy: g.completedBy,
  });
});

router.post("/", requireAuth, async function (req, res) {
  const gameId = req.body?.gameId;
  if (!gameId) {
    res.status(400).json({ error: "gameId is required." });
    return;
  }
  const game = await SudokuGame.findById(gameId);
  if (!game) {
    res.status(404).json({ error: "Game not found." });
    return;
  }
  const username = getUsername(req);
  const result = await recordWinIfSolved(game, username);
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json({ ok: true, already: result.already });
});

export default router;
