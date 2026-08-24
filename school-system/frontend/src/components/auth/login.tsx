// components/auth/LoginPage.tsx

import React, { useState, useEffect } from "react";
import styles from "./LoginPage.module.css";
import {
  api,
  getDefaultDashboardPath,
  normalizeRoles,
  normalizeUser,
  request,
} from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

// Role labels removed

// SVG Icon Components
const EyeIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const MailIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const WarnIcon: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const HomeIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const FeatureIcon: React.FC<{ d: string }> = ({ d }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const hasTeacherProfile = (user: any) =>
  Boolean(
    user?.teacherProfileId ||
    user?.teacherId ||
    user?.teacherProfileDto?.teacherProfileId ||
    user?.teacherProfile?.teacherProfileId ||
    user?.teacherProfile?.id,
  );

interface LoginPageProps {
  onLogin?: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [verifiedSchool, setVerifiedSchool] = useState("");
  const [codeChecking, setCodeChecking] = useState(false);
  const [profileSession, setProfileSession] = useState<any | null>(null);
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");
  const [isSuperAdminLogin, setIsSuperAdminLogin] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice(null);
    setLoading(true);

    try {
      const response: any = await api.post("/login", {
        email: loginIdentifier.trim(),
        password,
      });

      const user = normalizeUser(response.user);
      const session = { ...response, user };
      localStorage.setItem("user", JSON.stringify(session));

      const roles = normalizeRoles(user.roles);
      const isTeacher =
        roles.includes("SUBJECTTEACHER") ||
        roles.includes("CLASSTEACHER") ||
        roles.includes("HEADTEACHER") ||
        roles.includes("DEPUTYTEACHER") ||
        roles.includes("ADMIN") ||
        roles.includes("SUPERADMIN");
      if (isTeacher && !hasTeacherProfile(user)) {
        setProfileSession(session);
        setProfileFirstName(user.firstName || "");
        setProfileLastName(user.lastName || "");
        return;
      }

      if (onLogin) {
        onLogin(user);
      } else {
        if (roles.length > 1) {
          window.location.href = "/edunex-org/dashboard";
        } else {
          window.location.href = getDefaultDashboardPath(user);
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid login details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySchoolCode = async () => {
    if (!schoolCode.trim()) {
      setError("Enter a school code first.");
      return;
    }
    setCodeChecking(true);
    setError("");
    setNotice(null);
    setVerifiedSchool("");
    try {
      const response: any = await request(
        `/schools/get/school/for/user?schoolCode=${encodeURIComponent(schoolCode.trim())}`,
      );
      const schoolName =
        typeof response === "string"
          ? response
          : response?.schoolName || response?.name || response?.data || "";
      setVerifiedSchool(String(schoolName || "School found"));
      setNotice({ text: "School code verified.", type: "success" });
    } catch (err: any) {
      setError(err.message || "School code was not found.");
    } finally {
      setCodeChecking(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedSchool) {
      setError("Verify the school code before creating the account.");
      return;
    }
    setLoading(true);
    setError("");
    setNotice(null);
    try {
      await request("/auth/teacher/create-account", {
        method: "POST",
        body: JSON.stringify({
          email: signupEmail.trim(),
          password: signupPassword,
          schoolCode: schoolCode.trim(),
        }),
      });
      setAuthMode("login");
      setLoginIdentifier(signupEmail.trim());
      setPassword("");
      setVerifiedSchool("");
      setSignupEmail("");
      setSignupPassword("");
      setSchoolCode("");
      setNotice({
        text: "Account created. Wait for the admin to accept your request, then sign in.",
        type: "success",
      });
    } catch (err: any) {
      setError(err.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profileSession?.token || !profileSession?.user?.userId) return;
    setLoading(true);
    setError("");
    setNotice(null);
    try {
      await request("/users/teacher/add-profile", {
        method: "POST",
        body: JSON.stringify({
          firstName: profileFirstName.trim(),
          lastName: profileLastName.trim(),
          userId: profileSession.user.userId,
        }),
      });
      let user = {
        ...profileSession.user,
        firstName: profileFirstName.trim(),
        lastName: profileLastName.trim(),
        name: [profileFirstName, profileLastName].filter(Boolean).join(" "),
      };
      try {
        user = normalizeUser(await api.get("/auth/me"));
      } catch {}
      const session = { ...profileSession, user };
      localStorage.setItem("user", JSON.stringify(session));
      const roles = normalizeRoles(user.roles);
      window.location.href =
        roles.length > 1
          ? "/edunex-org/dashboard"
          : getDefaultDashboardPath(user);
    } catch (err: any) {
      setError(err.message || "Unable to save teacher profile.");
    } finally {
      setLoading(false);
    }
  };

  // Demo login removed

  const features = [
    { icon: "M18 20V10M12 20V4M6 20v-6", label: "Real-time Analytics" },
    {
      icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
      label: "Student Management",
    },
    {
      icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
      label: "Assessment & Grading",
    },
    {
      icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
      label: "Parent Communication",
    },
  ];

  return (
    <div
      className={`${styles.loginContainer} ${mounted ? styles.mounted : ""}`}
    >
      <div className={styles.loginWrapper}>
        {/* Left Panel - Branding Section */}
        <div className={styles.leftPanel}>
          {/* Decorative elements */}
          <div className={styles.decorativeCircle1} />
          <div className={styles.decorativeCircle2} />
          <div className={styles.decorativeCircle3} />

          <div className={styles.leftContent}>
            {/* Logo */}
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <img
                  src="/EdunexImage.png"
                  style={{ width: "100%", height: "100%" }}
                  alt=""
                />
              </div>
              <span className={styles.logoText}>School Management</span>
            </div>

            {/* Heading */}
            <h1 className={styles.welcomeTitle}>
              Welcome
              <br />
              <em className={styles.welcomeEmphasis}>back.</em>
            </h1>
            <p className={styles.welcomeDescription}>
              Access your dashboard and manage school activities with clarity
              and ease.
            </p>

            {/* Features List */}
            <div className={styles.featuresList}>
              {features.map(({ icon, label }) => (
                <div key={label} className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <FeatureIcon d={icon} />
                  </div>
                  <span className={styles.featureLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className={styles.leftFooter}>
            <div className={styles.footerDivider} />
            <p className={styles.copyright}>
              © {new Date().getFullYear()} Edunex
            </p>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            {/* Header */}
            <div className={styles.formHeader}>
              <p className={styles.formSubtitle}>
                {isSuperAdminLogin ? "Super Admin Portal" : "Portal Access"}
              </p>
              <button
                type="button"
                className={styles.authModeButton}
                onClick={() => {
                  navigate("/");
                }}
              >
                <Home size={18} /> Home
              </button>
              <h2 className={styles.formTitle}>
                {profileSession
                  ? "Complete teacher profile"
                  : isSuperAdminLogin
                    ? "Super Admin Sign In"
                    : authMode === "login"
                      ? "Sign in to your account"
                      : "Create teacher account"}
              </h2>
              {!profileSession && (
                <button
                  type="button"
                  className={styles.authModeButton}
                  onClick={() => {
                    setIsSuperAdminLogin(!isSuperAdminLogin);
                    setError("");
                    setNotice(null);
                  }}
                  style={{
                    marginTop: 8,
                    background: isSuperAdminLogin ? "var(--edu-green)" : "transparent",
                    color: isSuperAdminLogin ? "#fff" : "var(--edu-green)",
                    border: "1px solid var(--edu-green)",
                  }}
                >
                  {isSuperAdminLogin ? "Switch to School Login" : "Switch to Super Admin Login"}
                </button>
              )}
            </div>

            {/* Form */}
            {profileSession && (
              <div className={styles.profileModalBackdrop}>
                <form
                  onSubmit={completeProfile}
                  className={styles.profileModal}
                >
                  <p className={styles.formSubtitle}>Teacher Profile</p>
                  <h3 className={styles.modalTitle}>Complete your profile</h3>
                  <p className={styles.modalCopy}>
                    Your account is accepted, but no teacher profile exists yet.
                  </p>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>First name</label>
                    <input
                      value={profileFirstName}
                      onChange={(event) =>
                        setProfileFirstName(event.target.value)
                      }
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Last name</label>
                    <input
                      value={profileLastName}
                      onChange={(event) =>
                        setProfileLastName(event.target.value)
                      }
                      className={styles.input}
                      required
                    />
                  </div>
                  {error && (
                    <div className={styles.errorMessage}>
                      <span className={styles.errorIcon}>
                        <WarnIcon />
                      </span>
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
                      "Save Profile"
                    )}
                  </button>
                </form>
              </div>
            )}
            {authMode === "login" ? (
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Login Identifier Field */}
                <div className={styles.inputGroup}>
                  <label
                    htmlFor="loginIdentifier"
                    className={styles.inputLabel}
                  >
                    Email or Parent Phone
                  </label>
                  <div className={styles.inputWrapper}>
                    <span
                      className={`${styles.inputIcon} ${focusedField === "loginIdentifier" ? styles.inputIconFocused : ""}`}
                    >
                      <MailIcon />
                    </span>
                    <input
                      id="loginIdentifier"
                      type="text"
                      inputMode="email"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      onFocus={() => setFocusedField("loginIdentifier")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="teacher@school.com or 0712345678"
                      required
                      autoComplete="username"
                      className={`${styles.input} ${focusedField === "loginIdentifier" ? styles.inputFocused : ""}`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.inputLabel}>
                    Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <span
                      className={`${styles.inputIcon} ${focusedField === "password" ? styles.inputIconFocused : ""}`}
                    >
                      <LockIcon />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className={`${styles.input} ${styles.inputWithRightPadding} ${focusedField === "password" ? styles.inputFocused : ""}`}
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className={styles.formOptions}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" className={styles.checkbox} />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className={styles.forgotLink}>
                    Forgot password?
                  </a>
                </div>

                {/* Error Message */}
                {error && (
                  <div className={styles.errorMessage}>
                    <span className={styles.errorIcon}>
                      <WarnIcon />
                    </span>
                    <span className={styles.errorText}>{error}</span>
                  </div>
                )}
                {notice && (
                  <div
                    className={
                      notice.type === "success"
                        ? styles.successMessage
                        : styles.errorMessage
                    }
                  >
                    <span className={styles.errorText}>{notice.text}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? <span className={styles.loader} /> : "Sign In"}
                </button>
                <button
                  type="button"
                  className={styles.authModeButton}
                  onClick={() => {
                    setAuthMode("signup");
                    setError("");
                    setNotice(null);
                  }}
                >
                  Create teacher account
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>School code</label>
                  <div className={styles.codeRow}>
                    <input
                      value={schoolCode}
                      onChange={(event) => {
                        setSchoolCode(event.target.value);
                        setVerifiedSchool("");
                      }}
                      className={styles.input}
                      required
                    />
                    <button
                      type="button"
                      className={styles.codeButton}
                      onClick={handleVerifySchoolCode}
                      disabled={codeChecking}
                    >
                      {codeChecking ? "Checking..." : "Submit Code"}
                    </button>
                  </div>
                  {verifiedSchool && (
                    <p className={styles.schoolFound}>{verifiedSchool}</p>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(event) => setSignupEmail(event.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Password</label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
                {error && (
                  <div className={styles.errorMessage}>
                    <span className={styles.errorIcon}>
                      <WarnIcon />
                    </span>
                    <span className={styles.errorText}>{error}</span>
                  </div>
                )}
                {notice && (
                  <div
                    className={
                      notice.type === "success"
                        ? styles.successMessage
                        : styles.errorMessage
                    }
                  >
                    <span className={styles.errorText}>{notice.text}</span>
                  </div>
                )}
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading || !verifiedSchool}
                >
                  {loading ? (
                    <span className={styles.loader} />
                  ) : (
                    "Create Account"
                  )}
                </button>
                <button
                  type="button"
                  className={styles.authModeButton}
                  onClick={() => {
                    setAuthMode("login");
                    setError("");
                    setNotice(null);
                  }}
                >
                  Back to sign in
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
