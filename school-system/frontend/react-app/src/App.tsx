import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./components/auth/login";
import ErrorPage from "./components/error";
import LandingPage from "./components/landingPage";
import { ChangePasswordPage } from "./components/shared/ChangePasswordPage";
import AdminDashboard from "./components/admin/AdminDashboard";
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
        
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
