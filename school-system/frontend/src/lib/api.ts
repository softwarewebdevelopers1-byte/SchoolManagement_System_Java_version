export interface LoginResponse {
  token: string;
  user: any;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const ROLE_PATHS: Record<string, string> = {
  SUPERADMIN: "/admin",
  ADMIN: "/admin",
  HEADTEACHER: "/headteacher",
  DEPUTYTEACHER: "/deputyHead",
  CLASSTEACHER: "/classTeacher",
  SUBJECTTEACHER: "/subjectTeacher",
  STUDENT: "/students",
};

const getStoredSession = () => {
  const saved = localStorage.getItem("user");
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

export const normalizeRoles = (roles: unknown): string[] => {
  const values = Array.isArray(roles)
    ? roles
    : roles && typeof roles === "object"
      ? Object.values(roles)
      : roles
        ? [roles]
        : [];

  return Array.from(
    new Set(
      values
        .filter(Boolean)
        .map((role) => String(role).trim().toUpperCase())
        .filter((role) => role in ROLE_PATHS),
    ),
  );
};

export const normalizeUser = (user: any) => {
  if (!user) return user;
  const teacherProfile = user.teacherProfileDto || user.teacherProfile || {};
  const roles = normalizeRoles(user.roles || user.role);
  return {
    ...user,
    ...teacherProfile,
    id: user.id || user.userId || user.usersId || teacherProfile.teacherProfileId,
    userId: user.userId || user.id || user.usersId,
    teacherId: teacherProfile.teacherProfileId || teacherProfile.id || user.teacherId,
    roles,
  };
};

export const getDefaultDashboardPath = (user: any) => {
  const roles = normalizeRoles(user?.roles || user?.role);
  return ROLE_PATHS[roles[0]] || "/admin";
};

const unwrapResponse = <T>(data: any): T => {
  if (
    data &&
    typeof data === "object" &&
    "status" in data &&
    "data" in data &&
    (data.status === "Success" || data.status === "SUCCESS")
  ) {
    return data.data as T;
  }
  return data as T;
};

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const request = async <T>(
  input: string,
  init?: RequestInit,
): Promise<T> => {
  const target = input.startsWith("http") ? input : `${API_BASE_URL}${input}`;
  const token = getStoredSession()?.token || "";

  const response = await fetch(target, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    if (response.status === 401 && !input.includes("/login")) {
      // Optional: Handle token expiration/unauthorized
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new ApiError(data.message || "Request failed.", response.status, data);
  }

  return unwrapResponse<T>(data);
};

const getSchoolId = () => normalizeUser(getStoredSession()?.user)?.schoolId;

const composeUsersDashboard = async <T>(): Promise<T> => {
  const schoolId = getSchoolId();
  if (!schoolId) throw new ApiError("No school is linked to this account.", 400, null);

  const [students, teachers, subjects, subjectJoints] = await Promise.all([
    request<any[]>(`/get/all/students?schoolId=${encodeURIComponent(schoolId)}&size=500`),
    request<any[]>(`/users/${encodeURIComponent(schoolId)}/teachers`),
    request<any[]>(`/getAll/subjects/${encodeURIComponent(schoolId)}`),
    request<any[]>(`/get/all/subject-joints/${encodeURIComponent(schoolId)}`),
  ]);

  return {
    students: (students || []).map((student: any) => ({
      id: student.userId || student.id,
      admissionNo: student.adm || student.admissionNo,
      adm: student.adm || student.admissionNo,
      name: student.fullName || student.name,
      email: student.email,
      status: student.status,
    })),
    staff: (teachers || []).map((teacher: any) => {
      const roles = normalizeRoles(teacher.roles);
      return {
        id: teacher.teacherProfileId || teacher.usersId || teacher.id,
        userId: teacher.usersId,
        email: teacher.email,
        name: [teacher.firstName, teacher.lastName].filter(Boolean).join(" ") || teacher.email,
        roles,
        roleLabel: roles.join(", "),
        status: teacher.status,
        classGrade: teacher.schoolClass,
      };
    }),
    subjects: (subjects || []).map((subject: any) => ({
      id: subject.subjectId || subject.id,
      name: subject.subjectName || subject.name,
    })),
    assignments: subjectJoints || [],
    exitedStudents: [],
  } as T;
};

export const api = {
  get: <T>(path: string, params?: Record<string, any>) => {
    if (path === "/users" && !params) {
      return composeUsersDashboard<T>();
    }
    let url = path;
    if (params) {
      const query = Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");
      if (query) url += (url.includes("?") ? "&" : "?") + query;
    }
    return request<T>(url);
  },
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};
