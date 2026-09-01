// components/classteacher/ClassTeacherDashboard.tsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GlobalStyles } from "./shared/GlobalStyles";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { StudentRecords } from "./StudentRecords";
import { StudentDetails } from "./StudentDetails";
import { MarksManagement } from "./MarksManagement";
import { ResultsReports } from "./ResultsReports";
import { Analytics } from "./Analytics";
import { Settings } from "./Settings";
import { ArchivesView } from "../shared/ArchivesView";
import { TimetableLibrary } from "../shared/TimetableLibrary";
import { ClassOverview } from "./ClassOverview";
import { SubjectJointTab } from "./SubjectJointTab";
import { ElectiveEnrollmentTab } from "./ElectiveEnrollmentTab";
import {
  UsersIcon,
  MarkIcon,
  FileIcon,
  BarIcon,
  SettIcon,
  ArchiveIcon,
  TimetableIcon,
} from "./shared/Icons";
import { C, FONT } from "./shared/constants";
import { useDashboardTheme } from "../../lib/useDashboardTheme";
import { api, getClassId, normalizeRoles, normalizeUser } from "../../lib/api";
import { AttendanceTab } from "./AttendanceTab";
import {
  Calendar1Icon,
  BookOpen,
  ListChecks,
  LayoutDashboard,
  History,
} from "lucide-react";
import ClassTeacherAttendanceHistory from "./ClassTeacherAttendanceHistory";
import OverviewSkeleton from "../skeletons/OverviewSkeletons";

// Wrapper icons for lucide components to match existing Icon interface
const OverviewIcon = () => <LayoutDashboard size={16} />;
const BookOpenIcon = () => <BookOpen size={16} />;
const ListChecksIcon = () => <ListChecks size={16} />;
const CalIcon = () => <Calendar1Icon size={16} />;

/**
 * Returns all active elective subjects.
 *
 * The normalization makes this resilient in case the backend sends:
 * ELECTIVE / elective / Elective.
 */
const buildElectiveGroups = (subjects: any[]) => {
  return subjects.filter(
    (subject) =>
      subject.isOffered !== false &&
      String(subject.enrollmentMode || "").toUpperCase() === "ELECTIVE",
  );
};

const NAV = [
  {
    id: "overview",
    label: "Overview",
    desc: "Class summary, quick actions and subject roster.",
    Icon: OverviewIcon,
  },
  {
    id: "students",
    label: "Student Roster",
    desc: "Rosters, contacts, and learner profiles.",
    Icon: UsersIcon,
  },
  {
    id: "marks",
    label: "Marks Management",
    desc: "Capture marks and review class performance.",
    Icon: MarkIcon,
  },
  {
    id: "subject-joint",
    label: "Subject Registration",
    desc: "Register or drop subjects for this class.",
    Icon: BookOpenIcon,
  },
  {
    id: "elective-enrollment",
    label: "Elective Enrollment",
    desc: "Enroll students into elective subjects.",
    Icon: ListChecksIcon,
  },
  {
    id: "attendance",
    label: "Attendance",
    desc: "Mark and review student attendance.",
    Icon: CalIcon,
  },
  {
    id: "attendance-history",
    label: "Attendance History",
    desc: "Load attendance history.",
    Icon: History,
  },
  {
    id: "timetable",
    label: "Timetable",
    desc: "View the published class timetable.",
    Icon: TimetableIcon,
  },
  {
    id: "results",
    label: "Results & Reports",
    desc: "Downloadable reports for this stream.",
    Icon: FileIcon,
  },
  {
    id: "analytics",
    label: "Analytics",
    desc: "Averages, rankings, and class trends.",
    Icon: BarIcon,
  },
  {
    id: "archives",
    label: "Archives",
    desc: "Past performance reports (PDF).",
    Icon: ArchiveIcon,
  },
  {
    id: "settings",
    label: "Settings",
    desc: "Stream details and reporting preferences.",
    Icon: SettIcon,
  },
];

const CLASS_TEACHER_TAB_KEY = "edunex.classTeacher.activeTab";
const validClassTeacherTabs = new Set(NAV.map((item) => item.id));

