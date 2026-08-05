export interface LoginResponse {
  token: string;
  user: any;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const ROLE_PATHS: Record<string, string> = {
  SUPERADMIN: "/admin",
  ADMIN: "/admin",
  HEADTEACHER: "/headteacher",
  DEPUTYTEACHER: "/deputyHead",
  CLASSTEACHER: "/classTeacher",
  SUBJECTTEACHER: "/subjectTeacher",
  STUDENT: "/students",
};

const PATH_TO_ROLE: Record<string, string> = {
  "/admin": "ADMIN",
  "/headteacher": "HEADTEACHER",
  "/deputyHead": "DEPUTYTEACHER",
  "/classTeacher": "CLASSTEACHER",
  "/subjectTeacher": "SUBJECTTEACHER",
  "/students": "STUDENT",
};

export const getSchoolId = (): string | null => {
  const session = getStoredSession();
  if (!session) return null;
  const user = normalizeUser(session.user || session);
  return user?.schoolId || null;
};

export const getCurrentUserId = (): string | null => {
  const session = getStoredSession();
  if (!session) return null;
  const user = normalizeUser(session.user || session);
  return user?.userId || user?.id || null;
};
export const getCurrentTeacherProfileId = (): string | null => {
  const session = getStoredSession();
  if (!session) return null;
  const user = normalizeUser(session.user || session);
  return user?.teacherProfileDto.teacherProfileId || null;
};
export const getClassId = (): string | null => {
  const session = getStoredSession();
  if (!session) return null;
  const user = normalizeUser(session.user || session);
  return user?.classDto.id || null;
};

export const getStoredSession = () => {
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
    id:
      user.userId || user.id || user.usersId || teacherProfile.teacherProfileId,
    userId: user.userId || user.id || user.usersId,
    teacherId:
      teacherProfile.teacherProfileId || teacherProfile.id || user.teacherId,
    schoolId: user.schoolId || user.schoolId,
    email: user.email,
    roles,
    firstName: user.firstName || teacherProfile.firstName || "",
    lastName: user.lastName || teacherProfile.lastName || "",
    name:
      user.name ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      teacherProfile.name ||
      "",
  };
};

export const getDefaultDashboardPath = (user: any) => {
  const roles = normalizeRoles(user?.roles || user?.role);
  return `edunex-org${ROLE_PATHS[roles[0]]}` || "/";
};

export const getRoleFromPath = (path: string): string => {
  return PATH_TO_ROLE[path] || "";
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

export const request = async <T>(
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
    throw new ApiError(
      data.message || "Request failed.",
      response.status,
      data,
    );
  }

  return unwrapResponse<T>(data);
};

const splitName = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || name || "Staff",
    lastName: parts.slice(1).join(" ") || "Member",
  };
};

const splitClassName = (className: unknown) => {
  const [classGrade = "", ...streamParts] = String(className || "").split(" ");
  return {
    classGrade,
    classStream: streamParts.join(" "),
  };
};

const loadClasses = async () => {
  const schoolId = getSchoolId();
  if (!schoolId) return [];
  const classes = await request<any[]>(
    `/all/classes/${encodeURIComponent(schoolId)}`,
  );
  return (classes || []).map((item: any) => {
    const parsed = splitClassName(item.className);
    return {
      id: item.classId,
      classId: item.classId,
      name: item.className,
      grade: parsed.classGrade,
      stream: parsed.classStream,
      classGrade: parsed.classGrade,
      classStream: parsed.classStream,
      students: item.totalStudents || 0,
      classTeacher: item.classTeacher,
    };
  });
};

const loadSubjectJoints = async () => {
  const schoolId = getSchoolId();
  if (!schoolId) return [];
  const joints = await request<any[]>(
    `/get/all/subject-joints/${encodeURIComponent(schoolId)}`,
  );
  return (joints || []).map((joint: any) => {
    const parsed = splitClassName(joint.className);
    return {
      ...joint,
      id: joint.subjectJointId,
      subjectId: {
        _id: joint.subjectJointId,
        id: joint.subjectJointId,
        name: joint.subjectName,
      },
      name: joint.subjectName,
      classGrade: parsed.classGrade,
      classStream: parsed.classStream,
      teacherId: joint.subjectTeacherId,
      subjectTeacherId: joint.subjectTeacherId,
      teacherName: joint.subjectTeacherName,
      enrollmentMode:
        joint.subjectType === "ELECTIVE" ? "elective" : "compulsory",
      isOffered: joint.subjectType !== "DROPPED",
      sharedSlotId: joint.electiveCode || null,
    };
  });
};

