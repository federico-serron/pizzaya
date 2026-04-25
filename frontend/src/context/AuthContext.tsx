import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { UserResponse, LoginRequest, RegisterRequest } from '../types';
import { loginUser, logoutUser, registerUser, fetchMe } from '../services/auth';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to restore session on mount
  useEffect(() => {
    let cancelled = false;
    async function restore() {
      try {
        const userData = await fetchMe();
        if (!cancelled) setUser(userData);
      } catch {
        // Not logged in — that's fine
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const result = await loginUser(data);
    setUser(result.user);
    toast.success(`¡Bienvenido, ${result.user.full_name}!`);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Even if the server call fails, clear local state
    }
    setUser(null);
    toast.success('Cerraste sesión');
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await registerUser(data);
    // Auto-login after register
    await login({ email: data.email, password: data.password });
  }, [login]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
