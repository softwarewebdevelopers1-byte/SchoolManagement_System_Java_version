import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, CalendarDays, PencilLine, BookOpen, ListChecks, Table2, BarChart3, FileText, Settings2, School } from "lucide-react";
import { api, getClassId, normalizeRoles, normalizeUser } from "../../lib/api";
import { useDashboardTheme } from "../../lib/useDashboardTheme";
import { GlobalStyles } from "./shared/GlobalStyles";
import { C, FONT } from "./shared/constants";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { StudentRecords } from "./StudentRecords";
import { AttendanceTab } from "./AttendanceTab";
import { MarksManagement } from "./MarksManagement";
import { SubjectJointTab } from "./SubjectJointTab";
import { ElectiveEnrollmentTab } from "./ElectiveEnrollmentTab";
import { ResultsReports } from "./ResultsReports";
import { Analytics } from "./Analytics";
import { TimetableLibrary } from "../shared/TimetableLibrary";
import type { NavItem } from "./types";
import {
  friendlyErrorMessage,
  useNotifications,
} from "../shared/notifications/NotificationContext";

const icon = (Icon: typeof LayoutDashboard) => () => <Icon size={16} />;
const NAV: NavItem[] = [
  { id: "overview", label: "Overview", desc: "Your class and school at a glance.", Icon: icon(LayoutDashboard) },
  { id: "students", label: "Students", desc: "Manage your class roster.", Icon: icon(Users) },
  { id: "attendance", label: "Attendance", desc: "Take attendance for today.", Icon: icon(CalendarDays) },
  { id: "marks", label: "Marks", desc: "Capture marks for your class.", Icon: icon(PencilLine) },
  { id: "subjects", label: "Subjects", desc: "Register class subjects.", Icon: icon(BookOpen) },
  { id: "electives", label: "Elective Enrollment", desc: "Manage elective choices.", Icon: icon(ListChecks) },
  { id: "timetable", label: "Timetable", desc: "View the class timetable.", Icon: icon(Table2) },
  { id: "results", label: "Results", desc: "Review class results.", Icon: icon(FileText) },
  { id: "analytics", label: "Class Analytics", desc: "Understand class performance.", Icon: icon(BarChart3) },
  { id: "school", label: "School Management", desc: "Run school-wide administration.", Icon: icon(School) },
  { id: "administration", label: "Administration", desc: "Settings, grading and archives.", Icon: icon(Settings2) },
];

const activeStudents = (students: any[]) => students.filter((student) => String(student.status || "ACTIVE").toUpperCase() === "ACTIVE");

