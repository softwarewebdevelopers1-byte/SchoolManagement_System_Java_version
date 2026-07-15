import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthShell from './AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email address'); return; }
    setError('');
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 700);
  };

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your school email and we'll send a reset code.">
      {sent ? (
        <div className="card" style={{ padding: 20, textAlign: 'center' }}>
          <CheckCircle2 size={30} color="var(--success)" style={{ margin: '0 auto 10px' }} />
          <p style={{ marginBottom: 16 }}>We've sent a 6-digit verification code to <strong>{email}</strong>.</p>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/otp-verification', { state: { email } })}>Enter code</button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className={`field ${error ? 'has-error' : ''}`}>
            <label>Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input style={{ paddingLeft: 34, width: '100%' }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.ac.ke" />
            </div>
            {error && <span className="error">{error}</span>}
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Sending…' : 'Send reset code'}</button>
        </form>
      )}
      <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 22, fontSize: 13.5, color: 'var(--text-secondary)' }}>
        <ArrowLeft size={15} /> Back to log in
      </Link>
    </AuthShell>
  );
}
