/**
 * Tile data structure - matches what's stored in localStorage
 * All tiles are the same size (1 column, 1 row)
 * Placement is order-based, not position-based
 */
export interface DragboardTileData {
  id: string;
  type: string; // TileType from app
  order: number; // Order in list (0, 1, 2, ...) - determines grid placement
  createdAt?: number;
  config?: Record<string, unknown>;
}

/**
 * Dragboard configuration
 * Simplified - no config needed, all behavior is automatic
 */
export interface DragboardConfig {
  // Empty - no config needed for order-based placement
}

/**
 * Dashboard state as stored in localStorage
 * This matches the StorageManager.DashboardState interface
 */
export interface DashboardState {
  tiles: Array<{
    id: string;
    type: string;
    order: number;
    createdAt: number;
    config?: Record<string, unknown>;
  }>;
}

