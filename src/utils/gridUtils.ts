import type { DragboardConfig } from '../components/dragboard/DragboardContext';
import type { DragboardTileData } from '../components/dragboard/dragboardTypes';

/**
 * Grid utility functions
 * Extracted from DragboardProvider to maintain separation of concerns
 */

/**
 * Snaps a position to the nearest valid tile increment
 */
export function snapToTileGrid(
  x: number,
  y: number,
  config: DragboardConfig,
  tileSize: 'small' | 'medium' | 'large',
): { x: number; y: number } {
  const { colSpan, rowSpan } = config.tileSizes[tileSize] || config.tileSizes['medium'];
  return {
    x: Math.max(0, Math.min(config.columns - colSpan, Math.round(x / colSpan) * colSpan)),
    y: Math.max(0, Math.min(config.rows - rowSpan, Math.round(y / rowSpan) * rowSpan)),
  };
}

/**
 * Gets the highest occupied row in the grid
 */
export function getHighestOccupiedRow(
  tiles: DragboardTileData[],
  tileSizes: DragboardConfig['tileSizes'],
  minRows: number,
): number {
  let maxRow = minRows - 1;
  for (const tile of tiles) {
    const { rowSpan } = tileSizes[tile.size] || tileSizes['medium'];
    const tileBottom = tile.position.y + rowSpan - 1;
    if (tileBottom > maxRow) maxRow = tileBottom;
  }
  return Math.max(maxRow + 1, minRows);
}

/**
 * Checks if a tile fits in the current grid
 */
export function tileFits(
  tile: DragboardTileData,
  tiles: DragboardTileData[],
  tileSizes: DragboardConfig['tileSizes'],
  rows: number,
  columns: number,
): boolean {
  const { colSpan, rowSpan } = tileSizes[tile.size] || tileSizes['medium'];
  for (let y = 0; y <= rows - rowSpan; y++) {
    for (let x = 0; x <= columns - colSpan; x++) {
      const overlap = tiles.some((t) => {
        const tSize = tileSizes[t.size] || tileSizes['medium'];
        return (
          x < t.position.x + tSize.colSpan &&
          x + colSpan > t.position.x &&
          y < t.position.y + tSize.rowSpan &&
          y + rowSpan > t.position.y
        );
      });
      if (!overlap) return true;
    }
  }
  return false;
}

