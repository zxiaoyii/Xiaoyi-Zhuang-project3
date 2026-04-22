import { useEffect, useState } from "react";
import client from "../api/client.js";

export default function Scores() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const { data } = await client.get("/highscore");
        if (on) setRows(data || []);
      } catch {
        if (on) setRows([]);
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, []);

  return (
    <div className="page">
      <h1>High scores</h1>
      <p className="sub">
        Players ranked by total completed games. Users with zero wins are not
        listed.
      </p>
      {loading && <p>Loading…</p>}
      {!loading && rows.length === 0 && <p>No scores yet.</p>}
      <ol className="score-list">
        {rows.map((r) => (
          <li key={r.username}>
            <span className="name">{r.username}</span>
            <span className="wins">{r.wins} wins</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
