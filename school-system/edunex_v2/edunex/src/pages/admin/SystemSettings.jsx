import { useState } from 'react';
import { Sun, Moon, ShieldCheck, DatabaseBackup, Save } from 'lucide-react';
import Tabs from '../../components/common/Tabs';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { SCHOOL } from '../../data';

function SchoolInfoTab() {
  const toast = useToast();
  return (
    <div className="card" style={{ padding: 22, maxWidth: 560 }}>
      <div className="field"><label>School name</label><input defaultValue={SCHOOL.name} /></div>
      <div className="field"><label>Motto</label><input defaultValue={SCHOOL.motto} /></div>
      <div className="field"><label>Address</label><input defaultValue={SCHOOL.address} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="field"><label>Phone</label><input defaultValue={SCHOOL.phone} /></div>
        <div className="field"><label>Email</label><input defaultValue={SCHOOL.email} /></div>
      </div>
      <button className="btn btn-primary" onClick={() => toast.success('School information saved')}><Save size={15} /> Save changes</button>
    </div>
  );
}

function ThemeTab() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="card" style={{ padding: 22, maxWidth: 480 }}>
      <h3 style={{ fontSize: 15, marginBottom: 16 }}>Appearance</h3>
      <div style={{ display: 'flex', gap: 14 }}>
        {[['light', Sun], ['dark', Moon]].map(([mode, Icon]) => (
          <button key={mode} onClick={() => setTheme(mode)} className="card" style={{
            flex: 1, padding: 20, textAlign: 'center', border: theme === mode ? '2px solid var(--brand-blue-2)' : '1px solid var(--border)',
          }}>
            <Icon size={22} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13.5, fontWeight: 600, textTransform: 'capitalize' }}>{mode} mode</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function UserSettingsTab() {
  const toast = useToast();
  return (
    <div className="card" style={{ padding: 22, maxWidth: 480 }}>
      <div className="field"><label>Display name</label><input defaultValue="Amina Wafula" /></div>
      <div className="field"><label>Email notifications</label><select><option>All activity</option><option>Important only</option><option>None</option></select></div>
      <button className="btn btn-primary" onClick={() => toast.success('Preferences saved')}><Save size={15} /> Save preferences</button>
    </div>
  );
}

function SecurityTab() {
  const toast = useToast();
  return (
    <div className="card" style={{ padding: 22, maxWidth: 480 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <ShieldCheck size={20} color="var(--success)" />
        <div><div style={{ fontWeight: 600, fontSize: 14 }}>Two-factor authentication</div><div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Adds an extra layer of protection</div></div>
        <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => toast.success('Two-factor authentication enabled')}>Enable</button>
      </div>
      <div className="field"><label>Change password</label><input type="password" placeholder="New password" /></div>
      <button className="btn btn-primary">Update password</button>
    </div>
  );
}

function BackupTab() {
  const toast = useToast();
  return (
    <div className="card" style={{ padding: 22, maxWidth: 480 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <DatabaseBackup size={20} color="var(--brand-blue-2)" />
        <div><div style={{ fontWeight: 600, fontSize: 14 }}>Nightly backups</div><div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Last run: today at 02:00</div></div>
        <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Enabled</span>
      </div>
      <button className="btn btn-secondary" onClick={() => toast.success('Manual backup started')}>Run backup now</button>
    </div>
  );
}

export default function SystemSettings() {
  const tabs = [
    { key: 'school', label: 'School Information', content: <SchoolInfoTab /> },
    { key: 'theme', label: 'Themes', content: <ThemeTab /> },
    { key: 'user', label: 'User Settings', content: <UserSettingsTab /> },
    { key: 'security', label: 'Security', content: <SecurityTab /> },
    { key: 'backup', label: 'Backup Settings', content: <BackupTab /> },
  ];
  return <Tabs tabs={tabs} />;
}
