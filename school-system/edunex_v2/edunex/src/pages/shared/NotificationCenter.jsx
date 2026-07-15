import { Bell, Megaphone, CalendarDays } from 'lucide-react';
import Tabs from '../../components/common/Tabs';
import { NOTIFICATIONS, ANNOUNCEMENTS, EVENTS } from '../../data';

function NotificationsTab() {
  return (
    <div>
      {NOTIFICATIONS.map((n) => (
        <div key={n.id} className="card" style={{ padding: 16, display: 'flex', gap: 14, marginBottom: 10, borderLeft: n.unread ? '3px solid var(--brand-blue)' : '3px solid transparent' }}>
          <div className="feature-icon" style={{ marginBottom: 0 }}><Bell size={17} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0' }}>{n.body}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{n.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnnouncementsTab() {
  return (
    <div className="grid-auto">
      {ANNOUNCEMENTS.map((a) => (
        <div key={a.id} className="card" style={{ padding: 18 }}>
          <span className="badge badge-info" style={{ marginBottom: 10 }}>{a.audience}</span>
          <h3 style={{ fontSize: 15, marginBottom: 6 }}>{a.title}</h3>
          <p style={{ fontSize: 13, marginBottom: 8 }}>{a.body}</p>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      ))}
    </div>
  );
}

function CalendarTab() {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {EVENTS.map((e, i) => (
        <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: i < EVENTS.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--brand-gradient-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'var(--brand-blue)', fontWeight: 700 }}>{new Date(e.date).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--brand-blue)' }}>{new Date(e.date).getDate()}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{e.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.category}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationCenter() {
  const tabs = [
    { key: 'notif', label: 'Notification Center', content: <NotificationsTab /> },
    { key: 'announce', label: 'Announcements', content: <AnnouncementsTab /> },
    { key: 'events', label: 'Events & Calendar', content: <CalendarTab /> },
  ];
  return <Tabs tabs={tabs} />;
}
