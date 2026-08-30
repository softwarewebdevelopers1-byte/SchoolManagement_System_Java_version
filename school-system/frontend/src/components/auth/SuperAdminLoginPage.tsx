import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { api, normalizeUser, normalizeRoles } from "../../lib/api";

export default function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response: any = await api.post("/superadmin/login", {
        email: email.trim(),
        password,
      });

      const user = normalizeUser({
        userId: response.user?.userId || response.userId,
        email: email.trim(),
        roles: ["SUPERADMIN"],
      });

      const session = { ...response, user };
      localStorage.setItem("user", JSON.stringify(session));
      localStorage.setItem("token", response.token || response.accessToken || "");

      const roles = normalizeRoles(user.roles);
      const redirect = roles.length > 1 ? "/edunex-org/dashboard" : "/edunex-org/superAdmin";
      window.location.href = redirect;
    } catch (err: any) {
      setError(err.message || "Invalid super admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <button onClick={() => navigate("/login")} style={styles.backButton}>
        <ArrowLeft size={16} />
        Back to main login
      </button>

      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div style={styles.brandBadge}><ShieldCheck size={24} /></div>
          <div>
            <div style={styles.kicker}>Platform Access</div>
            <h1 style={styles.title}>Super Admin Login</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <div style={styles.inputWrap}>
            <Mail size={16} color="#6b7280" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="superadmin@edunex.com"
              style={styles.input}
              autoComplete="username"
            />
          </div>

          <label style={styles.label}>Password</label>
          <div style={styles.inputWrap}>
            <Lock size={16} color="#6b7280" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={styles.input}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? "Signing in..." : "Sign in as Super Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "radial-gradient(circle at top, rgba(201,150,61,0.12), transparent 38%), linear-gradient(180deg, #f5f0e7 0%, #edf1ec 100%)",
    fontFamily: "Nunito, Inter, sans-serif",
  },
  backButton: {
    position: "absolute",
    top: 24,
    left: 24,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(15,46,34,0.10)",
    background: "rgba(255,255,255,0.8)",
    color: "#163325",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(15,46,34,0.08)",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 24px 50px rgba(11,32,24,0.12)",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
  },
  brandBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #0B2018, #163325)",
    color: "#fff",
    boxShadow: "0 14px 28px rgba(11,32,24,0.18)",
  },
  kicker: {
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#7a6040",
    fontWeight: 800,
  },
  title: {
    margin: "4px 0 0",
    fontSize: 30,
    color: "#0f2e22",
    letterSpacing: -0.04,
  },
  form: {
    display: "grid",
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#163325",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#f8f7f4",
    border: "1px solid rgba(15,46,34,0.10)",
    borderRadius: 12,
    padding: "0 14px",
    minHeight: 48,
  },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: 15,
    color: "#1a1208",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 10,
    background: "#fcebeb",
    color: "#a32d2d",
    fontWeight: 600,
    fontSize: 13,
  },
  submitButton: {
    marginTop: 8,
    border: "none",
    borderRadius: 12,
    background: "linear-gradient(135deg, #0B2018, #163325)",
    color: "#fff",
    minHeight: 48,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(11,32,24,0.18)",
  },
};