export default function ComplexClassTeacherDashboard() {
  const toast = useNotifications();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useDashboardTheme();
  const [user] = useState(() => {
    try { const saved = localStorage.getItem("user"); return saved ? normalizeUser(JSON.parse(saved).user || JSON.parse(saved)) : null; } catch { return null; }
  });
  const roles = normalizeRoles(user?.roles);
  const classId = user?.classId || getClassId();
  const isSingleTeacherSchool =
    sessionStorage.getItem("edunex.singleTeacherAdminClassTeacher") === String(user?.schoolId);
  const [tab, setTab] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    if (!classId || !user?.classGrade || !user?.classStream) {
      const message = "No class is assigned to your profile.";
      setError(message);
      toast.error(message);
      setLoading(false);
      return;
    }
    setLoading(true); setError("");
    const date = new Date().toISOString().slice(0, 10);
    const context = `term=${encodeURIComponent(user.term || 1)}&academicYear=${encodeURIComponent(user.year || new Date().getFullYear())}&examType=${encodeURIComponent(user.examType || "OPENER")}`;
    try {
      const [studentPage, classSubjects, attendanceCount, dashboard] = await Promise.all([
        api.get<any>(`/users/class/${encodeURIComponent(user.classGrade)}/${encodeURIComponent(user.classStream)}`, { term: user.term, year: user.year, examType: user.examType }),
        api.get<any[]>(`/class/subject/${encodeURIComponent(classId)}`),
        api.get<any>(`/attendance/sheet/count?classId=${encodeURIComponent(classId)}&date=${date}${user.teacherId ? `&teacherId=${encodeURIComponent(user.teacherId)}` : ""}`),
        api.get<any>(`/stats/marks/class/${encodeURIComponent(classId)}/dashboard?${context}`).catch(() => null),
      ]);
      setStudents(studentPage?.content || []);
      setSubjects((classSubjects || []).map((subject) => ({ ...subject, id: subject.id || subject._id })));
      setAttendance(attendanceCount);
      setPerformance(dashboard);
    } catch (requestError) {
      const message = friendlyErrorMessage(requestError, "Unable to load the dashboard. Please try again.");
      setError(message);
      toast.error(message);
    }
    finally { setLoading(false); }
  }, [classId, user?.classGrade, user?.classStream, user?.term, user?.year, user?.examType, user?.teacherId, toast]);

  useEffect(() => { void loadOverview(); }, [loadOverview]);
  useEffect(() => { const onResize = () => { const mobile = window.innerWidth <= 900; setIsMobile(mobile); if (!mobile) setMobileOpen(false); }; window.addEventListener("resize", onResize); return () => window.removeEventListener("resize", onResize); }, []);

  const selectTab = (next: string) => { setTab(next); setMobileOpen(false); };
  const selected = NAV.find((item) => item.id === tab) || NAV[0];
  const offeredSubjects = useMemo(() => subjects.filter((subject) => subject.isOffered !== false), [subjects]);
  const learners = useMemo(() => activeStudents(students), [students]);
  const openAdmin = (adminTab: string) => { localStorage.setItem("edunex.admin.activeTab", adminTab); navigate("/edunex-org/admin"); };

  if (!roles.includes("ADMIN") || !roles.includes("CLASSTEACHER") || !isSingleTeacherSchool) return <Navigate to="/edunex-org/dashboard" replace />;

  const overview = (
    <div className="ct-anim" style={{ display: "grid", gap: 20 }}>
      <section style={{ background: C.green, borderRadius: 16, padding: "24px 28px", color: C.white }}>
        <p style={{ margin: "0 0 6px", color: C.gold, fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>Single-teacher school hub</p>
        <h1 style={{ fontFamily: FONT.serif, margin: "0 0 8px", fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>Welcome, {user?.name?.split(" ")[0] || "Teacher"}</h1>
        <p style={{ margin: 0, color: "#d3dfd7", fontSize: 13 }}>Grade {user?.classGrade} {user?.classStream} · Term {user?.term || 1}, {user?.year || new Date().getFullYear()} · {user?.examType || "Current exam"}</p>
      </section>
      {loading ? <p>Loading class summary…</p> : error ? <div style={{ color: C.dangerText }}>{error} <button onClick={() => void loadOverview()}>Try again</button></div> : <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {[
            ["Learners", learners.length, "Active students"], ["Subjects", offeredSubjects.length, "Currently offered"],
            ["Present today", attendance?.present ?? "—", `${attendance?.absent ?? 0} absent`],
            ["Attendance", attendance ? `${Math.round(((attendance.present || 0) / Math.max(attendance.total || 0, 1)) * 100)}%` : "—", "Today's register"],
          ].map(([label, value, note]) => <div key={String(label)} style={{ background: C.white, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.gold}`, borderRadius: 12, padding: 16 }}><p style={{ margin: "0 0 6px", color: C.textMuted, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>{label}</p><strong style={{ fontFamily: FONT.serif, fontSize: 28, color: C.text }}>{value}</strong><p style={{ margin: "5px 0 0", color: C.textMuted, fontSize: 12 }}>{note}</p></div>)}
        </div>
        <section style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}><p style={{ margin: "0 0 10px", color: C.gold, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>Quick actions</p><div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>{[["Mark attendance", "attendance"], ["Enter marks", "marks"], ["View learners", "students"], ["Review results", "results"], ["Publish results", "school"]].map(([label, target]) => <button key={target} onClick={() => selectTab(target)} style={{ padding: "9px 13px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.sand, color: C.text, fontWeight: 700, cursor: "pointer" }}>{label}</button>)}</div></section>
        {performance && <p style={{ margin: 0, color: C.textMuted, fontSize: 12 }}>Performance data is available for the selected academic context.</p>}
      </>}
    </div>
  );
  const management = (title: string, items: Array<[string, string, string]>) => <div className="ct-anim"><p style={{ color: C.gold, fontWeight: 800, fontSize: 11, textTransform: "uppercase" }}>Authorized school operations</p><h1 style={{ fontFamily: FONT.serif, color: C.text }}>{title}</h1><p style={{ color: C.textMuted }}>These tools reuse the existing administrator workflows and their backend permissions.</p><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginTop: 20 }}>{items.map(([label, description, adminTab]) => <button key={adminTab} onClick={() => openAdmin(adminTab)} style={{ textAlign: "left", padding: 18, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, cursor: "pointer" }}><strong style={{ color: C.text }}>{label}</strong><p style={{ margin: "7px 0 0", color: C.textMuted, fontSize: 12, lineHeight: 1.45 }}>{description}</p></button>)}</div></div>;
  let content: React.ReactNode = overview;
  if (tab === "students") content = <StudentRecords classId={classId} classInfo={`Grade ${user?.classGrade} ${user?.classStream || ""}`} />;
  if (tab === "attendance") content = <AttendanceTab user={user} classId={classId} teacherId={user?.teacherId} />;
  if (tab === "marks") content = <MarksManagement students={students} subjects={offeredSubjects} user={user} />;
  if (tab === "subjects") content = <SubjectJointTab subjects={subjects} user={user} onRefresh={loadOverview} />;
  if (tab === "electives") content = <ElectiveEnrollmentTab students={students} subjects={subjects} user={user} />;
  if (tab === "timetable") content = <TimetableLibrary fetchPath="/timetables/my" fetchParams={{ view: "class" }} title="Class Timetable" description="Review the published timetable for your class." emptyMessage="No class timetable has been published yet." />;
  if (tab === "results") content = <ResultsReports students={students} subjects={offeredSubjects} classGrade={user?.classGrade} classStream={user?.classStream} term={user?.term} year={user?.year} examType={user?.examType} onViewStudent={() => undefined} />;
  if (tab === "analytics") content = <Analytics students={students} subjects={offeredSubjects} classGrade={user?.classGrade} classStream={user?.classStream} term={user?.term} year={user?.year} examType={user?.examType} />;
  if (tab === "school") content = management("School Management", [["Classes", "Manage classes and class-teacher assignments.", "classes"], ["School students", "Enroll and update learners across the school.", "students"], ["Staff & teachers", "Manage teacher profiles and staff roles.", "teachers"], ["Teacher assignments", "Assign subjects and classes.", "assignments"], ["Results publishing", "Publish results and manage secure result links.", "results"], ["Timetables", "Generate and publish school timetables.", "timetables"]]);
  if (tab === "administration") content = management("Administration", [["Academic cycle", "Manage term, year and exam settings.", "cycle"], ["School settings", "Update school configuration.", "school-settings"], ["CBC grading", "Configure grading scales.", "cbc-grading"], ["Archives", "Review archived performance reports.", "archives"], ["Exited learners", "Review and manage exited learner records.", "exited"], ["Attendance insights", "Review school attendance patterns.", "attendance-insights"]]);

  return <><GlobalStyles />{mobileOpen && <div className="ct-mobileOverlay" onClick={() => setMobileOpen(false)} />}<div className="ct-dashboardShell" data-theme={theme} style={{ display: "flex", height: "100vh", fontFamily: FONT.sans, background: C.sand, overflow: "hidden" }}><Sidebar navItems={NAV} activeTab={tab} collapsed={collapsed} mobileOpen={mobileOpen} isMobile={isMobile} onToggleCollapse={() => setCollapsed((value) => !value)} onSelectTab={selectTab} user={user} onChangePassword={() => navigate("/change-password")} onLogout={() => { localStorage.removeItem("user"); navigate("/login"); }} /><main className="ct-mainPanel" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}><TopBar activeLabel={selected.label} dashboardTitle="Complex Class Teacher Dashboard" isMobile={isMobile} onOpenMenu={() => setMobileOpen(true)} theme={theme} onToggleTheme={toggleTheme} onLogout={() => { localStorage.removeItem("user"); navigate("/login"); }} user={user} onRefresh={() => void loadOverview()} /><div className="ct-contentArea" style={{ flex: 1, overflowY: "auto", padding: 24 }}>{content}</div></main></div></>;
}
