import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/app/${user.role === 'classteacher' ? 'class-teacher' : user.role === 'subjectteacher' ? 'subject-teacher' : user.role}`} replace />;
  return children;
}
