import { useState } from 'react';
import { Send, Search } from 'lucide-react';
import { PARENTS, TEACHERS, avatarUrl } from '../../data';

const THREADS = (list) => list.slice(0, 12).map((p, i) => ({
  id: p.id, name: p.name, avatarSeed: p.avatarSeed,
  last: ['Thanks for the update on the results.', 'Could we reschedule the meeting?', 'Noted, will follow up.', 'Appreciate the quick response!'][i % 4],
  time: `${(i % 12) + 1}${i % 2 ? 'h' : 'm'}`, unread: i < 3,
}));

export default function CommunicationModule({ audience = 'parents' }) {
  const list = audience === 'teachers' ? TEACHERS : PARENTS;
  const threads = THREADS(list);
  const [active, setActive] = useState(threads[0]);
  const [message, setMessage] = useState('');
  const [log, setLog] = useState([
    { from: 'them', text: 'Hi, could you share an update on progress this term?' },
    { from: 'me', text: 'Of course — overall performance has improved since last term.' },
  ]);

  const send = () => {
    if (!message.trim()) return;
    setLog((l) => [...l, { from: 'me', text: message }]);
    setMessage('');
  };

  return (
    <div className="card" style={{ display: 'flex', height: 560, overflow: 'hidden' }}>
      <div style={{ width: 280, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 14, borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search conversations…" style={{ width: '100%', paddingLeft: 30, background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '8px 10px 8px 30px', fontSize: 13 }} />
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {threads.map((t) => (
            <button key={t.id} onClick={() => setActive(t)} style={{
              display: 'flex', width: '100%', gap: 10, padding: '12px 14px', background: active.id === t.id ? 'var(--surface-hover)' : 'transparent', border: 'none', borderBottom: '1px solid var(--border)', textAlign: 'left',
            }}>
              <img src={avatarUrl(t.avatarSeed)} alt="" style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: t.unread ? 700 : 500 }}>{t.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.time}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.last}</div>
              </div>
              {t.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-blue)', flexShrink: 0, marginTop: 4 }} />}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 14, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={avatarUrl(active.avatarSeed)} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>{active.name}</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {log.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start', maxWidth: '70%',
              background: m.from === 'me' ? 'var(--brand-gradient)' : 'var(--bg-subtle)', color: m.from === 'me' ? '#fff' : 'var(--text)',
              padding: '10px 14px', borderRadius: 14, fontSize: 13.5,
            }}>{m.text}</div>
          ))}
        </div>
        <div style={{ padding: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a message…" style={{ flex: 1, background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: 13.5 }} />
          <button className="btn btn-primary btn-icon" onClick={send}><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
}
