import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import s from "./Modal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
}: Props) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={s.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={`${s.panel} ${s[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <header className={s.header}>
            <div>
              <h2 className={s.title}>{title}</h2>
              {subtitle && <p className={s.subtitle}>{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={s.close}
            >
              <X size={18} />
            </button>
          </header>
        )}
        <div className={s.body}>{children}</div>
        {footer && <footer className={s.footer}>{footer}</footer>}
      </div>
    </div>
  );
};
