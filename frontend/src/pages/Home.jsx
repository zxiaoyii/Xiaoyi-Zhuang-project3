import { Link } from "react-router-dom";
import { appTitle } from "../config/site.js";

export default function Home() {
  return (
    <section className="hero">
      <h1>{appTitle}</h1>
      <p className="lede">
        A full stack Sudoku experience with saved games, accounts, and a
        shared leaderboard. Pick up where you left off, or start something new.
      </p>
      <div className="hero-actions">
        <Link to="/rules" className="btn secondary">
          Rules
        </Link>
        <Link to="/games" className="btn primary">
          Play
        </Link>
      </div>
    </section>
  );
}
