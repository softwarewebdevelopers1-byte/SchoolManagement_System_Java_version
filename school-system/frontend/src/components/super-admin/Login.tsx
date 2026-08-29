// components/LoginPage.tsx
import React, { useState } from "react";
import "./LoginPage.css";

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (email === "superadmin@edunex.com" && password === "admin123") {
        const user = {
          userId: "sa-001",
          email: "superadmin@edunex.com",
          firstName: "Super",
          lastName: "Admin",
          roles: ["SUPERADMIN"],
          status: "ACTIVE",
        };
        localStorage.setItem("edunex_user", JSON.stringify(user));
        onLogin(user);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Panel */}
        <div className="login-left">
          <div className="login-decorative-circle1" />
          <div className="login-decorative-circle2" />
          <div className="login-decorative-circle3" />

          <div className="login-left-content">
            <div className="login-logo">
              <div className="login-logo-icon">E</div>
              <span className="login-logo-text">Edunex</span>
            </div>
            <h1 className="login-title">
              Welcome
              <br />
              <em className="login-title-emphasis">back.</em>
            </h1>
            <p className="login-description">
              Manage schools, teachers, and system operations from a single
              dashboard.
            </p>
            <div className="login-features">
              <div className="login-feature-item">
                <span className="login-feature-icon">🏫</span>
                <span>School Management</span>
              </div>
              <div className="login-feature-item">
                <span className="login-feature-icon">👨‍🏫</span>
                <span>Teacher Oversight</span>
              </div>
              <div className="login-feature-item">
                <span className="login-feature-icon">📊</span>
                <span>System Analytics</span>
              </div>
            </div>
          </div>

          <div className="login-left-footer">
            <div className="login-footer-divider" />
            <p className="login-copyright">© 2026 Edunex</p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="login-right">
          <div className="login-form-container">
            <div className="login-form-header">
              <span className="login-form-subtitle">Super Admin</span>
              <h2 className="login-form-title">Sign In</h2>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-input-group">
                <label className="login-input-label">Email</label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon">✉</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="superadmin@edunex.com"
                    required
                    className="login-input"
                  />
                </div>
              </div>

              <div className="login-input-group">
                <label className="login-input-label">Password</label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="login-input login-input-password"
                  />
                  <button
                    type="button"
                    className="login-eye-button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error-message">
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="login-submit-button"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="login-demo-section">
                <div className="login-demo-divider">
                  <span className="login-demo-divider-line" />
                  <span className="login-demo-divider-text">
                    Demo Credentials
                  </span>
                  <span className="login-demo-divider-line" />
                </div>
                <div className="login-demo-badge">
                  superadmin@edunex.com / admin123
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
