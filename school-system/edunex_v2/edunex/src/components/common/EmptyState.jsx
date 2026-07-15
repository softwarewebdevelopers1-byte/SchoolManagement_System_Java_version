export default function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="card" style={{ padding: '56px 30px', textAlign: 'center' }}>
      {Icon && (
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--brand-gradient-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--brand-blue)' }}>
          <Icon size={26} />
        </div>
      )}
      <h3 style={{ fontSize: 16, marginBottom: 6 }}>{title}</h3>
      {body && <p style={{ maxWidth: 340, margin: '0 auto 16px' }}>{body}</p>}
      {action}
    </div>
  );
}
