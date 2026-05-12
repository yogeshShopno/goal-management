import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { ROLES } from '../constants';

const AuthContext = createContext(null);

const DEMO_ADMIN = { id: 'u1', name: 'Bhavik', role: ROLES.ADMIN };
const DEMO_USER = { id: 'u2', name: 'Ramesh', role: ROLES.USER };

export function AuthProvider({ children }) {
  const [isAdminView, setIsAdminView] = useState(true);

  const currentUser = useMemo(
    () => (isAdminView ? DEMO_ADMIN : DEMO_USER),
    [isAdminView]
  );

  const isAdmin = currentUser.role === ROLES.ADMIN;

  const switchRole = useCallback(() => {
    setIsAdminView((v) => !v);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAdmin,
      switchRole,
    }),
    [currentUser, isAdmin, switchRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
