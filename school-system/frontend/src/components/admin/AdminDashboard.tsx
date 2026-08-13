import React, { useEffect, useMemo, useState, useCallback } from "react";
import styles from "./AdminDashboard.module.css";
import { AssignmentsTab } from "./AssignmentsTab";
import { ClassesTab } from "./ClassesTab";
import { OverviewTab } from "./OverviewTab";
import { Sidebar } from "./Sidebar";
import { StudentsTab } from "./StudentsTab";
import { SubjectsTab } from "./SubjectsTab";
import { TeachersTab } from "./TeachersTab";
import { TopBar } from "./TopBar";
import { CycleTab } from "./CycleTab";
import { TimetableTab } from "./TimetableTab";
// import { AdminMarksTab } from "./AdminMarksTab";
// import { BulkElectiveEnrollmentTab } from "./BulkElectiveEnrollmentTab";
import { PerformanceTab } from "./PerformanceTab";
import { CbcGradingConfigTab } from "./CbcGradingConfigTab";
import { SchoolSettingsTab } from "./SchoolSettingsTab";
import { UserApprovalsTab } from "./UserApprovalsTab";
import { ArchivesView } from "../shared/ArchivesView";
import { ExitedStudentsView } from "../shared/ExitedStudentsView";
import {
  ApiStudent,
  ApiTeacher,
  Teacher,
  UsersDashboardResponse,
  ApiAssignment,
  ClassSubjectSetting,
  NavItem,
  Class,
  Subject,
  Student,
  ExitedStudent,
} from "./types";
import { useDashboardTheme } from "../../lib/useDashboardTheme";
import { api, getSchoolId, normalizeUser, request } from "../../lib/api";
import {
  buildClassId,
  getClassSubjectSetting,
  type StudentSubjectEnrollment,
  type SubjectEnrollmentMode,
} from "../../lib/subjectEnrollment";
import { useClassesData } from "../../lib/adminData";
const navItems: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    svg: "<path d='M3 13h8V3H3v10z'/><path d='M13 21h8V11h-8v10z'/><path d='M13 3h8v6h-8V3z'/><path d='M3 17h8v4H3v-4z'/>",
  },
  {
    id: "classes",
    label: "Classes",
    svg: "<path d='M4 19.5V8.5a2 2 0 0 1 1.2-1.83l6-2.67a2 2 0 0 1 1.6 0l6 2.67A2 2 0 0 1 20 8.5v11'/><path d='M8 10h8'/><path d='M8 14h8'/><path d='M10 19.5v-3h4v3'/>",
  },
  {
    id: "students",
    label: "Students",
    svg: "<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M22 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/>",
  },
  // {
  //   id: "marks",
  //   label: "Marks Entry",
  //   svg: "<path d='M3 3v18h18'/><path d='M7 14l3-3 3 2 5-6'/>",
  // },
  {
    id: "performance",
    label: "Performance & Analytics",
    svg: "<path d='M12 20v-6M6 20V10M18 20V4'/>",
  },
  {
    id: "subjects",
    label: "Subjects",
    svg: "<path d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/><path d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/>",
  },
  // {
  //   id: "elective-enrollment",
  //   label: "Elective Enrollment",
  //   svg: "<path d='M9 12l2 2 4-4'/><path d='M4 6h16'/><path d='M4 12h3'/><path d='M4 18h16'/>",
  // },
  {
    id: "teachers",
    label: "Staff",
    svg: "<path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/>",
  },
  {
    id: "approvals",
    label: "User Approvals",
    svg: "<path d='M9 12l2 2 4-4'/><path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M19 8v6'/><path d='M22 11h-6'/>",
  },
  {
    id: "assignments",
    label: "Teachers Assignments",
    svg: "<path d='M9 11l3 3L22 4'/><path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'/>",
  },
  {
    id: "timetables",
    label: "Timetables",
    svg: "<path d='M8 2v4'/><path d='M16 2v4'/><rect x='3' y='4' width='18' height='18' rx='2'/><path d='M3 10h18'/><path d='M8 14h3'/><path d='M13 14h3'/><path d='M8 18h3'/><path d='M13 18h3'/>",
  },
  {
    id: "cycle",
    label: "Academic Cycle",
    svg: "<circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/>",
  },
  {
    id: "school-settings",
    label: "School Settings",
    svg: "<path d='M4 21V8l8-5 8 5v13'/><path d='M9 21v-6h6v6'/><path d='M9 10h.01'/><path d='M15 10h.01'/>",
  },
  {
    id: "cbc-grading",
    label: "CBC Grading Configuration",
    svg: "<path d='M4 6h16'/><path d='M4 12h16'/><path d='M4 18h7'/><path d='M15 18l2 2 4-4'/>",
  },
  {
    id: "archives",
    label: "Archives",
    svg: "<path d='M21 8V21H3V8'/><path d='M1 3H23V8H1V3M10 12H14'/>",
  },
  {
    id: "exited",
    label: "Exited Learners",
    svg: "<path d='M16 17l5-5-5-5'/><path d='M21 12H9'/><path d='M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7'/>",
  },
];

