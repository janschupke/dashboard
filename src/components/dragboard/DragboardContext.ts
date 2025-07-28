import { createContext, useContext } from 'react';

import type { DragboardTileData } from './dragboardTypes';

export interface DragboardConfig {
  /** Number of columns in the grid */
  columns: number;
  /** Number of rows in the grid */
  rows: number;
  /** Tile size definitions */
  tileSizes: Record<'small' | 'medium' | 'large', { colSpan: number; rowSpan: number }>;
  /** Responsive breakpoints */
  breakpoints: Record<string, number>;
  /** If true, tiles are always consolidated (no gaps, always fill from top-left). Default: true */
  consolidation?: boolean;
  /** If true, tiles can be moved by drag. Default: true */
  movementEnabled?: boolean;
  /** If true, board will dynamically add rows if a tile doesn't fit. Default: true */
  dynamicExtensions?: boolean;
  /** If true, dragging a tile out of bounds will remove it. If false, tile returns to original position. Default: false */
  allowDragOutOfBounds?: boolean;
}

export interface DragboardDragState {
  draggingTileId: string | null;
  dragOrigin: { x: number; y: number } | null;
  dragOffset: { x: number; y: number } | null;
  dropTarget: { x: number; y: number } | null;
  isSidebarDrag: boolean;
  sidebarTileType?: string;
}

export interface DragboardContextValue {
  config: DragboardConfig;
  dragState: DragboardDragState;
  startTileDrag: (tileId: string, origin: { x: number; y: number }) => void;
  updateTileDrag: (offset: { x: number; y: number }) => void;
  endTileDrag: (dropTarget: { x: number; y: number } | null, tileId?: string) => void;
  startSidebarDrag: (tileType: string) => void;
  endSidebarDrag: (dropTarget: { x: number; y: number } | null, tileType?: string) => void;
  setDropTarget: (target: { x: number; y: number } | null) => void;
  // Board state/actions
  tiles: DragboardTileData[];
  addTile: (tile: DragboardTileData) => void;
  removeTile: (id: string) => void;
  updateTile: (id: string, updates: Partial<DragboardTileData>) => void;
  moveTile: (tileId: string, newPosition: { x: number; y: number }) => void;
  reorderTiles: (tiles: DragboardTileData[]) => void;
  /** If false, disables drag-and-drop for tiles */
  movementEnabled?: boolean;
  /** Current row count (for dynamic extension/reduction) */
  rows: number;
}

/**
 * Interface for items that can be dropped into the dragboard grid.
 * External components (e.g., sidebar menu items) should implement this for type safety.
 */
export interface DragboardDroppableItem {
  /**
   * The unique type or identifier for the tile/item.
   */
  tileType: string;
  /**
   * Optionally, the default size for the tile when dropped (e.g., 'small', 'medium', 'large').
   */
  defaultSize?: 'small' | 'medium' | 'large';
  /**
   * Optionally, any initial config or data for the tile.
   */
  initialConfig?: Record<string, unknown>;
}

/**
 * Interface for dragboard-compatible sidebar drag items.
 * Used for type checking and documentation.
 */
export interface DragboardSidebarDragItem extends DragboardDroppableItem {
  /**
   * Optionally, a display name for the item.
   */
  displayName?: string;
  /**
   * Optionally, an icon name or component for the item.
   */
  icon?: string;
}

export const DragboardContext = createContext<DragboardContextValue | undefined>(undefined);

export const useDragboard = () => {
  const ctx = useContext(DragboardContext);
  if (!ctx) throw new Error('useDragboard must be used within DragboardProvider');
  return ctx;
};

// Drag-only context for performance: only drag state and drag actions
export interface DragboardDragContextValue {
  dragState: DragboardDragState;
  startTileDrag: (tileId: string, origin: { x: number; y: number }) => void;
  updateTileDrag: (offset: { x: number; y: number }) => void;
  endTileDrag: (dropTarget: { x: number; y: number } | null, tileId?: string) => void;
  startSidebarDrag: (tileType: string) => void;
  endSidebarDrag: (dropTarget: { x: number; y: number } | null, tileType?: string) => void;
  setDropTarget: (target: { x: number; y: number } | null) => void;
}

export const DragboardDragContext = createContext<DragboardDragContextValue | undefined>(undefined);

export const useDragboardDrag = () => {
  const ctx = useContext(DragboardDragContext);
  if (!ctx) throw new Error('useDragboardDrag must be used within DragboardProvider');
  return ctx;
};
