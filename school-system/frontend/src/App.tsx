import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import StudentDashboard from "./components/students/StudentDashboard";
import LoginPage from "./components/auth/login";
import ErrorPage from "./components/error";
import ClassTeacherDashboard from "./components/classteacher/ClassTeacherDashboard";
import DeputyHeadDashboard from "./components/deputyhead/DeputyHeadDashboard";
import SubjectTeacherDashboard from "./components/subjectteacher/SubjectTeacherDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import LandingPage from "./components/landingPage";
import { ChangePasswordPage } from "./components/shared/ChangePasswordPage";
import {
  getDefaultDashboardPath,
  normalizeUser,
  normalizeRoles,
  ROLE_PATHS,
} from "./lib/api";
import SchoolRegistration from "./components/auth/SchoolRegistration";
import SuperAdminDashboard from "./components/superAdmin/SuperAdmin";

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
    return roles.includes("SUPERADMIN") ? <>{children}</> : <Navigate to="/login" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

const DashboardSelector = () => {
  const saved = localStorage.getItem("user");
  if (!saved) return <Navigate to="/login" replace />;
  try {
    const session = JSON.parse(saved);
    const user = normalizeUser(session.user || session);
    const roles = normalizeRoles(user?.roles || user?.role);
    const validRoles = roles.filter((r) => ROLE_PATHS[r]);

    if (validRoles.length <= 1) {
      return <Navigate to={getDefaultDashboardPath(user)} replace />;
    }

    const roleLabels: Record<string, string> = {
      ADMIN: "Admin",
      SUPERADMIN: "Super Admin",
      HEADTEACHER: "Head Teacher",
      DEPUTYTEACHER: "Deputy Head",
      CLASSTEACHER: "Class Teacher",
      SUBJECTTEACHER: "Subject Teacher",
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
            {validRoles.map((role) => {
              const path = `/edunex-org${ROLE_PATHS[role]}`;
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
      <Routes>
        <Route
          path="/edunex-org/superAdmin"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          }
        />
        <Route path="/" element={<LandingPage />} />
        <Route path="/register/school" element={<SchoolRegistration />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/edunex-org/dashboard"
          element={
            <ProtectedRoute>
              <DashboardSelector />
            </ProtectedRoute>
          }
        />

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
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
