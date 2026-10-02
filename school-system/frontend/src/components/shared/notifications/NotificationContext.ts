import { createContext, useContext, useMemo } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

export type NotificationOptions = {
  duration?: number;
  id?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export type AppNotification = {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
  action?: NotificationOptions["action"];
  exiting: boolean;
};

export const friendlyErrorMessage = (error: unknown, fallback: string) => {
  const candidate = error as {
    message?: unknown;
    status?: unknown;
    name?: unknown;
  } | null;
  const status = typeof candidate?.status === "number" ? candidate.status : null;

  if (status === 403) return "You do not have permission for this action.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 409) return "This action conflicts with existing data.";
  if (status === 429) return "Too many requests. Please wait and try again.";
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status !== null && status >= 500) return "Something went wrong. Please try again.";
  if (status === 400 || status === 422) {
    const backendMessage = typeof candidate?.message === "string" ? candidate.message.trim() : "";
    return backendMessage && !isTechnicalMessage(backendMessage)
      ? backendMessage
      : "Invalid request. Please check your input.";
  }

  if (candidate?.name === "TimeoutError" || candidate?.name === "AbortError") {
    return "The request took too long. Please try again.";
  }
  const message = typeof candidate?.message === "string" ? candidate.message.trim() : "";
  if (/failed to fetch|network error|load failed/i.test(message)) {
    return "Unable to connect. Check your connection and try again.";
  }
  return message && !isTechnicalMessage(message) ? message : fallback;
};

const isTechnicalMessage = (message: string) =>
  /stack trace|exception|sql|jdbc|hibernate|org\.spring|typeerror|referenceerror|syntaxerror|unexpected token|cannot read properties|undefined is not/i
    .test(message);

export type NotificationContextValue = {
  notifications: AppNotification[];
  notify: (type: NotificationType, message: string, options?: NotificationOptions) => void;
  dismiss: (id: string) => void;
};

export const NotificationContext = createContext<NotificationContextValue | null>(null);

const useContextValue = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("Notification hooks must be used within NotificationProvider.");
  }
  return context;
};

export const useNotifications = () => {
  const context = useContextValue();
  const { notify, dismiss } = context;
  return useMemo(() => ({
    success: (message: string, options?: NotificationOptions) => notify("success", message, options),
    error: (message: string, options?: NotificationOptions) => notify("error", message, options),
    warning: (message: string, options?: NotificationOptions) => notify("warning", message, options),
    info: (message: string, options?: NotificationOptions) => notify("info", message, options),
    dismiss,
  }), [notify, dismiss]);
};

export const useNotificationState = useContextValue;
