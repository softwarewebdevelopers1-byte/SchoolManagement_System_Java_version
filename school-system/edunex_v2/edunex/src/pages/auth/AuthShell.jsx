import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, BarChart3, CalendarClock } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function AuthShell({ children, title, subtitle }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg)' }} className="auth-shell">
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 60px' }}>
        <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <img src={logo} alt="EduNex" style={{ width: 36, height: 36, borderRadius: 10 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>EduNex</span>
          </Link>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 style={{ fontSize: 26, marginBottom: 8 }}>{title}</h1>
            {subtitle && <p style={{ marginBottom: 28 }}>{subtitle}</p>}
            {children}
          </motion.div>
        </div>
      </div>
      <div className="auth-visual" style={{
        background: 'var(--brand-ink)', position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 50,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(700px 500px at 30% 20%, rgba(74,222,128,0.18), transparent 60%), radial-gradient(600px 500px at 80% 80%, rgba(22,163,74,0.22), transparent 60%)',
        }} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} style={{ position: 'relative', width: '100%', maxWidth: 380 }}>
          <div className="card" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: 24, backdropFilter: 'blur(10px)' }}>
            <div style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 18 }}>Welcome back to EduNex</div>
            {[[ShieldCheck, 'Role-based dashboards for every user'], [BarChart3, 'Live analytics across every class'], [CalendarClock, 'Conflict-free timetables, generated for you']].map(([Icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-cyan)', flexShrink: 0 }}>
                  <Icon size={16} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13.5 }}>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <style>{`@media (max-width: 900px) { .auth-shell { grid-template-columns: 1fr !important; } .auth-visual { display: none !important; } }`}</style>
    </div>
  );
}
