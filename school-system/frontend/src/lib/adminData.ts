import { useEffect, useState, useCallback } from "react";
import { api, getSchoolId } from "./api";
import {
  buildClassId,
  getClassSubjectSetting,
  type SubjectEnrollmentMode,
} from "./subjectEnrollment";
import type {
  ApiAssignment,
  ApiStudent,
  ApiTeacher,
  Class,
  ClassSubjectSetting,
  ExitedStudent,
  Student,
  Subject,
  Teacher,
} from "../components/admin/types";

const splitClassName = (className: unknown) => {
  const [classGrade = "", ...streamParts] = String(className || "").split(" ");
  return {
    classGrade,
    classStream: streamParts.join(" "),
  };
};

export const normalizeStatus = (value?: string) => {
  const normalized = value?.toLowerCase();
  if (normalized === "inactive") return "Inactive";
  if (normalized === "completed") return "Completed";
  return "Active";
};

export const isActiveStudent = (student: Student) =>
  student.status === "Active";

export const mapStaffToTeachers = (staff: ApiTeacher[]): Teacher[] =>
  staff.map((member) => ({
    ...member,
    status: normalizeStatus(member.status),
    subjects: member.subjects || [],
  }));

export const mapStudentsFromApi = (students: ApiStudent[]): Student[] =>
  students.map((student) => ({
    id: student.id,
    admissionNo: student.admissionNo,
    adm: student.admissionNo || (student as any).adm,
    name: student.name,
    gender: student.gender,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    classId: buildClassId(student.classGrade, student.classStream),
    classGrade: student.classGrade,
    classStream: student.classStream || "",
    enrolledSubjects: student.enrolledSubjects || [],
    status: normalizeStatus(student.status),
    term: student.term,
    year: student.year,
    examType: student.examType,
  }));

export const deriveClasses = (
  students: Student[],
  teachers: Teacher[],
  subjects: Subject[],
  assignments: ApiAssignment[],
  classSubjectSettings: ClassSubjectSetting[],
): Class[] => {
  const classMap = new Map<string, Class>();
  const allSubjectIds = subjects.map((subject) => subject.id);

  const getSubjectSettingsForClass = (grade: string, stream: string) =>
    Object.fromEntries(
      subjects.map((subject) => {
        const setting = getClassSubjectSetting(
          classSubjectSettings,
          subject.id,
          grade,
          stream,
        );

        return [
          subject.id,
          {
            id: `${grade}:${stream}:${subject.id}`,
            subjectId: subject.id,
            classGrade: grade,
            classStream: stream,
            isOffered: setting.isOffered,
            enrollmentMode: setting.enrollmentMode,
            sharedSlotId: setting.sharedSlotId,
          },
        ];
      }),
    ) as Record<string, ClassSubjectSetting>;

  const getAssignmentsForClass = (
    grade: string,
    stream: string,
    offeredSubjectIds: string[],
  ) => {
    const res: Record<string, string> = {};
    assignments.forEach((a) => {
      if (
        a.classGrade === grade &&
        a.classStream === stream &&
        offeredSubjectIds.includes(a.subjectId)
      ) {
        res[a.subjectId] = a.teacherId;
      }
    });
    return res;
  };

  students
    .filter((student) => student.classId && isActiveStudent(student))
    .forEach((student) => {
      const [grade, stream = ""] = student.classId.split("::");
      const classTeacher = teachers.find(
        (teacher) =>
          (teacher.classGrade || "").trim() === grade &&
          (teacher.classStream || "").trim() === stream,
      );
      const subjectSettings = getSubjectSettingsForClass(grade, stream);
      const droppedSubjectIds = Object.values(subjectSettings)
        .filter((setting) => setting.isOffered === false)
        .map((setting) => setting.subjectId);
      const offeredSubjectIds = allSubjectIds.filter(
        (subjectId) => !droppedSubjectIds.includes(subjectId),
      );
      const compulsorySubjectIds = offeredSubjectIds.filter(
        (subjectId) =>
          (subjectSettings[subjectId]?.enrollmentMode || "compulsory") ===
          "compulsory",
      );
      const electiveSubjectIds = offeredSubjectIds.filter(
        (subjectId) =>
          (subjectSettings[subjectId]?.enrollmentMode || "compulsory") ===
          "elective",
      );

      classMap.set(student.classId, {
        id: student.classId,
        name: `Grade ${grade}${stream ? ` ${stream}` : ""}`,
        grade,
        stream,
        students: students.filter(
          (current) =>
            current.classId === student.classId && isActiveStudent(current),
        ).length,
        classTeacherId: classTeacher?.id || "",
        subjectAssignments: getAssignmentsForClass(
          grade,
          stream,
          offeredSubjectIds,
        ),
        subjectSettings,
        offeredSubjectIds,
        droppedSubjectIds,
        compulsorySubjectIds,
        electiveSubjectIds,
        term: classTeacher?.term || student.term || 1,
        year: classTeacher?.year || student.year || 2024,
        examType: classTeacher?.examType || student.examType || "opener",
      });
    });

  teachers
    .filter((teacher) => teacher.classGrade)
    .forEach((teacher) => {
      const grade = teacher.classGrade || "";
      const stream = teacher.classStream || "";
      const classId = buildClassId(grade, stream);
      const subjectSettings = getSubjectSettingsForClass(grade, stream);
      const droppedSubjectIds = Object.values(subjectSettings)
        .filter((setting) => setting.isOffered === false)
        .map((setting) => setting.subjectId);
      const offeredSubjectIds = allSubjectIds.filter(
        (subjectId) => !droppedSubjectIds.includes(subjectId),
      );
      const compulsorySubjectIds = offeredSubjectIds.filter(
        (subjectId) =>
          (subjectSettings[subjectId]?.enrollmentMode || "compulsory") ===
          "compulsory",
      );
      const electiveSubjectIds = offeredSubjectIds.filter(
        (subjectId) =>
          (subjectSettings[subjectId]?.enrollmentMode || "compulsory") ===
          "elective",
      );

      if (classMap.has(classId)) {
        return;
      }

      classMap.set(classId, {
        id: classId,
        name: `Grade ${grade}${stream ? ` ${stream}` : ""}`,
        grade,
        stream,
        students: 0,
        classTeacherId: teacher.id,
        subjectAssignments: getAssignmentsForClass(
          grade,
          stream,
          offeredSubjectIds,
        ),
        subjectSettings,
        offeredSubjectIds,
        droppedSubjectIds,
        compulsorySubjectIds,
        electiveSubjectIds,
        term: teacher.term || 1,
        year: teacher.year || 2024,
        examType: teacher.examType || "opener",
      });
    });

  return Array.from(classMap.values()).sort((first, second) =>
    first.name.localeCompare(second.name),
  );
};

