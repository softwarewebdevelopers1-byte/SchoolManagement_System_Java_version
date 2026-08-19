// components/classteacher/ClassTeacherDashboard.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalStyles } from "./shared/GlobalStyles";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { StudentRecords } from "./StudentRecords";
import { StudentDetails } from "./StudentDetails";
import { MarksManagement } from "./MarksManagement";
import { ResultsReports } from "./ResultsReports";
import { Analytics } from "./Analytics";
import { Settings } from "./Settings";
import { SubjectAssignments } from "./SubjectAssignments";
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
  HomeIcon,
  ArchiveIcon,
  TimetableIcon,
} from "./shared/Icons";
import { C, FONT } from "./shared/constants";
import { useDashboardTheme } from "../../lib/useDashboardTheme";
import { api, getClassId, normalizeRoles, normalizeUser } from "../../lib/api";
import { type SubjectEnrollmentMode } from "../../lib/subjectEnrollment";
import { AttendanceTab } from "./AttendanceTab";
import {
  Calendar1Icon,
  BookOpen,
  ListChecks,
  LayoutDashboard,
  History,
} from "lucide-react";
import ClassTeacherAttendanceHistory from "./ClassTeacherAttendanceHistory";

// Wrapper icons for lucide components to match existing Icon interface
const OverviewIcon = () => <LayoutDashboard size={16} />;
const BookOpenIcon = () => <BookOpen size={16} />;
const ListChecksIcon = () => <ListChecks size={16} />;
const CalIcon = () => <Calendar1Icon size={16} />;

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
  // {
  //   id: "assignments",
  //   label: "Subject Assignments",
  //   desc: "See subjects and the assigned teachers.",
  //   Icon: HomeIcon,
  // },
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
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return normalizeUser(parsed.user || parsed);
      } catch (e) {}
    }
    return null;
  });

  const [tab, setTab] = useState(() => {
    const saved = localStorage.getItem(CLASS_TEACHER_TAB_KEY);
    return saved && validClassTeacherTabs.has(saved) ? saved : "overview";
  });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classSubjectCatalog, setClassSubjectCatalog] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useDashboardTheme();

  const loadData = useCallback(async () => {
    if (!currentUser?.classGrade || !currentUser?.classStream) {
      setError("No class assigned to your profile.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [studentsData, subjectsData, staffData] = (await Promise.all([
        api.get(
          `/users/class/${currentUser.classGrade}/${currentUser.classStream}`,
          {
            term: currentUser.term,
            year: currentUser.year,
            examType: currentUser.examType,
          },
        ),
        api.get(`/class/subject/${encodeURIComponent(getClassId()!)}`),
        api.get(`/get/students?classId=${encodeURIComponent(getClassId()!)}`), // Get assignments and staff names
      ])) as [any[], any[], any];
      setStudents(studentsData);

      const mappedSubjects = subjectsData.map((subject: any) => ({
        ...subject,
        id: subject.id || subject._id,
      }));
      setClassSubjectCatalog(mappedSubjects);
      setSubjects(
        mappedSubjects.filter((subject: any) => subject.isOffered !== false),
      );

      // Filter assignments for THIS class
      const classAssignments = (staffData.assignments || [])
        .filter(
          (a: any) =>
            a.classGrade === currentUser.classGrade &&
            a.classStream === currentUser.classStream,
        )
        .map((a: any) => {
          const teacher = staffData.staff.find(
            (s: any) => s.id === a.teacherId,
          );
          return {
            ...a,
            teacherName: teacher ? teacher.name : "Unknown",
          };
        });
      setAssignments(classAssignments);
    } catch (err: any) {
      setError(err.message || "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const toggleSubjectOffering = useCallback(
    async (
      subjectId: string,
      isOffered: boolean,
      enrollmentMode: SubjectEnrollmentMode = "compulsory",
      sharedSlotId: string | null = null,
    ) => {
      if (!currentUser?.classGrade) {
        throw new Error("No class is assigned to your profile.");
      }
      let payload: any = {
        subjectId,
        classGrade: currentUser.classGrade,
        classStream: currentUser.classStream || "",
        isOffered,
        enrollmentMode,
      };
      if (enrollmentMode !== "compulsory") {
        payload.sharedSlotId = sharedSlotId;
      }

      await api.put("/school/class-subjects", payload);
      await loadData();
    },
    [currentUser, loadData],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshUser = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const freshUser: any = await api.get(`/users/${currentUser.id}`);
      if (freshUser) {
        // Ensure roles is always an array (backend may return object from DB)
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
      }
    } catch (e) {}
  }, [currentUser?.id]);

  const handleManualRefresh = async () => {
    setLoading(true);
    await refreshUser();
    await loadData();
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  // Roles check — guard against roles being a non-array
  const rolesArray = normalizeRoles(currentUser?.roles);
  const isSubjectTeacher = rolesArray.includes("SUBJECTTEACHER");
  const hasSubjectAssignments = currentUser?.subjects?.length > 0;
  const canSwitchToSubjectDashboard = isSubjectTeacher && hasSubjectAssignments;

  useEffect(() => {
    if (!currentUser || !rolesArray.includes("CLASSTEACHER")) {
      navigate("/login");
    }
  }, [currentUser, navigate, rolesArray]);

  const handleSelectTab = (t: string) => {
    setTab(t);
    localStorage.setItem(CLASS_TEACHER_TAB_KEY, t);
    setSelectedStudent(null);
    setMobileMenuOpen(false);
  };

  const activeNav = NAV.find((n) => n.id === tab) || NAV[0];

  const renderContent = () => {
    if (loading)
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          Loading records...
        </div>
      );
    if (error)
      return (
        <div style={{ padding: 40, textAlign: "center", color: C.dangerText }}>
          {error}
        </div>
      );

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
            classInfo={`Grade ${currentUser?.classGrade}${currentUser?.classStream}`}
          />
        );
      case "attendance-history":
        return <ClassTeacherAttendanceHistory />;
      case "marks":
        return (
          <MarksManagement
            students={students}
            subjects={subjects}
            onRefresh={loadData}
            user={currentUser}
          />
        );
      // case "assignments":
      //   return (
      //     <SubjectAssignments
      //       subjects={classSubjectCatalog}
      //       assignments={assignments}
      //       classGrade={currentUser.classGrade}
      //       classStream={currentUser.classStream}
      //       classTeacherName={currentUser.name}
      //       canSwitchToSubjectDashboard={canSwitchToSubjectDashboard}
      //       onSwitchToSubjectDashboard={() => navigate("/subjectTeacher")}
      //       onToggleSubjectOffering={toggleSubjectOffering}
      //       onRefresh={loadData}
      //     />
      //   );
      case "subject-joint":
        return (
          <SubjectJointTab
            subjects={classSubjectCatalog}
            user={currentUser}
            onRefresh={loadData}
          />
        );
      case "elective-enrollment":
        return (
          <ElectiveEnrollmentTab
            students={students}
            subjects={classSubjectCatalog}
            user={currentUser}
            onRefresh={loadData}
          />
        );
      case "attendance":
        return <AttendanceTab user={currentUser} />;
      case "timetable":
        return (
          <TimetableLibrary
            fetchPath="/timetables/my"
            fetchParams={{ view: "class" }}
            title="Class Timetable"
            description="Review the published timetable for your class and open the uploaded PDF when needed."
            emptyMessage="No class timetable has been published for your current academic cycle yet."
          />
        );
      case "results":
        return (
          <ResultsReports
            students={students}
            subjects={subjects}
            classGrade={currentUser.classGrade}
            classStream={currentUser.classStream}
            term={currentUser.term}
            year={currentUser.year}
            examType={currentUser.examType}
          />
        );
      case "analytics":        
        return (
          <Analytics
            students={students}
            subjects={subjects.filter(s=>s.enrollmentMode!=="DROPPED")}
            classGrade={currentUser.classGrade}
            classStream={currentUser.classStream}
            term={currentUser.term}
            year={currentUser.year}
          />
        );
      case "archives":
        return (
          <ArchivesView
            classGrade={currentUser.classGrade}
            classStream={currentUser.classStream}
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
          navItems={NAV}
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

          {/* Subject teacher switch banner */}
          {canSwitchToSubjectDashboard && tab !== "overview" && (
            <div
              style={{
                padding: "8px 24px",
                background: "rgba(201,150,61,0.08)",
                borderBottom: `1px solid rgba(201,150,61,0.2)`,
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

          {/* Content area */}
          <div
            className="ct-contentArea"
            style={{ flex: 1, overflowY: "auto", padding: "24px" }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}