const findClassId = async (grade?: string | number, stream?: string) => {
  const classes = await loadClasses();
  const normalizedGrade = String(grade || "").trim();
  const normalizedStream = String(stream || "").trim();
  return classes.find(
    (item) =>
      String(item.classGrade).trim() === normalizedGrade &&
      String(item.classStream || "").trim() === normalizedStream,
  )?.classId;
};

const composeTeacherAssignments = async <T>(teacherId: string): Promise<T> => {
  const joints = await loadSubjectJoints();
  return joints.filter(
    (joint) => String(joint.subjectTeacherId || "") === String(teacherId),
  ) as T;
};

const loadLegacyMarks = async <T>(params?: Record<string, any>): Promise<T> => {
  const subjectJointId = params?.subjectJointId || params?.subjectId;
  if (!subjectJointId) return [] as T;
  const sheet = await request<any>(`/marks/${subjectJointId}`);
  for (let i = 0; i < sheet?.marksRow.length; i++) {
    console.log(sheet?.marksRow[i]);
  }
  return (sheet?.marksRow || []).map((row: any) => ({
    studentId: row.studentId,
    admissionNo: row.studentAdm,
    name: row.studentName,
    marks: {
      cat1: row.cat1,
      cat2: row.cat2,
      cat3: row.cat3,
      cat4: null,
      cat5: null,
      cat1Max: sheet.maxCat1 || 40,
      cat2Max: sheet.maxCat2 || 40,
      cat3Max: sheet.maxCat3 || 40,
      cat4Max: 40,
      cat5Max: 40,
      exam: row.exam,
      examMax: sheet.maxExam || 100,
      finalScore: row.totalMarks,
      points: row.points,
      cbcBand: row.marksGrade,
    },
  })) as T;
};

const saveLegacyMarks = async <T>(body: any): Promise<T> => {
  const schoolId = getSchoolId();
  const subjectJointId = body?.subjectJointId;
  console.log("-->subject joint", subjectJointId, " school id --> ", schoolId);

  if (!schoolId || !subjectJointId) {
    throw new ApiError(
      "Missing school or subject assignment for marks entry.",
      400,
      body,
    );
  }

  const rows = Array.isArray(body?.marksData) ? body.marksData : [];
  return request<T>("/marks/entry", {
    method: "POST",
    body: JSON.stringify({
      schoolId,
      subjectJointId,
      maxCat1: body?.catConfigs?.cat1Max || rows[0]?.cat1Max || 40,
      maxCat2: body?.catConfigs?.cat2Max || rows[0]?.cat2Max || 40,
      maxCat3: body?.catConfigs?.cat3Max || rows[0]?.cat3Max || 40,
      maxExam: body?.catConfigs?.examMax || rows[0]?.examMax || 100,
      markInputDTOs: rows.map((row: any) => ({
        studentId: row.studentId,
        cat1: row.cat1 ?? null,
        cat2: row.cat2 ?? null,
        cat3: row.cat3 ?? null,
        exam: row.exam ?? null,
      })),
    }),
  });
};

const createLegacyUser = async <T>(body: any): Promise<T> => {
  const schoolId = getSchoolId();
  if (body?.role === "student") {
    const classId =
      body.classId || (await findClassId(body.classGrade, body.classStream));
    return request<T>("/register/students", {
      method: "POST",
      body: JSON.stringify({
        email: body.email || `${body.admissionNo || body.adm}@student.local`,
        studentFullName: body.name,
        studentAdm: body.admissionNo || body.adm,
        phoneNumber: body.guardianPhone,
        classId,
        schoolId,
      }),
    });
  }

  const names = splitName(body?.name);
  return request<T>("/users/teacher", {
    method: "POST",
    body: JSON.stringify({
      email: body.email,
      password: body.password || "Password@123",
      firstName: body.firstName || names.firstName,
      lastName: body.lastName || names.lastName,
      roles: normalizeRoles(body.roles),
    }),
  });
};

