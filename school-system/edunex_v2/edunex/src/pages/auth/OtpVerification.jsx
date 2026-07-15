import { useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthShell from './AuthShell';
import { useToast } from '../../context/ToastContext';

export default function OtpVerification() {
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const email = location.state?.email || 'your registered email';

  const update = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits]; next[i] = val; setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };
  const onKeyDown = (i, e) => { if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus(); };

  const submit = (e) => {
    e.preventDefault();
    if (digits.some((d) => !d)) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); toast.success('Code verified'); navigate('/reset-password'); }, 700);
  };

  return (
    <AuthShell title="Verify your identity" subtitle={`Enter the 6-digit code sent to ${email}.`}>
      <form onSubmit={submit}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {digits.map((d, i) => (
            <input
              key={i} ref={(el) => (refs.current[i] = el)} value={d} maxLength={1} inputMode="numeric"
              onChange={(e) => update(i, e.target.value)} onKeyDown={(e) => onKeyDown(i, e)}
              style={{ width: 46, height: 54, textAlign: 'center', fontSize: 20, fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text)' }}
            />
          ))}
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Verifying…' : 'Verify code'}</button>
      </form>
      <p style={{ fontSize: 13, marginTop: 18 }}>Didn't get a code? <button type="button" className="btn-ghost" style={{ color: 'var(--brand-blue)', fontWeight: 600, padding: 0 }} onClick={() => toast.info('A new code has been sent')}>Resend</button></p>
      <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 13.5, color: 'var(--text-secondary)' }}>
        <ArrowLeft size={15} /> Back to log in
      </Link>
    </AuthShell>
  );
}
