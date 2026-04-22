import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatCreated } from "../util/dateFormat.js";

function DiffBadge({ difficulty }) {
  const label = difficulty ? difficulty.charAt(0) + difficulty.slice(1).toLowerCase() : "";
  const cls = "diff-badge" + (difficulty === "EASY" ? " easy" : "");
  return <span className={cls}>{label}</span>;
}

export default function Games() {
  const { username } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await client.get("/sudoku");
      setGames(data || []);
    } catch (e) {
      setError("Could not load games.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createOne(diff) {
    if (!username) return;
    setError("");
    try {
      const { data } = await client.post("/sudoku", { difficulty: diff });
      navigate(`/game/${data.gameId}`);
    } catch (e) {
      setError(e.response?.data?.error || "Could not create a game.");
    }
  }

  return (
    <div className="page games-page">
      <h1>Games</h1>
      <p className="sub">
        Start a new board or return to a saved one from the list below.
      </p>
      <div className="row gap">
        <button
          type="button"
          className="btn primary"
          disabled={!username}
          onClick={() => createOne("NORMAL")}
        >
          Create normal game
        </button>
        <button
          type="button"
          className="btn primary"
          disabled={!username}
          onClick={() => createOne("EASY")}
        >
          Create easy game
        </button>
        <Link
          to="/custom"
          className={`btn secondary ${!username ? "disabled-link" : ""}`}
          onClick={(e) => {
            if (!username) e.preventDefault();
          }}
        >
          Create custom game
        </Link>
      </div>
      {!username && (
        <p className="hint">Log in to create or play interactively.</p>
      )}
      {error && <p className="form-error">{error}</p>}

      <h2>All games</h2>
      {loading && <p>Loading…</p>}
      {!loading && games.length === 0 && <p>No games yet.</p>}
      <ul className="game-list">
        {games.map((g) => (
          <li key={g.id}>
            <Link to={`/game/${g.id}`} className="game-row">
              <span className="name">{g.name}</span>
              <span className="meta">
                <DiffBadge difficulty={g.difficulty} />
                {g.createdBy} · {formatCreated(g.createdAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
