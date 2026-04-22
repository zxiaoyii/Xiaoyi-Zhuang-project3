function clone(b) {
  return b.slice();
}

function firstEmpty(b) {
  for (let i = 0; i < 81; i++) if (b[i] === 0) return i;
  return -1;
}

export function isValidCell(board, pos, n) {
  if (n < 1 || n > 9) return false;
  const r = (pos / 9) | 0;
  const c = pos % 9;
  for (let j = 0; j < 9; j++) {
    const p1 = r * 9 + j;
    if (p1 !== pos && board[p1] === n) return false;
  }
  for (let i = 0; i < 9; i++) {
    const p2 = i * 9 + c;
    if (p2 !== pos && board[p2] === n) return false;
  }
  const br = r - (r % 3);
  const bc = c - (c % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const p3 = (br + i) * 9 + (bc + j);
      if (p3 !== pos && board[p3] === n) return false;
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

function solveFirst(board) {
  const p = firstEmpty(board);
  if (p < 0) return true;
  for (const d of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (isValidCell(board, p, d)) {
      board[p] = d;
      if (solveFirst(board)) return true;
      board[p] = 0;
    }
  }
  return false;
}

export function generateSolved() {
  const b = new Array(81).fill(0);
  solveFirst(b);
  return b;
}

export function countSolutions(board, cap = 2) {
  const b = clone(board);
  let total = 0;
  function dfs() {
    const p = firstEmpty(b);
    if (p < 0) {
      total++;
      return total >= cap;
    }
    for (let d = 1; d <= 9; d++) {
      if (isValidCell(b, p, d)) {
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

function solutionForUniquePuzzle(puzzle) {
  if (countSolutions(puzzle, 2) !== 1) return null;
  const b2 = clone(puzzle);
  solveFirst(b2);
  return b2;
}

/**
 * Remove cells while keeping a unique solution until we reach target empty cells.
 */
export function makePuzzleFromSolution(solution, targetHoles) {
  const puz = clone(solution);
  const order = shuffle([...Array(81).keys()]);
  for (const pos of order) {
    const holes = puz.reduce((n, v) => n + (v === 0 ? 1 : 0), 0);
    if (holes >= targetHoles) break;
    if (puz[pos] === 0) continue;
    const keep = puz[pos];
    puz[pos] = 0;
    if (countSolutions(puz, 2) === 1) {
      continue;
    }
    puz[pos] = keep;
  }
  const given = puz.map((v) => v !== 0);
  return { puzzle: puz, given, solution: clone(solution) };
}

export function buildRandomGame(difficulty) {
  const sol = generateSolved();
  const targetHoles = difficulty === "EASY" ? 36 : 50;
  return makePuzzleFromSolution(sol, targetHoles);
}

export function validateCustomClues(raw) {
  if (!Array.isArray(raw) || raw.length !== 81) {
    return { ok: false, error: "Board must be 81 values." };
  }
  const cells = raw.map((v) => (typeof v === "number" && !Number.isNaN(v) ? v : 0));
  for (let i = 0; i < 81; i++) {
    const v = cells[i];
    if (v !== 0 && (v < 1 || v > 9)) {
      return { ok: false, error: "Values must be 1 through 9 or 0 for empty." };
    }
  }
  for (let i = 0; i < 81; i++) {
    if (cells[i] === 0) continue;
    const v = cells[i];
    const t = cells[i];
    cells[i] = 0;
    if (!isValidCell(cells, i, v)) {
      cells[i] = t;
      return { ok: false, error: "Clues conflict with Sudoku rules." };
    }
    cells[i] = t;
  }
  const c = countSolutions(cells, 2);
  if (c === 0) {
    return { ok: false, error: "No valid solution." };
  }
  if (c > 1) {
    return { ok: false, error: "Puzzle has more than one solution." };
  }
  const sol = solutionForUniquePuzzle(cells);
  if (!sol) {
    return { ok: false, error: "Could not derive unique solution." };
  }
  const given = cells.map((v) => v !== 0);
  return { ok: true, puzzle: clone(cells), given, solution: sol };
}
