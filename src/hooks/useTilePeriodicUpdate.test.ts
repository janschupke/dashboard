import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { useTilePeriodicUpdate } from '../components/tile/useTilePeriodicUpdate';

describe('useTilePeriodicUpdate', () => {
  it('increments counter with interval', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTilePeriodicUpdate({ interval: 1000 }));

    const first = result.current;
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const second = result.current;
    expect(second).toBe(first + 1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    const third = result.current;
    expect(third).toBe(second + 2);

    vi.useRealTimers();
  });
});
