import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const empty81 = () => new Array(81).fill(0);

export default function Custom() {
  const { username } = useAuth();
  const navigate = useNavigate();
  const [cells, setCells] = useState(empty81);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Only logged-in users can access the custom page
  if (!username) {
    return <Navigate to="/login" replace />;
  }

  function setCell(i, v) {
    setCells((prev) => {
      const next = prev.slice();
      next[i] = v;
      return next;
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await client.post("/sudoku/custom", { board: cells });
      navigate(`/game/${data.gameId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Could not create the puzzle.");
    } finally {
      setBusy(false);
    }
  }

  function clearBoard() {
    setCells(empty81());
  }

  return (
    <div className="page">
      <h1>Custom game</h1>
      <p className="sub">
        Enter your own clues on a blank 9×9 board. The server will verify
        the puzzle has exactly one valid solution.
      </p>
      <form onSubmit={submit}>
        <div className="board">
          {Array.from({ length: 9 }).map((_, r) => (
            <div className="row" key={r}>
              {Array.from({ length: 9 }).map((__, c) => {
                const i = r * 9 + c;
                const thickR = c % 3 === 2 && c < 8;
                const thickB = r % 3 === 2 && r < 8;
                return (
                  <input
                    key={c}
                    className={
                      "cell" +
                      (thickR ? " thick-r" : "") +
                      (thickB ? " thick-b" : "")
                    }
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={cells[i] === 0 ? "" : cells[i]}
                    onChange={(e) => {
                      const t = e.target.value.replace(/[^1-9]/g, "");
                      setCell(i, t === "" ? 0 : parseInt(t, 10));
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="row gap pad-top">
          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? "Validating…" : "Submit"}
          </button>
          <button
            className="btn secondary"
            type="button"
            onClick={clearBoard}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
