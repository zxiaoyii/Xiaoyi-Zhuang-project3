import express from "express";
import SudokuGame from "./db/model/sudoku.model.js";
import User from "./db/model/user.model.js";
import { getUsername, requireAuth } from "../middleware/auth.js";
import { randomGameName } from "../lib/names.js";
import { buildRandomGame, validateCustomClues } from "../lib/sudoku.js";

const router = express.Router();

function isSolved(state, solution) {
  if (state.length !== solution.length) return false;
  for (let i = 0; i < solution.length; i++) {
    if (state[i] !== solution[i] || state[i] === 0) return false;
  }
  return true;
}

async function markCompletedIfNeeded(game, username) {
  if (!username) return { completed: false, already: false };
  if (!isSolved(game.state, game.solution)) {
    return { completed: false, already: false };
  }
  if (game.completedBy.includes(username)) {
    return { completed: true, already: true };
  }
  game.completedBy.push(username);
  await User.updateOne({ username }, { $inc: { wins: 1 } });
  return { completed: true, already: false };
}

function jsonGame(g, username) {
  const viewerDone = username && g.completedBy.includes(username);
  const base = {
    id: g._id.toString(),
    name: g.name,
    difficulty: g.difficulty,
    size:    g.size    ?? 9,
    boxRows: g.boxRows ?? 3,
    boxCols: g.boxCols ?? 3,
    createdBy: g.createdBy,
    createdAt: g.createdAt,
    given: g.given,
    state: g.state,
    puzzle: g.puzzle,
    viewerCompleted: !!viewerDone,
  };
  if (viewerDone) {
    return { ...base, solution: g.solution };
  }
  return base;
}

router.get("/", async function (req, res) {
  const list = await SudokuGame.find()
    .sort({ createdAt: -1 })
    .select("name difficulty createdBy createdAt")
    .lean();
  res.json(
    list.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      difficulty: r.difficulty,
      createdBy: r.createdBy,
      createdAt: r.createdAt,
    })),
  );
});

router.post("/", requireAuth, async function (req, res) {
  const diff = (req.body?.difficulty || "").toUpperCase();
  if (diff !== "EASY" && diff !== "NORMAL") {
    res.status(400).json({ error: "difficulty must be EASY or NORMAL." });
    return;
  }
  const createdBy = getUsername(req);
  let name;
  for (let k = 0; k < 30; k++) {
    const candidate = randomGameName();
    const exists = await SudokuGame.findOne({ name: candidate });
    if (!exists) {
      name = candidate;
      break;
    }
  }
  if (!name) {
    res.status(500).json({ error: "Could not generate a unique name." });
    return;
  }
  const { puzzle, given, solution, config } = buildRandomGame(diff);
  const state = puzzle.slice();
  const doc = await SudokuGame.create({
    name,
    difficulty: diff,
    size:    config.size,
    boxRows: config.boxRows,
    boxCols: config.boxCols,
    createdBy,
    puzzle,
    solution,
    given,
    state,
    completedBy: [],
  });
  res.json({ gameId: doc._id.toString() });
});

router.post("/custom", requireAuth, async function (req, res) {
  const createdBy = getUsername(req);
  const body = req.body?.board ?? req.body?.cells;
  const result = validateCustomClues(body);
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }
  const { puzzle, given, solution } = result;
  let name;
  for (let k = 0; k < 30; k++) {
    const candidate = randomGameName();
    const exists = await SudokuGame.findOne({ name: candidate });
    if (!exists) {
      name = candidate;
      break;
    }
  }
  if (!name) {
    res.status(500).json({ error: "Could not generate a unique name." });
    return;
  }
  const state = puzzle.slice();
  const doc = await SudokuGame.create({
    name,
    difficulty: "CUSTOM",
    createdBy,
    puzzle,
    solution,
    given,
    state,
    completedBy: [],
  });
  res.json({ gameId: doc._id.toString() });
});

router.get("/:id", async function (req, res) {
  const g = await SudokuGame.findById(req.params.id);
  if (!g) {
    res.status(404).json({ error: "Game not found." });
    return;
  }
  const u = getUsername(req);
  res.json(jsonGame(g, u));
});

router.put("/:id", requireAuth, async function (req, res) {
  const g = await SudokuGame.findById(req.params.id);
  if (!g) {
    res.status(404).json({ error: "Game not found." });
    return;
  }
  const username = getUsername(req);
  const next = req.body?.state;
  const totalCells = (g.size ?? 9) * (g.size ?? 9);
  if (!Array.isArray(next) || next.length !== totalCells) {
    res.status(400).json({ error: `state must be an array of ${totalCells} numbers.` });
    return;
  }
  for (let i = 0; i < 81; i++) {
    if (g.given[i] && next[i] !== g.puzzle[i]) {
      res.status(400).json({ error: "Fixed cells may not be changed." });
      return;
    }
  }
  g.state = next;
  const status = await markCompletedIfNeeded(g, username);
  await g.save();
  res.json({
    ok: true,
    state: g.state,
    completed: status.completed,
    alreadyCompleted: status.already,
  });
});

router.delete("/:id", requireAuth, async function (req, res) {
  const g = await SudokuGame.findById(req.params.id);
  if (!g) {
    res.status(404).json({ error: "Game not found." });
    return;
  }
  const username = getUsername(req);
  if (g.createdBy !== username) {
    res.status(403).json({ error: "Only the creator can delete this game." });
    return;
  }
  for (const u of g.completedBy) {
    await User.updateOne(
      { username: u, wins: { $gt: 0 } },
      { $inc: { wins: -1 } },
    );
  }
  await SudokuGame.deleteOne({ _id: g._id });
  res.json({ ok: true });
});

export default router;