export const avatar = (name: string, size: number) => {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#163325;color:#fff;display:flex;align-items:center;justify-content:center;font-size:${Math.max(
    10,
    size / 2.4,
  )}px;font-weight:700;">${initials}</div>`;
};

export const pill = (text: string, color: string) => {
  const palette: Record<string, { bg: string; text: string }> = {
    green: { bg: "var(--sBg)", text: "var(--sText)" },
    amber: { bg: "var(--wBg)", text: "var(--wText)" },
    red: { bg: "var(--dBg)", text: "var(--dText)" },
    blue: { bg: "var(--iBg)", text: "var(--iText)" },
    gray: { bg: "var(--sand)", text: "var(--textMut)" },
  };
  const colors = palette[color] || palette.gray;
  return `<span style="display:inline-block;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;background:${colors.bg};color:${colors.text};">${text}</span>`;
};

export const emptyStateStyle: React.CSSProperties = {
  minHeight: 220,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  textAlign: "center",
  color: "var(--textMut)",
};

export const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--textM)",
  cursor: "pointer",
};

export const primaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--gold)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

export interface DashboardStats {
  classesCount: number;
  subjectsCount: number;
  teachersCount: number;
  assignedCT: number;
  totalClasses: number;
  unassignedCount: number;
  studentsCount: number;
  activeTeachers: number;
  assignedSubjectsCount: number;
}

export const fetchStudents = async (): Promise<Student[]> => {
  const response = await api.get<ApiStudent[]>(
    `/get/all/students?schoolId=${encodeURIComponent(getSchoolId()!)}`,
  );
  return mapStudentsFromApi(response || []).filter(
    (student) => student.status !== "Completed",
  );
};

export const fetchTeachers = async (): Promise<Teacher[]> => {
  const response = await api.get<ApiTeacher[]>(
    `/users/${encodeURIComponent(getSchoolId()!)}/teachers`,
  );
  return mapStaffToTeachers(response || []);
};

export const fetchSubjects = async (): Promise<Subject[]> => {
  const response = await api.get<Subject[]>("/school/subjects");
  return response || [];
};

export const fetchClassSubjectSettings = async (): Promise<
  ClassSubjectSetting[]
> => {
  const response = await api.get<ClassSubjectSetting[]>(
    "/school/class-subjects",
  );
  return response || [];
};

