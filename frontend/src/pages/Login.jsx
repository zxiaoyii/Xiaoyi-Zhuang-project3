import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, username } = useAuth();
  const navigate = useNavigate();

  if (username) return <Navigate to="/games" replace />;
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const ready = user.trim() !== "" && pass !== "";
  const disabled = !ready;

  async function submit(e) {
    e.preventDefault();
    if (disabled) return;
    setErr("");
    try {
      await login(user, pass);
      navigate("/games");
    } catch (e2) {
      setErr(
        e2.response?.data?.error || "Login failed. Check your details.",
      );
    }
  }

  return (
    <div className="page narrow">
      <h1>Log in</h1>
      <form className="stack" onSubmit={submit}>
        <label>
          Username
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {err && <p className="form-error">{err}</p>}
        <button className="btn primary" type="submit" disabled={disabled}>
          Submit
        </button>
        <p>
          New here? <Link to="/register">Create an account</Link>.
        </p>
      </form>
    </div>
  );
}
