import { NavLink, useLocation } from 'react-router-dom';
import { X, GraduationCap, ChevronsLeft } from 'lucide-react';
import { NAV, ROLE_LABELS } from '../../routes/navConfig';
import logo from '../../assets/logo.png';

export default function Sidebar({ role, base, mobileOpen, onCloseMobile, collapsed, onToggleCollapse }) {
  const location = useLocation();
  const items = NAV[role] || [];

  return (
    <>
      {mobileOpen && <div onClick={onCloseMobile} style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', zIndex: 90 }} className="show-mobile-overlay" />}
      <aside
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 95,
          width: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)',
          background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column',
          transition: 'width 0.22s var(--ease), transform 0.25s var(--ease)',
          transform: mobileOpen ? 'translateX(0)' : undefined,
        }}
        className={`edx-sidebar ${mobileOpen ? 'open' : ''}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 18px', height: 'var(--topbar-h)' }}>
          <img src={logo} alt="EduNex" style={{ width: 34, height: 34, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15.5, lineHeight: 1.1 }}>EduNex</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10.5 }}>{ROLE_LABELS[role]}</div>
            </div>
          )}
          <button onClick={onCloseMobile} className="btn-icon btn-ghost hide-desktop" style={{ marginLeft: 'auto', color: '#fff' }}><X size={18} /></button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 12px' }}>
          {items.map((item) => {
            const to = `${base}${item.to ? '/' + item.to : ''}`;
            const isActive = item.to === '' ? location.pathname === base || location.pathname === base + '/' : location.pathname.startsWith(to);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={to}
                onClick={onCloseMobile}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '11px 12px' : '10px 13px',
                  borderRadius: 10, marginBottom: 2, fontSize: 13.6, fontWeight: 500,
                  color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                  background: isActive ? 'linear-gradient(90deg, rgba(22,163,74,0.35), rgba(74,222,128,0.14))' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--brand-cyan)' : '3px solid transparent',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <button onClick={onToggleCollapse} className="hide-mobile" style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', color: 'rgba(255,255,255,0.5)',
          borderTop: '1px solid rgba(255,255,255,0.08)', background: 'transparent', fontSize: 12.5,
        }}>
          <ChevronsLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          {!collapsed && 'Collapse'}
        </button>
      </aside>
    </>
  );
}
