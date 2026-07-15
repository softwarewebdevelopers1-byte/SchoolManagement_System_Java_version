import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import AuthShell from './AuthShell';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DEMO = [
  { role: 'admin', email: 'admin@edunex.io' },
  { role: 'headteacher', email: 'head@edunex.io' },
  { role: 'classteacher', email: 'classteacher@edunex.io' },
  { role: 'subjectteacher', email: 'subjectteacher@edunex.io' },
  { role: 'student', email: 'student@edunex.io' },
  { role: 'parent', email: 'parent@edunex.io' },
];

export default function Login() {
  const [email, setEmail] = useState('admin@edunex.io');
  const [password, setPassword] = useState('demo1234');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Enter a valid email address';
    if (password.length < 4) errs.password = 'Password is too short';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    const user = await login(email, password);
    setLoading(false);
    toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
    navigate(ROLES[user.role].base);
  };

  return (
    <AuthShell title="Log in to EduNex" subtitle="Pick a demo role below, or sign in with any account.">
      <form onSubmit={submit} noValidate>
        <div className={`field ${errors.email ? 'has-error' : ''}`}>
          <label>Email address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input style={{ paddingLeft: 34, width: '100%' }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.ac.ke" />
          </div>
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <div className={`field ${errors.password ? 'has-error' : ''}`}>
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type={showPw ? 'text' : 'password'} style={{ paddingLeft: 34, paddingRight: 34, width: '100%' }} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <button type="button" onClick={() => setShowPw((s) => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <span className="error">{errors.password}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, fontSize: 13 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <input type="checkbox" defaultChecked style={{ width: 'auto' }} /> Remember me
          </label>
          <Link to="/forgot-password" style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>Forgot password?</Link>
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Signing in…' : <>Log in <LogIn size={15} /></>}
        </button>
      </form>

      <div style={{ margin: '26px 0 14px', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>Or try a demo role</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {DEMO.map((d) => (
          <button key={d.role} type="button" className="btn btn-secondary btn-sm" onClick={() => { setEmail(d.email); setPassword('demo1234'); }}>
            {ROLES[d.role].label}
          </button>
        ))}
      </div>
    </AuthShell>
  );
}
