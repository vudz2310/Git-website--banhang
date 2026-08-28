import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../feature/auth/services/authService';
import type { User } from '../api/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => AuthService.getUser());

  useEffect(() => {
    // Đồng bộ user ban đầu
    const currentUser = AuthService.getUser();
    setUser(currentUser);
  }, []);

  const login = (userData: User, token?: string) => {
    AuthService.setUser(userData);
    if (token) {
      AuthService.setToken(token);
    }
    setUser(userData);
  };

  const logout = () => {
    AuthService.clearUser();
    setUser(null);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updatedFields };
    AuthService.setUser(newUser);
    setUser(newUser);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
