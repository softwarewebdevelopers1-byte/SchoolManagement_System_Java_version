import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, Sun, Moon, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { NOTIFICATIONS, avatarUrl } from '../../data';
import { Breadcrumb } from '../common/ConfirmDialog';

export default function Navbar({ onMenuClick, breadcrumb, base, settingsPath }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(); const profileRef = useRef();

  useEffect(() => {
    function onClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div className="edx-topbar">
      <button className="btn-icon btn-ghost hide-desktop" onClick={onMenuClick}><Menu size={20} /></button>
      <div style={{ flex: 1, minWidth: 0 }}>
        {breadcrumb}
      </div>

      <div style={{ position: 'relative' }} className="hide-mobile">
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input placeholder="Search students, teachers, classes…" style={{
          width: 240, background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 100,
          padding: '9px 12px 9px 34px', fontSize: 13.5, color: 'var(--text)',
        }} />
      </div>

      <button className="btn-icon btn-ghost" onClick={toggleTheme} title="Toggle theme">
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <div style={{ position: 'relative' }} ref={notifRef}>
        <button className="btn-icon btn-ghost" onClick={() => setNotifOpen((s) => !s)} style={{ position: 'relative' }}>
          <Bell size={18} />
          {unread > 0 && <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', border: '2px solid var(--surface)' }} />}
        </button>
        {notifOpen && (
          <div className="dropdown-panel" style={{ width: 330 }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>Notifications</div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: n.unread ? 'var(--brand-gradient-soft)' : 'transparent' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 3 }}>{n.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 4 }}>{n.body}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.time}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-block" style={{ borderRadius: 0, fontSize: 13 }} onClick={() => { navigate(`${base}/notifications`); setNotifOpen(false); }}>View all</button>
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }} ref={profileRef}>
        <button onClick={() => setProfileOpen((s) => !s)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', padding: '4px 6px', borderRadius: 100 }}>
          <img src={avatarUrl(user?.avatarSeed || user?.name)} alt="" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-subtle)' }} />
          <div className="hide-mobile" style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</div>
          </div>
          <ChevronDown size={14} className="hide-mobile" color="var(--text-muted)" />
        </button>
        {profileOpen && (
          <div className="dropdown-panel" style={{ width: 200 }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{user?.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{user?.email}</div>
            </div>
            <button className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start', borderRadius: 0, fontSize: 13 }} onClick={() => { navigate(settingsPath || base); setProfileOpen(false); }}>
              <Settings size={15} /> Settings
            </button>
            <button className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start', borderRadius: 0, fontSize: 13, color: 'var(--danger)' }} onClick={() => { logout(); navigate('/'); }}>
              <LogOut size={15} /> Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
