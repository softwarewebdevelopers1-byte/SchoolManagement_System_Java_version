import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import s from "./Toast.module.css";

export interface ToastState {
  msg: string;
  kind?: "success" | "error" | "info";
}

const Icon = ({ kind }: { kind: ToastState["kind"] }) => {
  if (kind === "error") return <XCircle size={18} />;
  if (kind === "info") return <Info size={18} />;
  return <CheckCircle2 size={18} />;
};

export const Toast = ({
  toast,
  onClose,
}: {
  toast: ToastState | null;
  onClose: () => void;
}) => {
  if (!toast) return null;
  return (
    <div
      className={`${s.toast} ${s[toast.kind ?? "success"]}`}
      role="status"
      aria-live="polite"
    >
      <Icon kind={toast.kind} />
      <span>{toast.msg}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className={s.close}
      >
        <X size={14} />
      </button>
    </div>
  );
};
