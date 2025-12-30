import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { ToastProvider } from '../contexts/ToastContext';
import { useToast } from './useToast';

describe('useToast', () => {
  it('should throw error when used outside ToastProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within a ToastProvider');

    consoleSpy.mockRestore();
  });

  it('should return toast context when used within ToastProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastProvider>{children}</ToastProvider>
    );

    const { result } = renderHook(() => useToast(), { wrapper });

    expect(result.current).toHaveProperty('toasts');
    expect(result.current).toHaveProperty('addToast');
    expect(result.current).toHaveProperty('removeToast');
    expect(Array.isArray(result.current.toasts)).toBe(true);
    expect(typeof result.current.addToast).toBe('function');
    expect(typeof result.current.removeToast).toBe('function');
  });
});

