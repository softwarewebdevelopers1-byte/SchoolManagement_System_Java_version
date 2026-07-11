import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { roleHome, roleLabels } from "@/constants/navigation";
import type { Role } from "@/types";

const roles: Role[] = [
  "admin",
  "headteacher",
  "classteacher",
  "subjectteacher",
  "student",
  "parent",
];

export default function Login() {
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState("carlos@edunex.school");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      alert("Please verify that you are not a robot.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      console.log({
        email,
        password,
        role,
        captchaToken,
      });

      // Later:
      // await axios.post("/api/auth/login", {
      //   email,
      //   password,
      //   role,
      //   captchaToken,
      // });

      login(role, email);

      setLoading(false);

      navigate(roleHome[role]);
    }, 700);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your EduNex dashboard."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-700 dark:text-slate-300">
            Sign in as
          </label>

          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                  role === r
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                    : "border-ink-900/10 text-ink-700 hover:border-ink-900/20 dark:border-white/10 dark:text-slate-300"
                }`}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-700 dark:text-slate-300">
            Email
          </label>

          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600/50" />

            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              placeholder="you@school.edu"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-medium text-ink-700 dark:text-slate-300">
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600/50" />

            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-600/60 hover:text-ink-900 dark:hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Google reCAPTCHA */}

        <div className="flex justify-center py-2">
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={(token) => setCaptchaToken(token)}
            onExpired={() => setCaptchaToken(null)}
            onErrored={() => {
              setCaptchaToken(null);
              alert("Failed to load reCAPTCHA. Please try again.");
            }}
          />
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign in
        </Button>

        <p className="text-center text-xs text-ink-600 dark:text-slate-400">
          This is a demo build — any password signs you in as the selected role.
        </p>
      </form>
    </AuthLayout>
  );
}
