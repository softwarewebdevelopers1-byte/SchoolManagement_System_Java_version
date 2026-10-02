import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import {
  getDefaultDashboardPath,
  normalizeUser,
  normalizeRoles,
  ROLE_PATHS,
  api,
} from "./lib/api";
import "./App.css";

const StudentDashboard = lazy(() => import("./components/students/StudentDashboard"));
const LoginPage = lazy(() => import("./components/auth/login"));
const ErrorPage = lazy(() => import("./components/error"));
const ClassTeacherDashboard = lazy(
  () => import("./components/classteacher/ClassTeacherDashboard"),
);
const ComplexClassTeacherDashboard = lazy(
  () => import("./components/classteacher/ComplexClassTeacherDashboard"),
);
const DeputyHeadDashboard = lazy(
  () => import("./components/deputyhead/DeputyHeadDashboard"),
);
const SubjectTeacherDashboard = lazy(
  () => import("./components/subjectteacher/SubjectTeacherDashboard"),
);
const TeacherRemarksPage = lazy(
  () => import("./components/subjectteacher/TeacherRemarksPage"),
);
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const LandingPage = lazy(() => import("./components/landingPage"));
const ChangePasswordPage = lazy(
  () => import("./components/shared/ChangePasswordPage").then((module) => ({
    default: module.ChangePasswordPage,
  })),
);
const UnassignedPage = lazy(() => import("./components/shared/UnassignedPage"));
const PublicSchoolsPage = lazy(
  () => import("./components/public/PublicSchoolsPage"),
);
const SchoolRegistration = lazy(
  () => import("./components/auth/SchoolRegistration"),
);
const SuperAdminLayout = lazy(
  () => import("./components/TopAdmin/SuperAdminLayout"),
);
const SuperAdminOverview = lazy(
  () => import("./components/TopAdmin/SuperAdminOverview"),
);
const SuperAdminSchools = lazy(
  () => import("./components/TopAdmin/SuperAdminSchools"),
);
const SuperAdminSchoolDetail = lazy(
  () => import("./components/TopAdmin/SuperAdminSchoolDetail"),
);
const SuperAdminStaff = lazy(
  () => import("./components/TopAdmin/SuperAdminStaff"),
);
const SuperAdminInvitations = lazy(
  () => import("./components/TopAdmin/SuperAdminInvitations"),
);
const SuperAdminAnalytics = lazy(
  () => import("./components/TopAdmin/SuperAdminAnalytics"),
);
const SuperAdminLoginPage = lazy(
  () => import("./components/auth/SuperAdminLoginPage"),
);
const AcceptAdminInvite = lazy(
  () => import("./components/auth/AcceptAdminInvite"),
);
const StudentResults = lazy(() => import("./components/StudentsResultsPage"));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const saved = localStorage.getItem("user");
  if (!saved) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const saved = localStorage.getItem("user");
  if (!saved) return <Navigate to="/login" replace />;
  try {
    const session = JSON.parse(saved);
    const roles = normalizeRoles(session.user?.roles || session.roles);
    return roles.includes("SUPERADMIN") ? (
      <>{children}</>
    ) : (
      <Navigate to="/login" replace />
    );
  } catch {
    return <Navigate to="/login" replace />;
  }
};