const updateLegacyUser = async <T>(path: string, body: any): Promise<T> => {
  const id = path.split("/").filter(Boolean)[1];

  if (body?.role === "student" || body?.admissionNo || body?.adm) {
    const classId =
      body.classId || (await findClassId(body.classGrade, body.classStream));
    return request<T>("/update/id", {
      method: "PATCH",
      body: JSON.stringify({
        studentId: id,
        email: body.email || `${body.admissionNo || body.adm}@student.local`,
        studentFullName: body.name,
        studentAdm: body.admissionNo || body.adm,
        phoneNumber: body.guardianPhone,
        classId,
        status: body.status ? String(body.status).toUpperCase() : undefined,
      }),
    });
  }

  const names = splitName(body?.name);
  return request<T>("/users/update", {
    method: "PATCH",
    body: JSON.stringify({
      teacherId: body.teacherId || id,
      email: body.email,
      password: body.password,
      firstName: body.firstName || names.firstName,
      lastName: body.lastName || names.lastName,
      status: body.status ? String(body.status).toUpperCase() : undefined,
      roles: normalizeRoles(body.roles),
    }),
  });
};

const createLegacySubject = async <T>(body: any): Promise<T> => {
  return request<T>("/create/subject", {
    method: "POST",
    body: JSON.stringify({
      subjectName: body.name || body.subjectName,
      schoolId: getSchoolId(),
    }),
  });
};

const updateLegacySubject = async <T>(path: string, body: any): Promise<T> => {
  const subjectId = path.split("/").filter(Boolean)[2];
  return request<T>("/update/subject", {
    method: "PATCH",
    body: JSON.stringify({
      subjectId,
      subjectName: body.name || body.subjectName,
      schoolId: getSchoolId(),
    }),
  });
};

const createLegacyAssignment = async <T>(body: any): Promise<T> => {
  const classId =
    body.classId || (await findClassId(body.classGrade, body.classStream));
  if (!body.teacherId && classId && body.classTeacherId) {
    return request<T>("/update/class", {
      method: "PATCH",
      body: JSON.stringify({
        classId,
        schoolId: getSchoolId(),
        grade: Number(body.classGrade),
        classStream: body.classStream || "",
        classTeacherId: body.classTeacherId,
      }),
    });
  }

  let subjectJointId = body.subjectJointId;
  if (!subjectJointId) {
    const joints = await loadSubjectJoints();
    subjectJointId =
      joints.find(
        (joint) =>
          String(joint.classGrade) === String(body.classGrade) &&
          String(joint.classStream || "") === String(body.classStream || "") &&
          String(joint.subjectId?.id || joint.id) === String(body.subjectId),
      )?.id || body.subjectId;
  }
  return request<T>("/assign/subject/teacher", {
    method: "POST",
    body: JSON.stringify({
      subjectJointId,
      teacherId: body.teacherId,
    }),
  });
};

