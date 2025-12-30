import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { ThemeProvider } from '../contexts/ThemeContext';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  it('should throw error when used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within ThemeProvider');

    consoleSpy.mockRestore();
  });

  it('should return theme context when used within ThemeProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current).toHaveProperty('theme');
    expect(result.current).toHaveProperty('toggleTheme');
    expect(result.current).toHaveProperty('setTheme');
    expect(result.current).toHaveProperty('tokens');
    expect(typeof result.current.toggleTheme).toBe('function');
    expect(typeof result.current.setTheme).toBe('function');
  });
});

