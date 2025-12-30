/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useCallback, createContext } from 'react';

import { useAuthService } from '../services/authService';

import type { AuthCheckData } from '../types/auth';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const authService = useAuthService();

  const checkAuth = useCallback(async () => {
    try {
      // Skip auth check in test environment
      if (typeof window === 'undefined' || import.meta.env['NODE_ENV'] === 'test') {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const checkAuthResult: AuthCheckData = await authService.checkAuth();
      setIsAuthenticated(checkAuthResult.authenticated);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  const login = useCallback(
    async (password: string): Promise<boolean> => {
      try {
        const data = await authService.login(password);
        if (data.success) {
          setIsAuthenticated(true);
          return true;
        } else {
          console.error('Login failed:', data.error);
          return false;
        }
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },
    [authService],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [authService]);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
