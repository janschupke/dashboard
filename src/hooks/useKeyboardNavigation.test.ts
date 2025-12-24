import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useKeyboardNavigation } from './useKeyboardNavigation';

const press = (key: string, target: EventTarget = document) => {
  const e = new KeyboardEvent('keydown', { key, bubbles: true });
  (target as HTMLElement).dispatchEvent(e);
};

describe('useKeyboardNavigation', () => {
  beforeEach(() => {
    // Ensure listeners added per test
  });

  it('toggles log with L', () => {
    const toggle = vi.fn();
    renderHook(() =>
      useKeyboardNavigation({
        toggleLogView: toggle,
        selectedIndex: 0,
        setSelectedIndex: () => {},
      }),
    );
    press('l');
    expect(toggle).toHaveBeenCalled();
  });

  it('refreshes with R when not refreshing', () => {
    const refresh = vi.fn();
    renderHook(() =>
      useKeyboardNavigation({
        refreshAllTiles: refresh,
        isRefreshing: false,
        selectedIndex: 0,
        setSelectedIndex: () => {},
      }),
    );
    press('r');
    expect(refresh).toHaveBeenCalled();
  });

  it('navigates list with arrows and activates with Enter', () => {
    const onToggle = vi.fn();
    let idx = 0;
    const { rerender } = renderHook(() =>
      useKeyboardNavigation({
        navigation: { items: ['a', 'b', 'c'], onToggle },
        selectedIndex: idx,
        setSelectedIndex: (n) => {
          idx = n as number;
        },
      }),
    );

    press('ArrowDown');
    rerender();
    expect(idx).toBe(1);

    press('Enter');
    expect(onToggle).toHaveBeenCalledWith('b');

    press('ArrowUp');
    rerender();
    expect(idx).toBe(0);
  });
});
