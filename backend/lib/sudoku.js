const CONFIGS = {
  EASY:   { size: 6, boxRows: 2, boxCols: 3, targetClues: 18 },
  NORMAL: { size: 9, boxRows: 3, boxCols: 3, targetHoles: 50 },
  CUSTOM: { size: 9, boxRows: 3, boxCols: 3, targetHoles: 50 },
};

export function getConfig(difficulty) {
  return CONFIGS[difficulty] || CONFIGS.NORMAL;
}

function clone(b) {
  return b.slice();
}

function firstEmpty(b) {
  for (let i = 0; i < b.length; i++) if (b[i] === 0) return i;
  return -1;
}

export function isValidCell(board, pos, n, config) {
  const { size, boxRows, boxCols } = config;
  if (n < 1 || n > size) return false;
  const r = (pos / size) | 0;
  const c = pos % size;
  for (let j = 0; j < size; j++) {
    if (j !== c && board[r * size + j] === n) return false;
  }
  for (let k = 0; k < size; k++) {
    if (k !== r && board[k * size + c] === n) return false;
  }
  const br = Math.floor(r / boxRows) * boxRows;
  const bc = Math.floor(c / boxCols) * boxCols;
  for (let di = 0; di < boxRows; di++) {
    for (let dj = 0; dj < boxCols; dj++) {
      const p = (br + di) * size + (bc + dj);
      if (p !== pos && board[p] === n) return false;
    }
  }
  return true;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function solveFirst(board, config) {
  const p = firstEmpty(board);
  if (p < 0) return true;
  const { size } = config;
  for (const d of shuffle(Array.from({ length: size }, (_, i) => i + 1))) {
    if (isValidCell(board, p, d, config)) {
      board[p] = d;
      if (solveFirst(board, config)) return true;
      board[p] = 0;
    }
  }
  return false;
}

export function generateSolved(config) {
  const b = new Array(config.size * config.size).fill(0);
  solveFirst(b, config);
  return b;
}

export function countSolutions(board, config, cap = 2) {
  const b = clone(board);
  let total = 0;
  function dfs() {
    const p = firstEmpty(b);
    if (p < 0) {
      total++;
      return total >= cap;
    }
    for (let d = 1; d <= config.size; d++) {
      if (isValidCell(b, p, d, config)) {
        b[p] = d;
        if (dfs()) return true;
        b[p] = 0;
      }
    }
    return false;
  }
  dfs();
  return total;
}

function solutionForUniquePuzzle(puzzle, config) {
  if (countSolutions(puzzle, config, 2) !== 1) return null;
  const b2 = clone(puzzle);
  solveFirst(b2, config);
  return b2;
}

export function makePuzzleFromSolution(solution, targetHoles, config) {
  const puz = clone(solution);
  const order = shuffle([...Array(solution.length).keys()]);
  for (const pos of order) {
    const holes = puz.reduce((n, v) => n + (v === 0 ? 1 : 0), 0);
    if (holes >= targetHoles) break;
    if (puz[pos] === 0) continue;
    const keep = puz[pos];
    puz[pos] = 0;
    if (countSolutions(puz, config, 2) === 1) {
      continue;
    }
    puz[pos] = keep;
  }
  const given = puz.map((v) => v !== 0);
  return { puzzle: puz, given, solution: clone(solution) };
}

export function buildRandomGame(difficulty) {
  const config = getConfig(difficulty);
  const sol = generateSolved(config);
  const totalCells = config.size * config.size;
  const targetHoles =
    difficulty === "EASY"
      ? totalCells - config.targetClues
      : config.targetHoles;
  const { puzzle, given, solution } = makePuzzleFromSolution(sol, targetHoles, config);
  return { puzzle, given, solution, config };
}

export function validateCustomClues(raw) {
  const config = CONFIGS.NORMAL;
  const totalCells = config.size * config.size;
  if (!Array.isArray(raw) || raw.length !== totalCells) {
    return { ok: false, error: "Board must be 81 values." };
  }
  const cells = raw.map((v) => (typeof v === "number" && !Number.isNaN(v) ? v : 0));
  for (let i = 0; i < totalCells; i++) {
    const v = cells[i];
    if (v !== 0 && (v < 1 || v > config.size)) {
      return { ok: false, error: "Values must be 1 through 9 or 0 for empty." };
    }
  }
  for (let i = 0; i < totalCells; i++) {
    if (cells[i] === 0) continue;
    const v = cells[i];
    const t = cells[i];
    cells[i] = 0;
    if (!isValidCell(cells, i, v, config)) {
      cells[i] = t;
      return { ok: false, error: "Clues conflict with Sudoku rules." };
    }
    cells[i] = t;
  }
  const c = countSolutions(cells, config, 2);
  if (c === 0) return { ok: false, error: "No valid solution." };
  if (c > 1) return { ok: false, error: "Puzzle has more than one solution." };
  const sol = solutionForUniquePuzzle(cells, config);
  if (!sol) return { ok: false, error: "Could not derive unique solution." };
  const given = cells.map((v) => v !== 0);
  return { ok: true, puzzle: clone(cells), given, solution: sol };
}
