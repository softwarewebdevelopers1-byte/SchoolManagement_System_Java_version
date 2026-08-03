import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import StudentDashboard from "./components/students/StudentDashboard";
import LoginPage from "./components/auth/login";
import ErrorPage from "./components/error";
import LandingPage from "./components/landingPage";
import { ChangePasswordPage } from "./components/shared/ChangePasswordPage";
import UnifiedDashboard from "./components/shared/UnifiedDashboard";
import { getStoredSession } from "./api";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!getStoredSession()) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><UnifiedDashboard /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/classTeacher" element={<Navigate to="/dashboard" replace />} />
        <Route path="/deputyHead" element={<Navigate to="/dashboard" replace />} />
        <Route path="/headteacher" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/subjectTeacher" element={<Navigate to="/dashboard" replace />} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
