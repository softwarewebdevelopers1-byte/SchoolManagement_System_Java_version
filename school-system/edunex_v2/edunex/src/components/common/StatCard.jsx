import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, delta, deltaDirection = 'up', tone = 'blue', notch = false }) {
  const Wrapper = notch ? 'div' : 'div';
  return (
    <div className={notch ? 'notch-card' : 'card'} style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, marginTop: 8, color: 'var(--text)' }}>{value}</div>
        </div>
        {Icon && (
          <div style={{
            width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `var(--${tone}-soft, var(--brand-gradient-soft))`, color: tone === 'blue' ? 'var(--brand-blue)' : `var(--${tone})`,
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {delta && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, fontSize: 12.5, fontWeight: 600, color: deltaDirection === 'up' ? 'var(--success)' : 'var(--danger)' }}>
          {deltaDirection === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {delta}
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>vs last term</span>
        </div>
      )}
    </div>
  );
}