export default function ClassTeacherDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("user");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return normalizeUser(parsed.user || parsed);
      } catch (e) {
        console.error("Failed to parse saved user.", e);
      }
    }

    return null;
  });

  const adminModeClass = useMemo(() => {
    const fromState = (location.state as any)?.adminModeClass;
    if (fromState) return fromState;
    try {
      const stored = localStorage.getItem("edunex.admin.classTeacherMode");
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  }, [location.state]);

  const effectiveGrade = adminModeClass?.grade || currentUser?.classGrade;
  const effectiveStream = adminModeClass?.stream || currentUser?.classStream;
  const effectiveClassId = adminModeClass?.classId || getClassId();
  const effectiveClassName =
    adminModeClass?.className ||
    `Grade ${effectiveGrade}${effectiveStream ? ` ${effectiveStream}` : ""}`;

  const [tab, setTab] = useState(() => {
    const saved = localStorage.getItem(CLASS_TEACHER_TAB_KEY);

    return saved && validClassTeacherTabs.has(saved) ? saved : "overview";
  });

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classSubjectCatalog, setClassSubjectCatalog] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { theme, toggleTheme } = useDashboardTheme();

  /**
   * Detect all currently active elective subjects.
   *
   * The sidebar will automatically react whenever
   * classSubjectCatalog changes.
   */
  const electiveSubjects = useMemo(() => {
    return buildElectiveGroups(classSubjectCatalog);
  }, [classSubjectCatalog]);

  /**
   * True only when this class currently has at least
   * one active ELECTIVE subject.
   */
  const hasElectives = electiveSubjects.length > 0;

  /**
   * Build sidebar navigation dynamically.
   *
   * Elective Enrollment is completely removed when
   * the class has no active elective subjects.
   */
  const navItems = useMemo(() => {
    return NAV.filter((item) => {
      if (item.id === "elective-enrollment") {
        return hasElectives;
      }

      return true;
    });
  }, [hasElectives]);

  const loadData = useCallback(async () => {
    if (!effectiveGrade || !effectiveStream) {
      setError("No class assigned to your profile.");
      setLoading(false);
      return;
    }

    const classId = effectiveClassId;

    if (!classId) {
      setError("No class ID is assigned to your profile.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [studentsData, subjectsData, staffData] = (await Promise.all([
        api.get(
          `/users/class/${effectiveGrade}/${effectiveStream}`,
          {
            term: currentUser.term,
            year: currentUser.year,
            examType: currentUser.examType,
          },
        ),

        api.get(`/class/subject/${encodeURIComponent(classId)}`),

        api
          .get(`/get/students?classId=${encodeURIComponent(classId)}`)
          .then((response: any) => response || {}),
      ])) as [{ content?: any[] }, any[], any];

      /**
       * Students
       */
      setStudents(studentsData?.content || []);

      /**
       * Normalize subject IDs.
       */
      const mappedSubjects = (subjectsData || []).map((subject: any) => ({
        ...subject,
        id: subject.id || subject._id,
      }));

      /**
       * Keep the complete subject catalog.
       * This is used for:
       * - Subject registration
       * - Elective detection
       * - Elective enrollment
       */
      setClassSubjectCatalog(mappedSubjects);

      /**
       * Only active/offered subjects for marks,
       * reports, student details, etc.
       */
      setSubjects(
        mappedSubjects.filter((subject: any) => subject.isOffered !== false),
      );

      /**
       * Support both possible API response shapes.
       *
       * Either:
       * {
       *   assignments: [],
       *   staff: []
       * }
       *
       * or an empty response.
       */
      const assignmentsList = staffData?.assignments || [];
      const staffList = staffData?.staff || [];

      /**
       * Filter assignments for THIS class.
       */
      const classAssignments = assignmentsList
        .filter(
          (assignment: any) =>
            assignment.classGrade === effectiveGrade &&
            assignment.classStream === effectiveStream,
        )
        .map((assignment: any) => {
          const teacher = staffList.find(
            (staff: any) => staff.id === assignment.teacherId,
          );

          return {
            ...assignment,
            teacherName: teacher ? teacher.name : "Unknown",
          };
        });

      setAssignments(classAssignments);
    } catch (err: any) {
      console.error("Failed to load class teacher dashboard.", err);

      setError(err?.message || "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, adminModeClass, effectiveGrade, effectiveStream, effectiveClassId]);

  const loadSubjects = useCallback(async () => {
    const classId = effectiveClassId;

    if (!classId) {
      console.error("No class ID is assigned to this profile.");
      return;
    }

    try {
      const subjectsData: any[] = await api.get(
        `/class/subject/${encodeURIComponent(classId)}`,
      );

      const mappedSubjects = (subjectsData || []).map((subject: any) => ({
        ...subject,
        id: subject.id || subject._id,
      }));

      // Full catalog including dropped subjects
      setClassSubjectCatalog(mappedSubjects);

      // Only currently offered subjects
      setSubjects(
        mappedSubjects.filter((subject: any) => subject.isOffered !== false),
      );
    } catch (err) {
      console.error("Failed to refresh class subjects.", err);
    }
  }, [effectiveClassId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * If electives disappear while the user is currently
   * on the Elective Enrollment page, safely redirect
   * them back to Overview.
   *
   * This also updates localStorage so the hidden tab
   * is not restored after refresh.
   */
  useEffect(() => {
    if (!hasElectives && tab === "elective-enrollment") {
      setTab("overview");

      localStorage.setItem(CLASS_TEACHER_TAB_KEY, "overview");

      setSelectedStudent(null);
    }
  }, [hasElectives, tab]);

  /**
   * Keep mobile state responsive.
   */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;

      setIsMobile(mobile);

      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const refreshUser = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      const freshUser: any = await api.get(`/users/${currentUser.id}`);

      if (!freshUser) return;

      /**
       * Ensure roles is always an array.
       */
      let rolesArr = freshUser.roles;

      if (rolesArr && !Array.isArray(rolesArr)) {
        rolesArr = [rolesArr.role1, rolesArr.role2, rolesArr.role3].filter(
          Boolean,
        );
      }

      const updated = {
        ...currentUser,
        ...freshUser,
        id: freshUser._id || freshUser.id,
        roles: rolesArr || currentUser.roles || [],
      };

      const savedItem = localStorage.getItem("user");

      if (savedItem) {
        const parsed = JSON.parse(savedItem);

        parsed.user = updated;

        localStorage.setItem("user", JSON.stringify(parsed));
      }

      setCurrentUser(updated);
    } catch (e) {
      console.error("Failed to refresh user.", e);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleManualRefresh = async () => {
    setLoading(true);

    try {
      await refreshUser();
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleBackToAdmin = () => {
    localStorage.removeItem("edunex.admin.classTeacherMode");
    navigate("/edunex-org/admin");
  };

  /**
   * Roles check.
   */
  const rolesArray = normalizeRoles(currentUser?.roles);

  const isSubjectTeacher = rolesArray.includes("SUBJECTTEACHER");

  const hasSubjectAssignments = currentUser?.subjects?.length > 0;

  const canSwitchToSubjectDashboard = isSubjectTeacher && hasSubjectAssignments;

  useEffect(() => {
    const allowed = rolesArray.includes("CLASSTEACHER") || rolesArray.includes("ADMIN");
    if (!currentUser || !allowed) {
      navigate("/login");
    }
  }, [currentUser, navigate, rolesArray]);

  const handleSelectTab = (selectedTab: string) => {
    /**
     * Extra protection:
     * Don't allow navigation to Elective Enrollment
     * when there are no electives.
     */
    if (selectedTab === "elective-enrollment" && !hasElectives) {
      selectedTab = "overview";
    }

    setTab(selectedTab);

    localStorage.setItem(CLASS_TEACHER_TAB_KEY, selectedTab);

    setSelectedStudent(null);
    setMobileMenuOpen(false);
  };

  /**
   * Use the filtered navigation list.
   */
  const activeNav =
    navItems.find((item) => item.id === tab) || navItems[0] || NAV[0];

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <OverviewSkeleton />
        </>
      );
    }

    if (error) {
      return (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: C.dangerText,
          }}
        >
          {error}
        </div>
      );
    }

    if (selectedStudent && tab === "students") {
      return (
        <StudentDetails
          student={selectedStudent}
          subjects={subjects}
          onBack={() => setSelectedStudent(null)}
        />
      );
    }

    switch (tab) {
      case "overview":
        return (
          <ClassOverview
            students={students}
            subjects={subjects}
            assignments={assignments}
            user={currentUser}
            onNavigate={handleSelectTab}
          />
        );

      case "students":
        return (
          <StudentRecords
            students={students}
            subjects={subjects}
            onViewStudent={setSelectedStudent}
            classInfo={effectiveClassName}
          />
        );

      case "attendance-history":
        return (
          <ClassTeacherAttendanceHistory
            classId={effectiveClassId}
            teacherId={adminModeClass ? undefined : currentUser?.teacherId}
          />
        );

      case "marks":
        return (
          <MarksManagement
            students={students}
            subjects={subjects}
            user={currentUser}
          />
        );

      case "subject-joint":
        return (
          <SubjectJointTab
            subjects={classSubjectCatalog}
            user={currentUser}
            onRefresh={loadSubjects}
          />
        );

      case "elective-enrollment":
        /**
         * Final protection against manually restored
         * or invalid localStorage state.
         */
        if (!hasElectives) {
          return (
            <ClassOverview
              students={students}
              subjects={subjects}
              assignments={assignments}
              user={currentUser}
              onNavigate={handleSelectTab}
            />
          );
        }

        return (
          <ElectiveEnrollmentTab
            students={students}
            subjects={classSubjectCatalog}
            user={currentUser}
          />
        );

      case "attendance":
        return (
          <AttendanceTab
            user={currentUser}
            classId={effectiveClassId}
            teacherId={adminModeClass ? undefined : currentUser?.teacherId}
          />
        );

      case "timetable":
        return (
          <TimetableLibrary
            fetchPath="/timetables/my"
            fetchParams={{ view: "class" }}
            title="Class Timetable"
            description="Review the published class timetable and open the uploaded PDF when needed."
            emptyMessage="No class timetable has been published for your current academic cycle yet."
          />
        );

      case "results":
        return (
          <ResultsReports
            students={students}
            subjects={subjects.filter(
              (subject) =>
                String(subject.enrollmentMode || "").toUpperCase() !==
                "DROPPED",
            )}
            classGrade={effectiveGrade}
            classStream={effectiveStream}
            term={currentUser?.term}
            year={currentUser?.year}
            examType={currentUser?.examType}
          />
        );

      case "analytics":
        return (
          <Analytics
            students={students}
            subjects={subjects.filter(
              (subject) =>
                String(subject.enrollmentMode || "").toUpperCase() !==
                "DROPPED",
            )}
            classGrade={effectiveGrade}
            classStream={effectiveStream}
            term={currentUser?.term}
            year={currentUser?.year}
          />
        );

      case "archives":
        return (
          <ArchivesView
            classGrade={effectiveGrade}
            classStream={effectiveStream}
            title="Class Performance Archives"
          />
        );

      case "settings":
        return (
          <Settings
            user={currentUser}
            studentsCount={students.length}
            onUserUpdate={() => {
              window.location.reload();
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <GlobalStyles />

      {mobileMenuOpen && (
        <div
          className="ct-mobileOverlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className="ct-dashboardShell"
        data-theme={theme}
        style={{
          display: "flex",
          height: "100vh",
          fontFamily: FONT.sans,
          background: C.sand,
          overflow: "hidden",
        }}
      >
        <Sidebar
          navItems={navItems}
          activeTab={tab}
          collapsed={isMobile ? false : collapsed}
          mobileOpen={mobileMenuOpen}
          isMobile={isMobile}
          onToggleCollapse={() => {
            if (isMobile) {
              setMobileMenuOpen(false);
              return;
            }

            setCollapsed(!collapsed);
          }}
          onSelectTab={handleSelectTab}
          user={currentUser}
          onChangePassword={handleChangePassword}
          onLogout={handleLogout}
        />

        <div
          className="ct-mainPanel"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <TopBar
            activeLabel={activeNav.label}
            isMobile={isMobile}
            onOpenMenu={() => setMobileMenuOpen(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
            user={currentUser}
            onRefresh={handleManualRefresh}
          />

          {canSwitchToSubjectDashboard && tab !== "overview" && (
            <div
              style={{
                padding: "8px 24px",
                background: "rgba(201,150,61,0.08)",
                borderBottom: "1px solid rgba(201,150,61,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
              }}
            >
              <p
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 12.5,
                  color: C.textMuted,
                  margin: 0,
                  flex: 1,
                }}
              >
                You also have subject teacher assignments.
              </p>

              <button
                onClick={() => navigate("/subjectTeacher")}
                style={{
                  padding: "6px 14px",
                  background: C.gold,
                  border: "none",
                  borderRadius: 8,
                  fontFamily: FONT.sans,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Switch to Subject Dashboard
              </button>
            </div>
          )}

          {adminModeClass && (
            <div
              style={{
                padding: "8px 24px",
                background: "rgba(11, 32, 24, 0.08)",
                borderBottom: "1px solid rgba(11, 32, 24, 0.2)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
              }}
            >
              <p
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 12.5,
                  color: C.textMuted,
                  margin: 0,
                  flex: 1,
                }}
              >
                Admin mode: viewing <strong>{effectiveClassName}</strong>
              </p>

              <button
                onClick={handleBackToAdmin}
                style={{
                  padding: "6px 14px",
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  fontFamily: FONT.sans,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.text,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Back to Admin Dashboard
              </button>
            </div>
          )}

          <div
            className="ct-contentArea"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px",
            }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}
