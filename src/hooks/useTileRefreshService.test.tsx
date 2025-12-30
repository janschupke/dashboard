import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { TileRefreshProvider } from '../contexts/TileRefreshContext';

import { useTileRefreshService } from './useTileRefreshService';

describe('useTileRefreshService', () => {
  it('should throw error when used outside TileRefreshProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTileRefreshService());
    }).toThrow('useTileRefreshService must be used within TileRefreshProvider');

    consoleSpy.mockRestore();
  });

  it('should return tile refresh service when used within TileRefreshProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TileRefreshProvider>{children}</TileRefreshProvider>
    );

    const { result } = renderHook(() => useTileRefreshService(), { wrapper });

    expect(result.current).toBeDefined();
    // The service should have refresh methods
    expect(typeof result.current).toBe('object');
  });
});
