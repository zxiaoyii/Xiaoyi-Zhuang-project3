import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { appTitle } from "../config/site.js";

function displayName(u) {
  if (!u) return "";
  return u.charAt(0).toUpperCase() + u.slice(1);
}

export default function Layout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="app-shell">
      <header className="nav-bar">
        <Link to="/" className="brand">
          {appTitle}
        </Link>
        <nav className="nav-links">
          <NavLink to="/games" className={({ isActive }) => isActive ? "nav-active" : ""}>
            Games
          </NavLink>
          <NavLink to="/rules" className={({ isActive }) => isActive ? "nav-active" : ""}>
            Rules
          </NavLink>
          <NavLink to="/scores" className={({ isActive }) => isActive ? "nav-active" : ""}>
            High scores
          </NavLink>
        </nav>
        <div className="nav-auth">
          {username ? (
            <>
              <span className="nav-user">{displayName(username)}</span>
              <button type="button" className="btn ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn ghost">
                Log in
              </Link>
              <Link to="/register" className="btn primary">
                Register
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