const composeUsersDashboard = async <T>(): Promise<T> => {
  const schoolId = getSchoolId();
  if (!schoolId)
    throw new ApiError("No school is linked to this account.", 400, null);

  const [students, teachers, subjects, subjectJoints] = await Promise.all([
    request<any[]>(
      `/get/all/students?schoolId=${encodeURIComponent(schoolId)}&size=500`,
    ),
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
        name:
          [teacher.firstName, teacher.lastName].filter(Boolean).join(" ") ||
          teacher.email,
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

const fetchStudentsData = async <T>(): Promise<T> => {
  const schoolId = getSchoolId();
  if (!schoolId)
    throw new ApiError("No school is linked to this account.", 400, null);
  return request<T>(
    `/get/all/students?schoolId=${encodeURIComponent(schoolId)}&size=500`,
  );
};

const fetchTeachersData = async <T>(): Promise<T> => {
  const schoolId = getSchoolId();
  if (!schoolId)
    throw new ApiError("No school is linked to this account.", 400, null);
  return request<T>(`/users/${encodeURIComponent(schoolId)}/teachers`);
};

const fetchSubjectsData = async <T>(): Promise<T> => {
  const schoolId = getSchoolId();
  if (!schoolId)
    throw new ApiError("No school is linked to this account.", 400, null);
  const subjects = await request<any[]>(
    `/getAll/subjects/${encodeURIComponent(schoolId)}`,
  );
  return (subjects || []).map((subject: any) => ({
    id: subject.subjectId || subject.id,
    name: subject.subjectName || subject.name,
    department: subject.department || "General",
  })) as T;
};

const fetchExitedStudentsData = async <T>(): Promise<T> => {
  const schoolId = getSchoolId();
  if (!schoolId)
    throw new ApiError("No school is linked to this account.", 400, null);
  const data = await request<any[]>(
    `/users/exited-students?schoolId=${encodeURIComponent(schoolId)}`,
  );
  return data as T;
};

const fetchDashboardStatsData = async <T>(): Promise<T> => {
  const schoolId = getSchoolId();
  if (!schoolId)
    throw new ApiError("No school is linked to this account.", 400, null);

  const students = await request<any[]>(
    `/get/all/students?schoolId=${encodeURIComponent(schoolId)}&size=500`,
  );
  const teachers = await request<any[]>(
    `/users/${encodeURIComponent(schoolId)}/teachers`,
  );
  const subjects = await request<any[]>(
    `/getAll/subjects/${encodeURIComponent(schoolId)}`,
  );
  const subjectJoints = await request<any[]>(
    `/get/all/subject-joints/${encodeURIComponent(schoolId)}`,
  );
  const classSubjectSettings = await loadSubjectJoints();

  const mappedStudents = (students || []).map((student: any) => ({
    id: student.userId || student.id,
    admissionNo: student.adm || student.admissionNo,
    name: student.fullName || student.name,
    status: student.status,
    classGrade: student.classGrade,
    classStream: student.classStream,
    term: student.term,
    year: student.year,
    examType: student.examType,
  }));
  const mappedTeachers = (teachers || []).map((teacher: any) => {
    const roles = normalizeRoles(teacher.roles);
    return {
      id: teacher.teacherProfileId || teacher.usersId || teacher.id,
      name:
        [teacher.firstName, teacher.lastName].filter(Boolean).join(" ") ||
        teacher.email,
      roles,
      status: teacher.status,
      classGrade: teacher.schoolClass,
      classStream: teacher.classStream,
      department: teacher.department,
      term: teacher.term,
      year: teacher.year,
      examType: teacher.examType,
    };
  });

  const classes = new Set<string>();
  const classTeacherSet = new Set<string>();
  mappedStudents.forEach((s) => {
    if (s.classGrade && s.status?.toLowerCase() !== "completed") {
      classes.add(`${s.classGrade}::${s.classStream || ""}`);
    }
  });
  mappedTeachers.forEach((t) => {
    if (t.classGrade) {
      const cid = `${t.classGrade}::${t.classStream || ""}`;
      if (classes.has(cid)) {
        classTeacherSet.add(cid);
      } else {
        classes.add(cid);
      }
    }
  });

  const teachersWithClass = mappedTeachers.filter((t) => t.classGrade).length;

  return {
    classesCount: classes.size,
    subjectsCount: (subjects || []).length,
    teachersCount: (teachers || []).length,
    assignedCT: classTeacherSet.size,
    totalClasses: classes.size,
    unassignedCount: classes.size - classTeacherSet.size,
    studentsCount: mappedStudents.filter(
      (s) => s.status?.toLowerCase() !== "completed",
    ).length,
    activeTeachers: mappedTeachers.filter(
      (t) => t.status?.toLowerCase() !== "inactive",
    ).length,
    assignedSubjectsCount: new Set(
      (subjectJoints || []).map((a: any) => a.subjectId),
    ).size,
  } as T;
};

const fetchAssignmentsData = async <T>(): Promise<T> => {
  const schoolId = getSchoolId();
  if (!schoolId)
    throw new ApiError("No school is linked to this account.", 400, null);
  return request<T>(`/get/all/subject-joints/${encodeURIComponent(schoolId)}`);
};

export const api = {
  get: <T>(path: string, params?: Record<string, any>) => {
    if (path === "/users" && !params) {
      return composeUsersDashboard<T>();
    }
    if (path === "/auth/me") {
      return request<any>("/auth/me").then((context) =>
        normalizeUser(context?.user || context),
      ) as Promise<T>;
    }
    if (/^\/users\/[^/]+$/.test(path) && path !== "/users/student-dashboard") {
      const userId = path.split("/").pop();
      return request<any>(`/users/${userId}`).then((context) =>
        normalizeUser(context),
      ) as Promise<T>;
    }
    if (path === "/users/students") {
      return fetchStudentsData<T>();
    }
    if (path === "/users/teachers") {
      return fetchTeachersData<T>();
    }
    if (path === "/users/exited") {
      return fetchExitedStudentsData<T>();
    }
    if (path === "/school/subjects") {
      return fetchSubjectsData<T>();
    }
    if (path === "/dashboard/stats") {
      return fetchDashboardStatsData<T>();
    }
    if (path === "/users/student-dashboard") {
      return request<T>("/users/student-dashboard");
    }
    if (path.startsWith("/users/class/")) {
      const parts = path.split("/");
      const grade = parts[3];
      const stream = parts[4] || "";
      return findClassId(grade, stream).then((classId) =>
        classId
          ? request<T>(
              `/get/students?classId=${encodeURIComponent(classId)}&size=500`,
            )
          : ([] as T),
      );
    }
    if (path === "/school/class-subjects") {
      return loadSubjectJoints() as Promise<T>;
    }
    if (path === "/school/assignments") {
      return fetchAssignmentsData<T>();
    }
    if (path.startsWith("/school/assignments/teacher/")) {
      return composeTeacherAssignments<T>(path.split("/").pop() || "");
    }
    if (path.startsWith("/marks/averages/teacher/")) {
      const teacherId = path.split("/").pop();
      return request<T>(`/marks/averages/teacher/${teacherId}`, {
        method: "GET",
      });
    }
    if (path === "/marks") {
      return loadLegacyMarks<T>(params);
    }
    if (path === "/school/classes") {
      return loadClasses() as Promise<T>;
    }
    if (path === "/school/archives") {
      return request<T>("/school/archives");
    }
    if (path === "/school/timetables/my") {
      return request<T>("/school/timetables/my");
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
  post: <T>(path: string, body: any) => {
    if (path === "/users") {
      return createLegacyUser<T>(body);
    }
    if (path === "/school/subjects") {
      return createLegacySubject<T>(body);
    }
    if (path === "/school/assignments") {
      return createLegacyAssignment<T>(body);
    }
    if (path === "/marks/save" || path === "/marks/summary-save") {
      return saveLegacyMarks<T>(body);
    }
    if (path === "/users/parent-concerns") {
      return request<T>("/users/parent-concerns", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }
    return request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  put: <T>(path: string, body: any) => {
    if (path === "/users/password") {
      const user = normalizeUser(getStoredSession()?.user);
      return request<T>("/update/user", {
        method: "PATCH",
        body: JSON.stringify({
          userUuid: user?.userId || user?.id,
          password: body.newPassword,
        }),
      });
    }
    if (/^\/users\/[^/]+$/.test(path)) {
      return updateLegacyUser<T>(path, body);
    }
    if (path.startsWith("/school/subjects/")) {
      return updateLegacySubject<T>(path, body);
    }
    if (path === "/school/class-subjects") {
      return request<T>("/update/subject-joint", {
        method: "PATCH",
        body: JSON.stringify({
          subjectJointId: body.subjectId,
          subjectType:
            body.isOffered === false
              ? "DROPPED"
              : body.enrollmentMode === "elective"
                ? "ELECTIVE"
                : "COMPULSORY",
          electiveCode: body.sharedSlotId,
        }),
      });
    }
    if (path === "/users/graduation-settings") {
      return request<T>("/users/graduation-settings", {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }
    if (path === "/users/bulk-enroll-elective") {
      return request<T>("/users/bulk-enroll-elective", {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }
    if (path === "/users/bulk-update-term") {
      return request<T>("/users/bulk-update-term", {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }
    if (
      path.startsWith("/users/parent-concerns/") &&
      path.endsWith("/status")
    ) {
      return request<T>(path, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }
    return request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: <T>(path: string) => {
    if (/^\/users\/[^/]+$/.test(path)) {
      const userId = path.split("/").pop();
      return request<T>(`/delete/user?id=${encodeURIComponent(userId || "")}`, {
        method: "PATCH",
      });
    }
    if (path.startsWith("/school/assignments/")) {
      const assignmentId = path.split("/").pop();
      return loadSubjectJoints().then((joints) => {
        const joint = joints.find(
          (item) => String(item.id) === String(assignmentId),
        );
        if (!joint?.subjectTeacherId) {
          throw new ApiError(
            "This subject is not assigned to a teacher.",
            400,
            { assignmentId },
          );
        }
        return request<T>("/unassign/subject/teacher", {
          method: "PATCH",
          body: JSON.stringify({
            subjectJointId: joint.id,
            teacherId: joint.subjectTeacherId,
          }),
        });
      });
    }
    if (path.startsWith("/school/subjects/")) {
      return request<T>(path, { method: "DELETE" });
    }
    if (path.startsWith("/school/timetables/")) {
      return request<T>(path, { method: "DELETE" });
    }
    if (path.startsWith("/users/exited-students/")) {
      return request<T>(path, { method: "DELETE" });
    }
    return request<T>(path, {
      method: "DELETE",
    });
  },
};