export const fetchAssignments = async (): Promise<ApiAssignment[]> => {
  const response = await api.get<any[]>("/school/assignments");
  return (response || []).map((joint) => {
    const parsed = splitClassName(joint.className);
    return {
      id: joint.subjectJointId || joint.id || joint._id,
      subjectId: joint.subjectId || joint.id,
      teacherId: joint.teacherId || joint.subjectTeacherId,
      classGrade: joint.classGrade || parsed.classGrade,
      classStream: joint.classStream || parsed.classStream,
    } as ApiAssignment;
  });
};

export const fetchExitedStudents = async (): Promise<ExitedStudent[]> => {
  const response = await api.get<ExitedStudent[]>("/users/exited");
  return response || [];
};

export const fetchDerivedClasses = async (): Promise<Class[]> => {
  const students = await fetchStudents();
  const teachers = await fetchTeachers();
  const subjects = await fetchSubjects();
  const assignments = await fetchAssignments();
  const classSubjectSettings = await fetchClassSubjectSettings();
  return deriveClasses(
    students,
    teachers,
    subjects,
    assignments,
    classSubjectSettings,
  );
};

export const fetchClassesData = async () => {
  const students = await fetchStudents();
  const teachers = await fetchTeachers();
  const subjects = await fetchSubjects();
  const assignments = await fetchAssignments();
  const classSubjectSettings = await fetchClassSubjectSettings();
  const classes = deriveClasses(
    students,
    teachers,
    subjects,
    assignments,
    classSubjectSettings,
  );
  return {
    students,
    teachers,
    subjects,
    assignments,
    classSubjectSettings,
    classes,
  };
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const students = await fetchStudents();
  const teachers = await fetchTeachers();
  const subjects = await fetchSubjects();
  const assignments = await fetchAssignments();
  const classSubjectSettings = await fetchClassSubjectSettings();
  const classes = deriveClasses(
    students,
    teachers,
    subjects,
    assignments,
    classSubjectSettings,
  );

  const unassignedCount = classes.filter(
    (currentClass) => !currentClass.classTeacherId,
  ).length;
  const assignedCT = classes.filter(
    (currentClass) => currentClass.classTeacherId,
  ).length;
  const activeTeachers = teachers.filter(
    (teacher) => teacher.status === "Active",
  ).length;
  const assignedSubjectsCount = new Set(assignments.map((a) => a.subjectId))
    .size;

  return {
    classesCount: classes.length,
    subjectsCount: subjects.length,
    teachersCount: teachers.length,
    assignedCT,
    totalClasses: classes.length,
    unassignedCount,
    studentsCount: students.length,
    activeTeachers,
    assignedSubjectsCount,
  };
};

export const fetchFinalGrade = async (): Promise<string> => {
  try {
    const response = await api.get<{ finalGrade: string }>(
      "/users/graduation-settings",
    );
    return response?.finalGrade || "";
  } catch {
    return "";
  }
};

export const fetchCurrentPeriod = async (): Promise<{
  term: number;
  year: number;
  examType: string;
}> => {
  const students = await fetchStudents();
  const teachers = await fetchTeachers();
  const term = teachers[0]?.term || students[0]?.term || 1;
  const year =
    teachers[0]?.year || students[0]?.year || new Date().getFullYear();
  const examType = teachers[0]?.examType || students[0]?.examType || "opener";
  return { term, year, examType };
};

export interface ClassesDataResult {
  classes: Class[];
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  assignments: ApiAssignment[];
  classSubjectSettings: ClassSubjectSetting[];
}

export const useClassesData = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<ApiAssignment[]>([]);
  const [classSubjectSettings, setClassSubjectSettings] = useState<
    ClassSubjectSetting[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const fetchedStudents = await fetchStudents();
      setStudents(fetchedStudents);
      const fetchedTeachers = await fetchTeachers();
      setTeachers(fetchedTeachers);
      const fetchedSubjects = await fetchSubjects();
      setSubjects(fetchedSubjects);
      const fetchedAssignments = await fetchAssignments();
      setAssignments(fetchedAssignments);
      const fetchedSettings = await fetchClassSubjectSettings();
      setClassSubjectSettings(fetchedSettings);
      const derivedClasses = deriveClasses(
        fetchedStudents,
        fetchedTeachers,
        fetchedSubjects,
        fetchedAssignments,
        fetchedSettings,
      );
      setClasses(derivedClasses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(() => {
    void load();
  }, [load]);

  return {
    classes,
    students,
    teachers,
    subjects,
    assignments,
    classSubjectSettings,
    loading,
    error,
    refresh,
  };
};

export type { SubjectEnrollmentMode };