const DashboardSelector = () => {
  const [remarksTeacher, setRemarksTeacher] = useState(false);
  const [checkingRemarks, setCheckingRemarks] = useState(true);
  const [singleTeacherSchool, setSingleTeacherSchool] = useState<boolean | null>(null);
  const saved = localStorage.getItem("user");
  let user: any = null;
  try {
    if (saved) {
      const session = JSON.parse(saved);
      user = normalizeUser(session.user || session);
    }
  } catch {
    user = null;
  }

  useEffect(() => {
    if (!user?.id || !user?.teacherId) {
      setCheckingRemarks(false);
      return;
    }
    let cancelled = false;
    api
      .get<any[]>("/school/subjects")
      .then((subjects) => {
        const teacherId = String(user.teacherId);
        const assigned = (subjects || []).some(
          (subject) =>
            String(subject.mainTeacherId || subject.mainTeacher?.id || "") ===
            teacherId,
        );
        if (!cancelled) setRemarksTeacher(assigned);
      })
      .catch(() => {
        if (!cancelled) setRemarksTeacher(false);
      })
      .finally(() => {
        if (!cancelled) setCheckingRemarks(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.teacherId]);

  // A teacher who is also the only administrator should not have to choose
  // between two views of the same school.  This check is deliberately done
  // only for the ADMIN + CLASSTEACHER combination and is cached for this tab.
  useEffect(() => {
    const roles = normalizeRoles(user?.roles || user?.role);
    const isCandidate = roles.includes("ADMIN") && roles.includes("CLASSTEACHER");
    if (!isCandidate || !user?.schoolId) {
      setSingleTeacherSchool(false);
      return;
    }
    let cancelled = false;
    api.get<any[]>(`/users/${encodeURIComponent(user.schoolId)}/teachers`)
      .then((teachers) => {
        const isSingleTeacher = Array.isArray(teachers) && teachers.length === 1;
        if (!cancelled) {
          setSingleTeacherSchool(isSingleTeacher);
          if (isSingleTeacher) {
            sessionStorage.setItem("edunex.singleTeacherAdminClassTeacher", String(user.schoolId));
          } else {
            sessionStorage.removeItem("edunex.singleTeacherAdminClassTeacher");
          }
        }
      })
      .catch(() => { if (!cancelled) setSingleTeacherSchool(false); });
    return () => { cancelled = true; };
  }, [user?.schoolId, user?.roles]);

  if (!saved || !user) return <Navigate to="/login" replace />;
  if (checkingRemarks || singleTeacherSchool === null) return null;
  try {
    const roles = normalizeRoles(user?.roles || user?.role);
    const validRoles = roles.filter((r) => ROLE_PATHS[r]);

    if (singleTeacherSchool && roles.includes("ADMIN") && roles.includes("CLASSTEACHER")) {
      return <Navigate to="/edunex-org/complex-class-teacher" replace />;
    }

    const selectorRoles = [
      ...validRoles,
      ...(remarksTeacher && !validRoles.includes("SUBJECTTEACHER_REMARKS")
        ? ["SUBJECTTEACHER_REMARKS"]
        : []),
    ];

    if (selectorRoles.length === 0) {
      return <Navigate to="/edunex-org/unassigned" replace />;
    }

    if (selectorRoles.length <= 1) {
      if (selectorRoles[0] === "SUBJECTTEACHER_REMARKS") {
        return <Navigate to="/edunex-org/subject-teacher-remarks" replace />;
      }
      return <Navigate to={getDefaultDashboardPath(user)} replace />;
    }

    const roleLabels: Record<string, string> = {
      ADMIN: "Admin",
      SUPERADMIN: "Super Admin",
      HEADTEACHER: "Head Teacher",
      DEPUTYTEACHER: "Deputy Head",
      CLASSTEACHER: "Class Teacher",
      SUBJECTTEACHER: "Subject Teacher",
      SUBJECTTEACHER_REMARKS: "Subject Remarks",
      STUDENT: "Student",
    };

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#163325",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 24,
            padding: "48px 40px",
            boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
            textAlign: "center",
            maxWidth: 520,
            width: "90%",
          }}
        >
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "#0f2e22",
              margin: "0 0 8px",
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#5d665f",
              margin: "0 0 28px",
            }}
          >
            Choose a dashboard to continue
          </p>
          <div
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            {selectorRoles.map((role) => {
              const path =
                role === "SUBJECTTEACHER_REMARKS"
                  ? "/edunex-org/subject-teacher-remarks"
                  : `/edunex-org${ROLE_PATHS[role]}`;
              return (
                <a
                  key={role}
                  href={path}
                  style={{
                    display: "block",
                    padding: "16px 20px",
                    background: "#f3f4f3",
                    border: "2px solid #e5e7e5",
                    borderRadius: 14,
                    textDecoration: "none",
                    color: "#0f2e22",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#c9963d";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = "#c9963d";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f3f4f3";
                    e.currentTarget.style.color = "#0f2e22";
                    e.currentTarget.style.borderColor = "#e5e7e5";
                  }}
                >
                  {roleLabels[role] || role}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  } catch {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<main role="status">Loading...</main>}>
        <Routes>
        <Route
          path="/edunex-org/superAdmin/*"
          element={
            <SuperAdminRoute>
              <SuperAdminLayout>
                <Routes>
                  <Route path="/" element={<SuperAdminOverview />} />
                  <Route path="/schools" element={<SuperAdminSchools />} />
                  <Route
                    path="/schools/:schoolId"
                    element={<SuperAdminSchoolDetail />}
                  />
                  <Route path="/staff" element={<SuperAdminStaff />} />
                  <Route
                    path="/invitations"
                    element={<SuperAdminInvitations />}
                  />
                  <Route path="/analytics" element={<SuperAdminAnalytics />} />
                </Routes>
              </SuperAdminLayout>
            </SuperAdminRoute>
          }
        />
        <Route path="/" element={<LandingPage />} />
        <Route path="/schools" element={<PublicSchoolsPage />} />
        <Route path="/register/school" element={<SchoolRegistration />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
        <Route path="/invite/:token" element={<AcceptAdminInvite />} />
        <Route
          path="/edunex-org/dashboard"
          element={
            <ProtectedRoute>
              <DashboardSelector />
            </ProtectedRoute>
          }
        />
        <Route element={<StudentResults />} path="/edunex-org/results" />
        <Route element={<StudentResults />} path="/results/:token" />

        <Route
          path="/edunex-org/students"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edunex-org/classTeacher"
          element={
            <ProtectedRoute>
              <ClassTeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edunex-org/complex-class-teacher"
          element={
            <ProtectedRoute>
              <ComplexClassTeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edunex-org/deputyHead"
          element={
            <ProtectedRoute>
              <DeputyHeadDashboard userRole="deputy" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edunex-org/headteacher"
          element={
            <ProtectedRoute>
              <DeputyHeadDashboard userRole="headteacher" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edunex-org/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edunex-org/subjectTeacher"
          element={
            <ProtectedRoute>
              <SubjectTeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edunex-org/subject-teacher-remarks"
          element={
            <ProtectedRoute>
              <TeacherRemarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edunex-org/unassigned"
          element={
            <ProtectedRoute>
              <UnassignedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
