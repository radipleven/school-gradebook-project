import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  userId: string | null;
  role: string | null;
  login: (userId: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('user_id'));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('role'));

  useEffect(() => {
    if (userId) localStorage.setItem('user_id', userId);
    else localStorage.removeItem('user_id');
    if (role) localStorage.setItem('role', role);
    else localStorage.removeItem('role');
  }, [userId, role]);

  const login = (userId: string, role: string) => {
    setUserId(userId);
    setRole(role);
  };

  const logout = () => {
    setUserId(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ userId, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}; 