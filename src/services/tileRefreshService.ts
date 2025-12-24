import { REFRESH_INTERVALS } from '../contexts/constants';

/**
 * Service for managing tile refresh operations
 * Extracted from component logic to maintain separation of concerns
 */
export class TileRefreshService {
  private refreshCallbacks: Set<() => void | Promise<void>> = new Set();
  private isRefreshing = false;

  /**
   * Register a tile refresh callback
   */
  registerRefreshCallback(callback: () => void | Promise<void>): () => void {
    this.refreshCallbacks.add(callback);
    // Return unregister function
    return () => {
      this.refreshCallbacks.delete(callback);
    };
  }

  /**
   * Refresh all registered tiles
   */
  async refreshAllTiles(): Promise<void> {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;
    try {
      // Execute all refresh callbacks in parallel
      await Promise.all(
        Array.from(this.refreshCallbacks).map((callback) => Promise.resolve(callback())),
      );
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Check if a refresh is currently in progress
   */
  getIsRefreshing(): boolean {
    return this.isRefreshing;
  }
}

/**
 * Default refresh delay for UI feedback
 * This gives users visual feedback that a refresh is happening
 */
export const DEFAULT_REFRESH_DELAY_MS = REFRESH_INTERVALS.COUNTDOWN_UPDATE;
