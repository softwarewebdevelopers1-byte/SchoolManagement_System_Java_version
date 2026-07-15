import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
let idCounter = 0;

const ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, message, type }]);
    if (duration) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    warning: (m) => push(m, 'warning'),
    info: (m) => push(m, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10, width: 340, maxWidth: 'calc(100vw - 40px)'
      }}>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div key={t.id} className="fade-in card" style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '13px 14px',
              borderLeft: `3px solid var(--${t.type === 'error' ? 'danger' : t.type})`
            }}>
              <Icon size={18} color={`var(--${t.type === 'error' ? 'danger' : t.type})`} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13.5, color: 'var(--text)', flex: 1, lineHeight: 1.5 }}>{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="btn-icon btn-ghost" style={{ padding: 2 }}>
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
