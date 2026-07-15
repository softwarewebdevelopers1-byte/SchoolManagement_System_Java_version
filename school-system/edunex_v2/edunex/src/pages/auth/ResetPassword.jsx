import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
import AuthShell from './AuthShell';
import { useToast } from '../../context/ToastContext';

export default function ResetPassword() {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const rules = [
    { label: 'At least 8 characters', ok: pw.length >= 8 },
    { label: 'One number', ok: /\d/.test(pw) },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(pw) },
  ];

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!rules.every((r) => r.ok)) errs.pw = 'Password does not meet requirements';
    if (pw !== confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); toast.success('Password updated — please log in'); navigate('/login'); }, 700);
  };

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you haven't used before.">
      <form onSubmit={submit} noValidate>
        <div className={`field ${errors.pw ? 'has-error' : ''}`}>
          <label>New password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="password" style={{ paddingLeft: 34, width: '100%' }} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          {rules.map((r) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: r.ok ? 'var(--success)' : 'var(--text-muted)', marginBottom: 4 }}>
              <CheckCircle2 size={13} /> {r.label}
            </div>
          ))}
        </div>
        <div className={`field ${errors.confirm ? 'has-error' : ''}`}>
          <label>Confirm password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="password" style={{ paddingLeft: 34, width: '100%' }} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
          </div>
          {errors.confirm && <span className="error">{errors.confirm}</span>}
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Updating…' : 'Update password'}</button>
      </form>
    </AuthShell>
  );
}
