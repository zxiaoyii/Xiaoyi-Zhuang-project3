import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register, username } = useAuth();
  const navigate = useNavigate();

  if (username) return <Navigate to="/games" replace />;
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [vpass, setVpass] = useState("");
  const [err, setErr] = useState("");

  const allFilled = user.trim() && pass && vpass;
  const mismatch = pass !== vpass;
  const disabled = !allFilled;

  async function submit(e) {
    e.preventDefault();
    if (disabled) return;
    if (mismatch) {
      setErr("Passwords do not match.");
      return;
    }
    setErr("");
    try {
      await register(user, pass);
      navigate("/games");
    } catch (e2) {
      setErr(
        e2.response?.data?.error || "Registration failed. Try a different name.",
      );
    }
  }

  return (
    <div className="page narrow">
      <h1>Register</h1>
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
            autoComplete="new-password"
          />
        </label>
        <label>
          Verify password
          <input
            type="password"
            value={vpass}
            onChange={(e) => setVpass(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        {mismatch && allFilled && (
          <p className="form-error">Passwords do not match yet.</p>
        )}
        {err && <p className="form-error">{err}</p>}
        <button className="btn primary" type="submit" disabled={disabled}>
          Submit
        </button>
        <p>
          Already have an account? <Link to="/login">Log in</Link>.
        </p>
      </form>
    </div>
  );
}
