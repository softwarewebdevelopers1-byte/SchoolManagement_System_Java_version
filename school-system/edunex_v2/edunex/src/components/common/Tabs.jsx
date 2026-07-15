import { useState } from 'react';

export default function Tabs({ tabs, defaultTab, onChange }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);
  const select = (key) => { setActive(key); onChange?.(key); };
  const activeTab = tabs.find((t) => t.key === active);

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 20, overflowX: 'auto' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => select(t.key)}
            className="btn-ghost"
            style={{
              padding: '11px 16px', borderRadius: 0, fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap',
              color: active === t.key ? 'var(--brand-blue-2)' : 'var(--text-secondary)',
              borderBottom: active === t.key ? '2px solid var(--brand-blue-2)' : '2px solid transparent',
              background: 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="fade-in">{activeTab?.content}</div>
    </div>
  );
}
