import React, { useState, useEffect, useCallback } from 'react';

import { useAuthService } from '../services/authService';

import { AuthContext, type AuthContextType } from './AuthContextDef';

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
      if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const data = await authService.checkAuth();
      setIsAuthenticated(data.authenticated);
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
    checkAuth();
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
