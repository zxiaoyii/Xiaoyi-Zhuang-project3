import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

// Check if cell i has a value that conflicts with another cell in the same row / col / box.
function isCellInvalid(state, i) {
  const n = state[i];
  if (!n) return false;
  const r = (i / 9) | 0;
  const c = i % 9;
  for (let j = 0; j < 9; j++) {
    if (j !== c && state[r * 9 + j] === n) return true;
  }
  for (let k = 0; k < 9; k++) {
    if (k !== r && state[k * 9 + c] === n) return true;
  }
  const br = r - (r % 3);
  const bc = c - (c % 3);
  for (let di = 0; di < 3; di++) {
    for (let dj = 0; dj < 3; dj++) {
      const p = (br + di) * 9 + (bc + dj);
      if (p !== i && state[p] === n) return true;
    }
  }
  return false;
}

export default function GamePage() {
  const { id } = useParams();
  const { username } = useAuth();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const timer = useRef(null);

  const load = useCallback(async () => {
    const { data } = await client.get(`/sudoku/${id}`);
    setGame(data);
  }, [id]);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const { data } = await client.get(`/sudoku/${id}`);
        if (on) setGame(data);
      } catch {
        if (on) setErr("Game not found.");
      }
    })();
    return () => {
      on = false;
    };
  }, [id]);

  const canEdit = !!username;
  const completedForViewer = game?.viewerCompleted;
  const interactive = canEdit && !completedForViewer;

  function displayAt(i) {
    if (completedForViewer && game.solution) return game.solution[i];
    return game.state[i];
  }

  function scheduleSave(nextState) {
    if (!canEdit) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const { data } = await client.put(`/sudoku/${id}`, { state: nextState });
        if (data.completed && !data.alreadyCompleted) {
          try {
            await client.post("/highscore", { gameId: id });
          } catch {
            // win already recorded by PUT
          }
        }
        await load();
      } catch (e) {
        setErr(e.response?.data?.error || "Could not save.");
      } finally {
        setSaving(false);
      }
    }, 350);
  }

  function setDigit(i, digit) {
    if (!game || !interactive) return;
    if (game.given[i]) return;
    const next = game.state.slice();
    next[i] = digit;
    setGame({ ...game, state: next });
    scheduleSave(next);
  }

  function resetPuzzle() {
    if (!game || !canEdit || completedForViewer) return;
    const next = game.puzzle.slice();
    setGame({ ...game, state: next });
    setSelected(null);
    (async () => {
      setSaving(true);
      try {
        await client.put(`/sudoku/${id}`, { state: next });
        await load();
      } catch (e) {
        setErr(e.response?.data?.error || "Could not reset.");
      } finally {
        setSaving(false);
      }
    })();
  }

  async function removeGame() {
    if (!game || !username || game.createdBy !== username) return;
    if (
      !window.confirm(
        "Delete this game? Scores for players who finished it will be updated.",
      )
    ) {
      return;
    }
    try {
      await client.delete(`/sudoku/${id}`);
      navigate("/games");
    } catch (e) {
      setErr(e.response?.data?.error || "Could not delete.");
    }
  }

  function onCellClick(i) {
    if (!interactive) return;
    if (game.given[i]) return;
    setSelected(i);
  }

  function applyPad(d) {
    if (selected == null || !interactive) return;
    setDigit(selected, d);
  }

  // Keyboard input — mirrors Project 2 behaviour
  const onKeyDown = useCallback(
    (e) => {
      if (!interactive || selected == null) return;
      if (game && game.given[selected]) return;
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        setDigit(selected, 0);
        return;
      }
      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        setDigit(selected, parseInt(e.key, 10));
      }
    },
    [interactive, selected, game, setDigit],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  if (err && !game) {
    return (
      <div className="page">
        <p className="form-error">{err}</p>
        <a href="/games" className="btn secondary">
          Back to games
        </a>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="page">
        <p>Loading…</p>
      </div>
    );
  }

  const isCreator = username && game.createdBy === username;

  return (
    <div className="page game-page">
      <div className="game-header">
        <h1>{game.name}</h1>
        <p className="sub">
          <span className={`diff-badge${game.difficulty === "EASY" ? " easy" : ""}`}>
            {game.difficulty}
          </span>
          {" "}by {game.createdBy}
        </p>
      </div>

      {completedForViewer && (
        <div className="win-banner">
          Congratulations! You solved the puzzle — solution shown below.
        </div>
      )}

      {err && <p className="form-error">{err}</p>}

      <div
        className={`board${!interactive ? " board-readonly" : ""}`}
        aria-label="Sudoku board"
      >
        {Array.from({ length: 9 }).map((_, r) => (
          <div className="row" key={r}>
            {Array.from({ length: 9 }).map((__, c) => {
              const i = r * 9 + c;
              const fixed = game.given[i];
              const v = displayAt(i);
              const active = selected === i;
              const invalid = !completedForViewer && !fixed && isCellInvalid(game.state, i);
              return (
                <button
                  type="button"
                  key={c}
                  className={
                    "cell" +
                    (fixed ? " fixed" : "") +
                    (active && interactive ? " selected" : "") +
                    (invalid ? " invalid" : "") +
                    (r % 3 === 2 && r < 8 ? " thick-b" : "") +
                    (c % 3 === 2 && c < 8 ? " thick-r" : "")
                  }
                  disabled={!interactive}
                  onClick={() => onCellClick(i)}
                >
                  {v === 0 || v == null ? "" : v}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {interactive && (
        <div className="pad-block">
          <div className="num-pad" aria-label="Number pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <button
                key={d}
                type="button"
                className="btn small"
                onClick={() => applyPad(d)}
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              className="btn small ghost"
              onClick={() => {
                if (selected != null) setDigit(selected, 0);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <p className="subtle-pad small-text">
        {saving && "Saving… "}
        {!canEdit && "Log in to play. You can still view the board."}
        {canEdit && completedForViewer && "Puzzle complete. Solution is shown."}
        {canEdit && !completedForViewer && "Select a cell, then type or use the pad."}
      </p>

      <div className="row gap pad-top">
        <button
          type="button"
          className="btn secondary"
          disabled={!canEdit || completedForViewer}
          onClick={resetPuzzle}
        >
          Reset
        </button>
        {isCreator && (
          <button type="button" className="btn danger" onClick={removeGame}>
            DELETE
          </button>
        )}
      </div>
    </div>
  );
}
