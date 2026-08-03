export type AuthUser = {
  id?: string;
  userId?: string;
  email?: string;
  roles?: string[];
  role?: string;
  primaryRole?: string;
  schoolId?: string;
  teacherProfileDto?: unknown;
  [key: string]: unknown;
};

export type AuthSession = {
  token: string;
  refreshToken?: string;
  user: AuthUser;
};

const STORAGE_KEY = "user";

const normalizeRole = (role: unknown) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");

export const getStoredSession = (): AuthSession | null => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    if (!parsed?.token) return null;
    return parsed;
  } catch {
    clearStoredSession();
    return null;
  }
};

export const storeSession = (session: AuthSession) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getAuthToken = () => getStoredSession()?.token || "";

export const getCurrentUser = () => getStoredSession()?.user || null;

export const getUserRoles = (user: AuthUser | null | undefined): string[] => {
  const roles = new Set<string>();

  if (Array.isArray(user?.roles)) {
    user.roles.forEach((role) => roles.add(normalizeRole(role)));
  } else if (user?.roles && typeof user.roles === "object") {
    Object.values(user.roles).forEach((role) => roles.add(normalizeRole(role)));
  }

  if (user?.role) roles.add(normalizeRole(user.role));
  if (user?.primaryRole) roles.add(normalizeRole(user.primaryRole));

  return Array.from(roles).filter(Boolean);
};

export const hasAnyRole = (
  user: AuthUser | null | undefined,
  allowedRoles: string[],
) => {
  const roles = getUserRoles(user);
  const allowed = allowedRoles.map(normalizeRole);
  return roles.some((role) => allowed.includes(role));
};

export const getDefaultDashboardPath = (user: AuthUser | null | undefined) => {
  const roles = getUserRoles(user);
  if (roles.some((role) => ["admin", "administrator", "superadmin"].includes(role))) {
    return "/dashboard";
  }
  if (roles.some((role) => ["headteacher", "deputyteacher", "deputyhead"].includes(role))) {
    return "/dashboard";
  }
  if (roles.some((role) => ["classteacher", "subjectteacher"].includes(role))) {
    return "/dashboard";
  }
  if (roles.includes("parent") || roles.includes("student")) {
    return "/students";
  }
  return "/dashboard";
};
