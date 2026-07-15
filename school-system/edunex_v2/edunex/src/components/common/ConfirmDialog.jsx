import Modal from './Modal';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', body, danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={400}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={() => { onConfirm(); onClose(); }}>Confirm</button>
      </>}
    >
      <p style={{ margin: 0 }}>{body}</p>
    </Modal>
  );
}

export function Breadcrumb({ items }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, flexWrap: 'wrap' }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {i > 0 && <ChevronRight size={13} />}
          {it.to ? <Link to={it.to} style={{ color: 'var(--text-muted)' }}>{it.label}</Link> : <span style={{ color: 'var(--text)', fontWeight: 600 }}>{it.label}</span>}
        </span>
      ))}
    </div>
  );
}
