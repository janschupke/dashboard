import { usePeriodicUpdate, type UsePeriodicUpdateOptions } from '../../hooks/usePeriodicUpdate';

export interface TilePeriodicUpdateConfig extends UsePeriodicUpdateOptions {
  // Can extend with tile-specific options if needed
}

/**
 * Hook for tiles that need periodic UI updates.
 * Returns update counter that can be used to trigger re-renders.
 */
export function useTilePeriodicUpdate(config?: TilePeriodicUpdateConfig): number {
  return usePeriodicUpdate(config);
}