const teacherAvatarColor = "#c9963d";
const ADMIN_TAB_KEY = "edunex.admin.activeTab";
const validAdminTabs = new Set(navItems.map((item) => item.id));

const normalizeStatus = (value?: string) => {
  const normalized = value?.toLowerCase();
  if (normalized === "inactive") return "Inactive";
  if (normalized === "active") return "Active";
  if (normalized === "deleted") return "Deleted";
  if (normalized === "completed") return "Completed";
  return "";
};

const isActiveStudent = (student: Student) => student.status === "Active";

const mapStaffToTeachers = (staff: ApiTeacher[]): Teacher[] =>
  staff.map((member) => ({
    ...member,
    status: normalizeStatus(member.status),
    subjects: member.subjects || [],
  }));

const mapStudentsFromApi = (students: any): Student[] =>
  students.map((student: any) => ({
    id: student.id,
    studentAdm: student.admissionNo,
    studentFullName: student.name,
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

const deriveClasses = (
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
        term: classTeacher?.term || 1,
        year: classTeacher?.year || 2024,
        examType: classTeacher?.examType || "opener",
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

const emptyStateStyle: React.CSSProperties = {
  minHeight: 220,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  textAlign: "center",
  color: "var(--textMut)",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--textM)",
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--gold)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem(ADMIN_TAB_KEY);
    return saved && validAdminTabs.has(saved) ? saved : "overview";
  });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<ApiAssignment[]>([]);
  const [exitedStudents, setExitedStudents] = useState<ExitedStudent[]>([]);
  const [classSubjectSettings, setClassSubjectSettings] = useState<
    ClassSubjectSetting[]
  >([]);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useDashboardTheme();
  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return normalizeUser(parsed.user || parsed);
      } catch (e) {}
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleChangePassword = () => {
    window.location.href = "/change-password";
  };

  const { classesFound, classes: derivedClasses } = useClassesData();

  const loadDashboardUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const [response, subjectSettings, graduationSettings] = await Promise.all(
        [
          api.get<UsersDashboardResponse>("/users"),
          api.get<ClassSubjectSetting[]>("/school/class-subjects"),
          api.get<{ finalGrade: string }>("/users/graduation-settings"),
        ],
      );
      const mappedStudents = mapStudentsFromApi(response.students);
      setTeachers(mapStaffToTeachers(response.staff));
      console.log("response staff ", response.staff);

      setStudents(
        mappedStudents.filter((student) => student.status !== "Completed"),
      );
      setSubjects(response.subjects || []);
      setAssignments(response.assignments || []);
      setExitedStudents(response.exitedStudents || []);
      setClassSubjectSettings(subjectSettings || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    try {
      const freshUser: any = await api.get(`/users/${user.id}`);
      if (freshUser) {
        // Ensure roles is always an array
        let rolesArr = freshUser.roles;
        if (rolesArr && !Array.isArray(rolesArr)) {
          rolesArr = [rolesArr.role1, rolesArr.role2, rolesArr.role3].filter(
            Boolean,
          );
        }
        const updatedUser = {
          ...user,
          ...freshUser,
          id: freshUser._id,
          roles: rolesArr || user.roles || [],
        };
        const savedItem = localStorage.getItem("user");
        if (savedItem) {
          const parsed = JSON.parse(savedItem);
          parsed.user = updatedUser;
          localStorage.setItem("user", JSON.stringify(parsed));
        }
        setUserState(updatedUser);
      }
    } catch (e) {}
  }, [user?.id]);

  useEffect(() => {
    void loadDashboardUsers();
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(false);
    } else {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    localStorage.setItem(ADMIN_TAB_KEY, tabId);
    setMobileMenuOpen(false);
  };

  const closeModal = () => setModalContent(null);
  const showModal = (content: React.ReactNode) => setModalContent(content);

  const saveStudent = async (
    payload: {
      studentFullName: string;
      studentAdm: string;
      // email: string;
      phoneNumber: string;
      classId: string;
      schoolId: string;
      gender?: string;
      status?: string;
    },
    studentId?: string,
  ) => {
    const body = {
      role: "student",
      ...payload,
    };

    if (studentId) {
      await request(`/update/student`, {
        method: "PATCH",
        body: JSON.stringify({ ...payload, studentId }),
      });
    } else {
      await api.post("/users", body);
    }

    await loadDashboardUsers();
    showSuccess(`Student ${studentId ? "updated" : "enrolled"} successfully.`);
  };

  const deleteStudent = async (studentId: string) => {
    try {
      console.log("Id to be deleted ", studentId);

      await api.delete(`/users/${studentId}`);
      await loadDashboardUsers();
      showSuccess("Student record deleted.");
    } catch (err) {
      showError("Failed to delete student.");
    }
  };

  const saveTeacher = async (
    payload: {
      roles: string[];
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      status: string;
      password: string;
    },
    teacherId?: string,
  ) => {
    if (teacherId) {
      await request(`/users/update`, {
        method: "PATCH",
        body: JSON.stringify({
          email: payload.email,
          status: payload?.status.toUpperCase(),
          firstName: payload.firstName,
          lastName: payload.lastName,
          phoneNumber: payload.phone,
          roles: payload.roles,
          teacherId: teacherId,
        }),
      });
    } else {
      await request(`/auth/register/teacher`, {
        method: "POST",
        body: JSON.stringify({
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          password: payload.password,
          roles: payload.roles,
          status: payload.status?.toUpperCase() || "ACTIVE",
          phoneNumber: payload.phone,
          schoolId: getSchoolId(),
        }),
      });
    }

    await loadDashboardUsers();
    await refreshUser();
    showSuccess(
      `Staff member ${teacherId ? "updated" : "added"} successfully.`,
    );
  };

  const deleteTeacher = async (teacherId: string) => {
    try {
      await request(`/delete/user?id=${teacherId}`, {
        method: "PATCH",
      });
      await loadDashboardUsers();
      await refreshUser();
      showSuccess("Staff record deleted.");
    } catch (err) {
      showError("Failed to delete staff member.");
    }
  };

  const showConfirm = (message: string, onOk: () => void, danger = false) => {
    showModal(
      <div className={styles.scalein}>
        <div
          style={{
            padding: "20px 22px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: "var(--serif)",
              fontSize: "1.25rem",
              color: "var(--text)",
            }}
          >
            Confirm action
          </h3>
        </div>
        <div style={{ padding: "18px 22px 22px" }}>
          <p
            style={{
              margin: "0 0 16px",
              fontSize: 13,
              color: "var(--textMut)",
              lineHeight: 1.6,
            }}
            dangerouslySetInnerHTML={{ __html: message }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={closeModal} style={secondaryButtonStyle}>
              Cancel
            </button>
            <button
              onClick={() => {
                onOk();
                // Note: we don't close modal here because onOk might show a success modal
              }}
              style={{
                ...primaryButtonStyle,
                background: danger ? "var(--dText)" : "var(--gold)",
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>,
    );
  };

  const saveSubject = async (
    name: string,
    department: string,
    subjectId?: string,
  ) => {
    try {
      if (subjectId) {
        await api.put(`/school/subjects/${subjectId}`, { name, department });
      } else {
        await api.post("/school/subjects", { name, department });
      }
      await loadDashboardUsers();
      showSuccess(`Subject ${subjectId ? "updated" : "created"} successfully.`);
      closeModal();
    } catch (err) {
      showError("Failed to save subject.");
    }
  };

  const deleteSubject = async (subjectId: string) => {
    try {
      await api.delete(`/school/subjects/${subjectId}`);
      await loadDashboardUsers();
      showSuccess("Subject deleted successfully.");
    } catch (err) {
      showError("Failed to delete subject.");
    }
  };

  const saveAssignment = async (payload: {
    subjectId: string;
    teacherId: string;
    classGrade: string;
    classStream: string;
  }) => {
    try {
      await api.post("/school/assignments", payload);
      await loadDashboardUsers();
      await refreshUser();
      showSuccess("Assignment updated successfully.");
      closeModal();
    } catch (err) {
      showError("Failed to update assignment.");
    }
  };

  const toggleSubjectOffering = async (
    subjectId: string,
    classGrade: string,
    classStream: string,
    isOffered: boolean,
    enrollmentMode: string | undefined,
    sharedSlotId: string | null = null,
  ) => {
    try {
      const response = await api.put<{ message?: string }>(
        "/school/class-subjects",
        {
          subjectId,
          classGrade,
          classStream,
          isOffered,
          enrollmentMode,
          sharedSlotId,
        },
      );
      await loadDashboardUsers();
      showSuccess(
        response?.message ||
          (isOffered
            ? "Subject restored for the selected class."
            : "Subject dropped for the selected class."),
      );
    } catch (err) {
      console.log("error ", err);

      showError(
        isOffered
          ? "Failed to add the subject back to this class."
          : "Failed to drop this subject from the class.",
      );
    }
  };

  const unassignSubjectTeacher = async (
    subjectTeacherId: string | null,
    classId: string,
    subjectId: string,
  ) => {
    if (subjectTeacherId) {
      try {
        console.log("unassign details \n", subjectId, classId, subjectId);

        await request(`/unassign/subject/teacher`, {
          method: "PATCH",
          body: JSON.stringify({
            subjectJointId: subjectId,
            teacherId: subjectTeacherId,
            classId: classId,
          }),
        });
        await loadDashboardUsers();
        await refreshUser();
        showSuccess("Teacher unassigned successfully.");
      } catch (err) {
        showError("Failed to unassign teacher.");
      }
    }
  };

  const bulkEnrollElective = async (
    studentIds: string[],
    subjectId: string,
    classGrade: string,
    classStream: string,
    action: "enroll" | "unenroll",
  ) => {
    try {
      const response = await api.put<{ message?: string }>(
        "/users/bulk-enroll-elective",
        {
          studentIds,
          subjectId,
          classGrade,
          classStream,
          action,
        },
      );
      await loadDashboardUsers();
      showSuccess(
        response.message || "Elective enrollments updated successfully.",
      );
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to update elective enrollments.",
      );
    }
  };

  const unassignClassTeacher = async (teacherId: string) => {
    try {
      const teacher = teachers.find((t) => t.id === teacherId);
      if (teacher) {
        const existingRoles = teacher.roles || [];
        const newRoles = existingRoles.filter((r) => r !== "classteacher");
        if (newRoles.length === 0) newRoles.push("subjectteacher");

        await api.put(`/users/${teacherId}`, {
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone,
          department: teacher.department,
          status: (teacher.status || "active").toLowerCase(),
          subjects: teacher.subjects || [],
          classGrade: null,
          classStream: null,
          roles: newRoles,
        });
        await loadDashboardUsers();
        await refreshUser();
        showSuccess("Class teacher unassigned successfully.");
      }
    } catch (err) {
      showError("Failed to unassign class teacher.");
    }
  };

  const handleBulkTermUpdate = async (
    term: number,
    year: number,
    examType: string,
  ) => {
    try {
      const res: any = await request("/schools/update/term/exam", {
        method: "PUT",
        body: JSON.stringify({
          term,
          examType: examType.toUpperCase(),
          schoolId: getSchoolId(),
        }),
      });
      await loadDashboardUsers();
      showSuccess(
        res?.message ||
          `All classes have been updated to Term ${term}, ${year} (${examType}).`,
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update academic cycle. Existing marks were kept in the database.";

      showError(message);
    }
  };

  const handleSchoolCycleUpdate = async () => {
    const schoolId = getSchoolId();
    if (!schoolId) {
      showError("No school is linked to this account.");
      return;
    }
    try {
      const response: any = await request(
        `/update/${encodeURIComponent(schoolId)}/school-cycle`,
        { method: "PATCH" },
      );
      await loadDashboardUsers();
      showSuccess(
        response?.message || "All students have been moved to the next class.",
      );
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to update the school cycle.",
      );
    }
  };

  const handleFinalGradeUpdate = async (nextFinalGrade: string) => {
    try {
      const response = await api.put<{ message?: string; finalGrade: string }>(
        "/users/graduation-settings",
        { finalGrade: nextFinalGrade },
      );
      showSuccess(response.message || "Final grade setting updated.");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to update final grade.",
      );
    }
  };

  const showSuccess = (msg: string) => {
    showModal(
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
        <h3
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          Success!
        </h3>
        <p style={{ color: "var(--textMut)", marginBottom: "1.5rem" }}>{msg}</p>
        <button onClick={closeModal} style={primaryButtonStyle}>
          Dismiss
        </button>
      </div>,
    );
  };

  const showError = (msg: string) => {
    showModal(
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
        <h3
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          Error
        </h3>
        <p style={{ color: "var(--textMut)", marginBottom: "1.5rem" }}>{msg}</p>
        <button
          onClick={closeModal}
          style={{ ...primaryButtonStyle, background: "var(--dText)" }}
        >
          Dismiss
        </button>
      </div>,
    );
  };

  const unassignedCount = classesFound.filter(
    (currentClass) => !currentClass.classTeacherId,
  ).length;
  const assignedCT = classesFound.filter(
    (currentClass) => currentClass.classTeacherId,
  ).length;
  const tabTitle = useMemo(() => {
    const titles: Record<string, string> = {
      overview: "School overview",
      classes: "Class management",
      students: "Student management",
      marks: "Marks management",
      subjects: "Subject management",
      "elective-enrollment": "Elective enrollment",
      teachers: "Staff directory",
      approvals: "User approvals",
      assignments: "Subject assignments",
      timetables: "Timetable generator",
      cycle: "Academic cycle",
      "school-settings": "School settings",
      "cbc-grading": "CBC grading configuration",
      archives: "Archives",
      exited: "Exited learners",
    };
    return titles[activeTab] || "Admin dashboard";
  }, [activeTab]);
  const adminDisplayName =
    (user?.firstName && `${user?.firstName} ${user?.lastName}`) ||
    user?.email ||
    "Admin User";

  const adminInitials =
    adminDisplayName
      .split(/\s+/)
      .filter(Boolean)
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AU";

  const pill = (text: string, color: string) => {
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

  const avatar = (name: string, size: number) => {
    const initials = name ? name.toUpperCase() : "user";
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#163325;color:#fff;display:flex;align-items:center;justify-content:center;font-size:${Math.max(
      10,
      size / 2.4,
    )}px;font-weight:700;">${initials}</div>`;
  };

  const renderActiveTab = () => {
    if (activeTab === "classes") {
      return (
        <ClassesTab
          teachers={teachers}
          onUnassignClassTeacher={unassignClassTeacher}
          onBulkTermUpdate={handleBulkTermUpdate}
          onSwitchTab={handleSelectTab}
          avatar={avatar}
          showModal={showModal}
          closeModal={closeModal}
          showConfirm={showConfirm}
        />
      );
    }

    if (activeTab === "students") {
      return (
        <StudentsTab
          students={students}
          classes={classesFound}
          subjects={subjects}
          classSubjectSettings={classSubjectSettings}
          onSaveStudent={saveStudent}
          onDeleteStudent={deleteStudent}
          pill={pill}
          showModal={showModal}
          closeModal={closeModal}
          showConfirm={showConfirm}
        />
      );
    }

    if (activeTab === "subjects") {
      return (
        <SubjectsTab
          subjects={subjects}
          classes={classesFound}
          onSaveSubject={saveSubject}
          onDeleteSubject={deleteSubject}
          showModal={showModal}
          closeModal={closeModal}
          showConfirm={showConfirm}
        />
      );
    }

    // if (activeTab === "elective-enrollment") {
    //   return (
    //     <BulkElectiveEnrollmentTab
    //       classes={classes}
    //       students={students}
    //       subjects={subjects}
    //       onBulkEnrollElective={bulkEnrollElective}
    //     />
    //   );
    // }

    // if (activeTab === "marks") {
    //   return (
    //     <AdminMarksTab
    //       classes={classes}
    //       students={students}
    //       subjects={subjects}
    //       onRefresh={loadDashboardUsers}
    //       avatar={avatar}
    //     />
    //   );
    // }

    if (activeTab === "performance") {
      return (
        <PerformanceTab
          classes={derivedClasses}
          students={students}
          subjects={subjects}
          avatar={avatar}
        />
      );
    }

    if (activeTab === "teachers") {
      return (
        <TeachersTab
          teachers={teachers}
          classes={classesFound}
          onSaveTeacher={saveTeacher}
          onDeleteTeacher={deleteTeacher}
          avatar={avatar}
          pill={pill}
          showModal={showModal}
          closeModal={closeModal}
          showConfirm={showConfirm}
        />
      );
    }

    if (activeTab === "approvals") {
      return <UserApprovalsTab onUpdated={loadDashboardUsers} />;
    }

    if (activeTab === "assignments") {
      return (
        <AssignmentsTab
          classes={classesFound}
          teachers={teachers}
          students={students}
          onSaveAssignment={saveAssignment}
          onUnassignTeacher={unassignSubjectTeacher}
          onToggleSubjectOffering={toggleSubjectOffering}
          avatar={avatar}
          pill={pill}
          showModal={showModal}
          closeModal={closeModal}
          showConfirm={showConfirm}
        />
      );
    }
    if (activeTab === "cycle") {
      return (
        <CycleTab
          onBulkTermUpdate={handleBulkTermUpdate}
          onSchoolCycleUpdate={handleSchoolCycleUpdate}
          onFinalGradeUpdate={handleFinalGradeUpdate}
          gradeOptions={Array.from(
            new Set(classesFound.map((current) => current.grade)),
          )}
        />
      );
    }

    if (activeTab === "school-settings") {
      return <SchoolSettingsTab onSaved={loadDashboardUsers} />;
    }

    if (activeTab === "timetables") {
      const currentPeriod = {
        term: teachers[0]?.term || 1,
        year: teachers[0]?.year || new Date().getFullYear(),
      };
      return (
        <TimetableTab classes={classesFound} currentPeriod={currentPeriod} />
      );
    }

    if (activeTab === "cbc-grading") {
      return <CbcGradingConfigTab />;
    }

    if (activeTab === "archives") {
      return (
        <ArchivesView title="Global Performance Archives" allowManagement />
      );
    }

    if (activeTab === "exited") {
      return (
        <ExitedStudentsView
          exitedStudents={exitedStudents}
          onRefresh={loadDashboardUsers}
          allowDelete
        />
      );
    }

    return <OverviewTab onSwitchTab={handleSelectTab} />;
  };

  return (
    <div className={styles.dashboard} data-theme={theme}>
      {mobileMenuOpen && isMobile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(11, 32, 24, 0.34)",
            zIndex: 18,
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <Sidebar
        collapsed={isMobile ? false : collapsed}
        isMobile={isMobile}
        mobileOpen={mobileMenuOpen}
        activeTab={activeTab}
        navItems={navItems}
        classesCount={classesFound.length}
        subjectsCount={subjects.length}
        teachersCount={teachers.length}
        assignedCT={assignedCT}
        totalClasses={classesFound.length}
        unassignedCount={unassignedCount}
        onToggleCollapse={() => setCollapsed((current) => !current)}
        onSelectTab={handleSelectTab}
        onChangePassword={handleChangePassword}
        onLogout={handleLogout}
        teacherInitials={adminInitials}
        teacherAvatarColor={teacherAvatarColor}
        teacherName={adminDisplayName}
      />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar
          title={tabTitle}
          unassignedCount={unassignedCount}
          onSwitchTab={handleSelectTab}
          teacherInitials={adminInitials}
          teacherAvatarColor={teacherAvatarColor}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
          user={user}
          isMobile={isMobile}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isMobile ? "16px" : "18px 20px 24px",
            background: "var(--panelBg)",
          }}
        >
          {loading ? (
            <div style={emptyStateStyle}>Loading live dashboard data...</div>
          ) : error ? (
            <div style={emptyStateStyle}>
              <p style={{ margin: 0 }}>{error}</p>
              <button
                onClick={() => void loadDashboardUsers()}
                style={primaryButtonStyle}
              >
                Retry
              </button>
            </div>
          ) : (
            renderActiveTab()
          )}
        </div>
      </main>

      {modalContent && (
        <div className={styles.modalBg} onClick={closeModal}>
          <div
            className={`${styles.modalBox} ${styles.scalein}`}
            onClick={(event) => event.stopPropagation()}
          >
            {modalContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
