import { DRAGBOARD_CONSTANTS } from './constants';

/**
 * Calculate the number of columns that fit in the viewport
 * @param containerWidth - Total width of the container in pixels
 * @returns Number of columns (minimum 1)
 */
export const calculateViewportColumns = (containerWidth: number): number => {
  const padding = 32; // p-4 = 16px each side
  const availableWidth = containerWidth - padding;
  // Formula: availableWidth = n * minWidth + (n-1) * gap
  // Solving: n = (availableWidth + gap) / (minWidth + gap)
  const columns = Math.floor(
    (availableWidth + DRAGBOARD_CONSTANTS.GRID_GAP) /
      (DRAGBOARD_CONSTANTS.MIN_TILE_WIDTH + DRAGBOARD_CONSTANTS.GRID_GAP),
  );
  return Math.max(1, columns);
};

/**
 * Calculate the grid cell position from mouse coordinates
 * @param x - Mouse X coordinate relative to grid container (accounting for padding)
 * @param y - Mouse Y coordinate relative to grid container (accounting for padding)
 * @param containerWidth - Total width of the container in pixels
 * @param viewportColumns - Number of columns in the viewport
 * @returns Object with row and column indices (0-based)
 */
export const calculateGridCellFromPosition = (
  x: number,
  y: number,
  containerWidth: number,
  viewportColumns: number,
): { row: number; col: number } => {
  const availableWidth = containerWidth - 32; // Account for padding
  const cellWidth = (availableWidth - (viewportColumns - 1) * DRAGBOARD_CONSTANTS.GRID_GAP) / viewportColumns;
  const cellHeight = DRAGBOARD_CONSTANTS.MIN_TILE_HEIGHT;

  // Calculate column: account for gaps between cells
  const col = Math.min(
    viewportColumns - 1,
    Math.max(0, Math.floor(x / (cellWidth + DRAGBOARD_CONSTANTS.GRID_GAP))),
  );
  // Calculate row: account for gaps between rows
  const row = Math.max(0, Math.floor(y / (cellHeight + DRAGBOARD_CONSTANTS.GRID_GAP)));

  return { row, col };
};

/**
 * Calculate drop index from grid cell position
 * @param row - Row index (0-based)
 * @param col - Column index (0-based)
 * @param viewportColumns - Number of columns in the viewport
 * @returns Drop index (0-based)
 */
export const calculateDropIndex = (row: number, col: number, viewportColumns: number): number => {
  return row * viewportColumns + col;
};

/**
 * Clamp drop index to valid range based on drag source
 * @param dropIndex - Calculated drop index
 * @param tilesCount - Number of existing tiles
 * @param isSidebarDrag - Whether this is a drag from sidebar
 * @returns Clamped drop index
 */
export const clampDropIndex = (dropIndex: number, tilesCount: number, isSidebarDrag: boolean): number => {
  // For sidebar drags: allow up to tiles.length (insert at end)
  // For tile drags: allow up to tiles.length - 1 (can't drop after removing self)
  const maxIndex = isSidebarDrag ? tilesCount : Math.max(0, tilesCount - 1);
  return Math.min(dropIndex, maxIndex);
};

/**
 * Calculate drop zone grid position from drop index
 * @param dropIndex - Drop index (0-based)
 * @param viewportColumns - Number of columns in the viewport
 * @returns Object with row and column indices (0-based) or null if dropIndex is invalid
 */
export const calculateDropZonePosition = (
  dropIndex: number | null,
  viewportColumns: number,
): { row: number; col: number } | null => {
  if (dropIndex === null) return null;
  const row = Math.floor(dropIndex / viewportColumns);
  const col = dropIndex % viewportColumns;
  return { row, col };
};

