import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import styles from "./SuperAdminLogin.module.css";

const SuperAdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/superadmin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      const loginData = data.data || data;
      const session = {
        token: loginData.token,
        user: loginData.user,
      };
      localStorage.setItem("user", JSON.stringify(session));

      window.location.href = "/edunex-org/superAdmin";
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.loginContainer} ${mounted ? styles.mounted : ""}`}>
      <div className={styles.loginWrapper}>
        <div className={styles.leftPanel}>
          <div className={styles.decorativeCircle1} />
          <div className={styles.decorativeCircle2} />
          <div className={styles.decorativeCircle3} />

          <div className={styles.leftContent}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <Shield size={32} color="#C9963D" />
              </div>
              <span className={styles.logoText}>Super Admin</span>
            </div>

            <h1 className={styles.welcomeTitle}>
              Platform
              <br />
              <em className={styles.welcomeEmphasis}>Administration</em>
            </h1>
            <p className={styles.welcomeDescription}>
              Manage all schools, users, and platform settings from a single
              secure dashboard.
            </p>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Shield size={14} />
                </div>
                <span className={styles.featureLabel}>Full Platform Access</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Shield size={14} />
                </div>
                <span className={styles.featureLabel}>School Management</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Shield size={14} />
                </div>
                <span className={styles.featureLabel}>User Administration</span>
              </div>
            </div>
          </div>

          <div className={styles.leftFooter}>
            <div className={styles.footerDivider} />
            <p className={styles.copyright}>
              © {new Date().getFullYear()} Edunex
            </p>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <p className={styles.formSubtitle}>Super Admin Portal</p>
              <h2 className={styles.formTitle}>Sign in to your account</h2>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.inputLabel}>
                  Email
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <Mail size={16} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@edunex.co.ke"
                    required
                    autoComplete="email"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.inputLabel}>
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <Lock size={16} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className={`${styles.input} ${styles.inputWithRightPadding}`}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  <span className={styles.errorText}>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.loader} />
                ) : (
                  "Sign In"
                )}
              </button>

              <button
                type="button"
                className={styles.switchButton}
                onClick={() => navigate("/login")}
              >
                Back to School Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLoginPage;
