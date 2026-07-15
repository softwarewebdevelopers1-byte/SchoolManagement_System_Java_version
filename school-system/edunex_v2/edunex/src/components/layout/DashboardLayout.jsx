import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { NAV } from '../../routes/navConfig';
import { Breadcrumb } from '../common/ConfirmDialog';

export default function DashboardLayout({ role, base }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const items = NAV[role] || [];
  const current = items.find((it) => {
    const to = `${base}${it.to ? '/' + it.to : ''}`;
    return it.to === '' ? (location.pathname === base || location.pathname === base + '/') : location.pathname.startsWith(to);
  });
  const hasSettings = items.some((it) => it.to === 'settings');

  return (
    <div className="edx-shell">
      <Sidebar role={role} base={base} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
      <div className="edx-content" style={{ marginLeft: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)' }}>
        <Navbar
          onMenuClick={() => setMobileOpen(true)}
          base={base}
          settingsPath={hasSettings ? `${base}/settings` : `${base}${role === 'student' ? '/profile' : ''}`}
          breadcrumb={<Breadcrumb items={[{ label: 'EduNex', to: base }, { label: current?.label || 'Dashboard' }]} />}
        />
        <div className="edx-page fade-in" key={location.pathname}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
