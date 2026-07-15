import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const ROLES = {
  admin: { label: 'Administrator', base: '/app/admin' },
  headteacher: { label: 'Headteacher', base: '/app/headteacher' },
  classteacher: { label: 'Class Teacher', base: '/app/class-teacher' },
  subjectteacher: { label: 'Subject Teacher', base: '/app/subject-teacher' },
  student: { label: 'Student', base: '/app/student' },
  parent: { label: 'Parent', base: '/app/parent' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('edunex-user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('edunex-user', JSON.stringify(user));
    else localStorage.removeItem('edunex-user');
  }, [user]);

  const login = async (email, password) => {
    const { user: sessionUser, token } = await authApi.login(email, password);
    localStorage.setItem('edunex-token', token);
    setUser(sessionUser);
    return sessionUser;
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem('edunex-token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
