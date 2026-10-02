import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useNotificationState } from "./NotificationContext";
import styles from "./Notification.module.css";

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
};

export const NotificationContainer = () => {
  const { notifications, dismiss } = useNotificationState();

  return (
    <div className={styles.container} aria-label="Notifications">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={dismiss}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({
  notification,
  onDismiss,
}: {
  notification: ReturnType<typeof useNotificationState>["notifications"][number];
  onDismiss: (id: string) => void;
}) => {
  const Icon = icons[notification.type];
  const dismissNotification = useCallback(
    () => onDismiss(notification.id),
    [onDismiss, notification.id],
  );
  const remaining = useRef(notification.duration);
  const startedAt = useRef(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (notification.duration <= 0 || notification.exiting) return;
    startedAt.current = Date.now();
    timer.current = window.setTimeout(dismissNotification, remaining.current);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [notification.duration, notification.exiting, dismissNotification]);

  const pauseTimer = () => {
    if (timer.current === null) return;
    window.clearTimeout(timer.current);
    timer.current = null;
    remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
  };

  const resumeTimer = () => {
    if (notification.duration <= 0 || notification.exiting || timer.current !== null) return;
    startedAt.current = Date.now();
    timer.current = window.setTimeout(dismissNotification, remaining.current);
  };

  const liveRole = notification.type === "error" || notification.type === "warning"
    ? "alert"
    : "status";

  return (
    <div
      className={`${styles.notification} ${styles[notification.type]} ${notification.exiting ? styles.exit : ""}`}
      role={liveRole}
      aria-live={liveRole === "alert" ? "assertive" : "polite"}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
    >
      <Icon className={styles.icon} aria-hidden="true" size={21} strokeWidth={2.2} />
      <p className={styles.message}>{notification.message}</p>
      {notification.action && (
        <button
          className={styles.action}
          type="button"
          onClick={() => {
            notification.action?.onClick();
            dismissNotification();
          }}
        >
          {notification.action.label}
        </button>
      )}
      <button
        className={styles.close}
        type="button"
        aria-label="Dismiss notification"
        onClick={dismissNotification}
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
};
