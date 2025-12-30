import type { ReactNode } from 'react';

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { AuthProvider } from '../contexts/AuthContext';
import { MockDataServicesProvider } from '../test/mocks/componentMocks';

import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('should throw error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');

    consoleSpy.mockRestore();
  });

  it('should return auth context when used within AuthProvider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MockDataServicesProvider>
        <AuthProvider>{children}</AuthProvider>
      </MockDataServicesProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Context should be available immediately, even if isLoading is still true
    // The important thing is that all required properties exist
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('checkAuth');
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.checkAuth).toBe('function');
    // In test mode, isLoading should eventually be false, but we don't need to wait
    expect(typeof result.current.isLoading).toBe('boolean');
    expect(typeof result.current.isAuthenticated).toBe('boolean');
  });
});
