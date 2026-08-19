import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../../lib/api";
import "./SuperAdmin.css";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = await request<string>("/complex/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem(
        "user",
        JSON.stringify({
          token,
          user: { email, roles: ["SUPERADMIN"], role: "SUPERADMIN", name: "Super Admin" },
        }),
      );
      navigate("/edunex-org/superAdmin");
    } catch (err: any) {
      setError(err?.message || "Unable to sign in as super admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sa-login">
      <form className="sa-login-card" onSubmit={submit}>
        <div className="sa-login-brand">Edu<span>Nex</span></div>
        <p className="sa-login-kicker">Super Admin Portal</p>
        <h1>Manage all schools</h1>
        <label>
          Email
          <input className="sa-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input className="sa-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <div className="sa-login-error">{error}</div>}
        <button className="sa-btn primary" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
