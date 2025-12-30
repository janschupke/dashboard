import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { usePeriodicUpdate } from './usePeriodicUpdate';

describe('usePeriodicUpdate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return 0 initially', () => {
    const { result } = renderHook(() => usePeriodicUpdate({ interval: 1000 }));
    expect(result.current).toBe(0);
  });

  it('should increment counter at specified interval', () => {
    const { result } = renderHook(() => usePeriodicUpdate({ interval: 1000 }));

    expect(result.current).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(2);
  });

  it('should not update when interval is 0', () => {
    const { result } = renderHook(() => usePeriodicUpdate({ interval: 0 }));

    vi.advanceTimersByTime(5000);
    expect(result.current).toBe(0);
  });

  it('should not update when interval is undefined', () => {
    const { result } = renderHook(() => usePeriodicUpdate({}));

    vi.advanceTimersByTime(5000);
    expect(result.current).toBe(0);
  });

  it('should not update when enabled is false', () => {
    const { result } = renderHook(() => usePeriodicUpdate({ interval: 1000, enabled: false }));

    vi.advanceTimersByTime(5000);
    expect(result.current).toBe(0);
  });

  it('should stop updating when unmounted', () => {
    const { result, unmount } = renderHook(() => usePeriodicUpdate({ interval: 1000 }));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(1);

    unmount();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // Counter should not increment after unmount (result.current is still accessible but won't update)
    expect(result.current).toBe(1);
  });

  it('should restart when interval changes', () => {
    const { result, rerender } = renderHook(({ interval }) => usePeriodicUpdate({ interval }), {
      initialProps: { interval: 1000 },
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(1);

    rerender({ interval: 500 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(2);
  });
});
