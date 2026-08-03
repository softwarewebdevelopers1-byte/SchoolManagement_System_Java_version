import {
  clearStoredSession,
  getAuthToken,
  getStoredSession,
  storeSession,
  type AuthSession,
} from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

type ApiEnvelope<T> = {
  status?: string;
  data?: T;
  message?: string;
  token?: string;
  refreshToken?: string;
  [key: string]: unknown;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const pathAliases: Record<string, string> = {
  "/users/login": "/auth/login/login-user",
  "/school/timetables/generate": "/timetables/generate",
  "/school/subjects": "/create/subject",
  "/school/assignments": "/assign/subject/teacher",
};

const resolvePath = (input: string) => pathAliases[input] || input;

const normalizeRequestBody = (path: string, init?: RequestInit) => {
  if (path !== "/auth/login/login-user" || typeof init?.body !== "string") {
    return init;
  }

  try {
    const body = JSON.parse(init.body);
    if (body.identifier && !body.email) {
      return {
        ...init,
        body: JSON.stringify({
          email: body.identifier,
          password: body.password,
          captchaToken: body.captchaToken || body.recaptchaToken || "",
        }),
      };
    }
  } catch {
    return init;
  }

  return init;
};

const parseBody = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const getErrorMessage = (data: unknown, status: number) => {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
    if (record.errors && typeof record.errors === "object") {
      return Object.values(record.errors as Record<string, unknown>)
        .flat()
        .join(" ");
    }
  }

  const fallback: Record<number, string> = {
    401: "Your session has expired. Please sign in again.",
    403: "You do not have permission to perform this action.",
    404: "The requested resource was not found.",
    409: "This action conflicts with existing school data.",
    422: "Please review the highlighted fields and try again.",
    500: "The server could not complete the request.",
  };

  return fallback[status] || "Network request failed.";
};

const unwrapEnvelope = <T>(data: ApiEnvelope<T> | T): T => {
  if (
    data &&
    typeof data === "object" &&
    ("status" in data || "data" in data || "message" in data) &&
    "data" in data
  ) {
    return (data as ApiEnvelope<T>).data as T;
  }

  return data as T;
};

export const normalizeSession = (response: unknown): AuthSession => {
  const payload = unwrapEnvelope<any>(response);
  const token = payload?.token || (response as ApiEnvelope<unknown>)?.token || "";
  const user = payload?.user || payload;

  return {
    token,
    refreshToken: payload?.refreshToken || (response as ApiEnvelope<unknown>)?.refreshToken,
    user: {
      ...user,
      id: user?.id || user?.userId,
    },
  };
};

const refreshToken = async () => {
  const session = getStoredSession();
  if (!session?.refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });

    if (!response.ok) return false;
    const data = await parseBody(response);
    storeSession(normalizeSession(data));
    return true;
  } catch {
    return false;
  }
};

export const request = async <T>(
  input: string,
  init?: RequestInit,
  retry = true,
): Promise<T> => {
  const resolvedPath = resolvePath(input);
  const target = resolvedPath.startsWith("http")
    ? resolvedPath
    : `${API_BASE_URL}${resolvedPath}`;
  const token = getAuthToken();
  const requestInit = normalizeRequestBody(resolvedPath, init);

  let response: Response;
  try {
    response = await fetch(target, {
      ...requestInit,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(requestInit?.headers || {}),
      },
    });
  } catch (error) {
    throw new ApiError("Unable to reach the school server. Please try again.", 0, error);
  }

  const data = await parseBody(response);

  if (response.status === 401 && retry && !resolvedPath.includes("/login")) {
    const refreshed = await refreshToken();
    if (refreshed) return request<T>(input, init, false);
  }

  if (!response.ok) {
    if (response.status === 401 && !resolvedPath.includes("/login")) {
      clearStoredSession();
      window.location.href = "/login";
    }
    throw new ApiError(getErrorMessage(data, response.status), response.status, data);
  }

  return unwrapEnvelope<T>(data);
};

export const api = {
  get: <T>(path: string, params?: Record<string, unknown>) => {
    let url = path;
    if (params) {
      const query = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
        )
        .join("&");
      if (query) url += (url.includes("?") ? "&" : "?") + query;
    }
    return request<T>(url);
  },
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  getWithBody: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "GET",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};
