import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  friendlyErrorMessage,
  NotificationContext,
  type AppNotification,
  type NotificationContextValue,
  type NotificationOptions,
  type NotificationType,
} from "./NotificationContext";

const MAX_NOTIFICATIONS = 5;
const DUPLICATE_WINDOW_MS = 500;
const EXIT_DURATION_MS = 180;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const recentNotifications = useRef(new Map<string, number>());
  const exitTimers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, exiting: true } : notification,
      ),
    );
    if (exitTimers.current.has(id)) return;
    const timer = window.setTimeout(() => {
      setNotifications((current) => current.filter((notification) => notification.id !== id));
      exitTimers.current.delete(id);
    }, EXIT_DURATION_MS);
    exitTimers.current.set(id, timer);
  }, []);

  const notify = useCallback((
    type: NotificationType,
    message: string,
    options: NotificationOptions = {},
  ) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const dedupeKey = options.id || `${type}:${trimmedMessage}`;
    const now = Date.now();
    recentNotifications.current.forEach((createdAt, key) => {
      if (now - createdAt >= DUPLICATE_WINDOW_MS) recentNotifications.current.delete(key);
    });
    const previousTime = recentNotifications.current.get(dedupeKey);
    if (previousTime !== undefined && now - previousTime < DUPLICATE_WINDOW_MS) return;
    recentNotifications.current.set(dedupeKey, now);
    while (recentNotifications.current.size > 50) {
      const oldestKey = recentNotifications.current.keys().next().value;
      if (oldestKey === undefined) break;
      recentNotifications.current.delete(oldestKey);
    }

    const defaultDuration = type === "error" ? 6000 : type === "warning" ? 5000 : 4000;
    const duration =
      options.duration !== undefined && options.duration > 0
        ? options.duration
        : defaultDuration;
    const notification: AppNotification = {
      id: `${now}-${Math.random().toString(36).slice(2)}`,
      type,
      message: trimmedMessage,
      duration,
      action: options.action,
      exiting: false,
    };
    setNotifications((current) => [notification, ...current].slice(0, MAX_NOTIFICATIONS));
  }, []);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      notify(
        "error",
        friendlyErrorMessage(event.reason, "Something went wrong. Please try again."),
        { id: "unhandled-rejection" },
      );
    };
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [notify]);

  useEffect(() => () => {
    exitTimers.current.forEach((timer) => window.clearTimeout(timer));
    exitTimers.current.clear();
  }, []);

  const value = useMemo<NotificationContextValue>(() => ({
    notifications,
    notify,
    dismiss,
  }), [notifications, notify, dismiss]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
