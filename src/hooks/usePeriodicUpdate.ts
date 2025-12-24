import { useState, useEffect, useRef } from 'react';

export interface UsePeriodicUpdateOptions {
  /** Update interval in milliseconds. If 0 or undefined, updates are disabled */
  interval?: number;
  /** Whether updates are enabled. Defaults to true if interval is set */
  enabled?: boolean;
}

/**
 * Hook that triggers re-renders at specified intervals for UI-only updates.
 * Does NOT trigger data fetching - only causes component re-render.
 *
 * @param options Configuration for periodic updates
 * @returns Current update counter (increments on each interval)
 */
export function usePeriodicUpdate(options: UsePeriodicUpdateOptions = {}): number {
  const { interval, enabled = interval !== undefined && interval > 0 } = options;
  const [updateCount, setUpdateCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !interval || interval <= 0) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setUpdateCount((prev) => prev + 1);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval]);

  return updateCount;
}
