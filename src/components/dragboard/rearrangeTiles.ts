import { getTileSpan, DASHBOARD_GRID_CONFIG } from '../overlay/gridConfig';

import type { DragboardConfig } from './DragboardContext';
import type { DragboardTileData } from './dragboardTypes';

export function rearrangeTiles(tiles: DragboardTileData[]): DragboardTileData[] {
  if (tiles.length === 0) return tiles;
  const sortedTiles = [...tiles].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const GRID_ROWS = DASHBOARD_GRID_CONFIG.rows;
  const GRID_COLUMNS = DASHBOARD_GRID_CONFIG.columns;
  const grid = Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLUMNS).fill(false));
  const rearrangedTiles: DragboardTileData[] = [];
  for (const tile of sortedTiles) {
    const size = typeof tile.size === 'string' ? tile.size : 'medium';
    const { colSpan, rowSpan } = getTileSpan(size);
    let newPosition = { x: 0, y: 0 };
    let found = false;
    outer: for (let y = 0; y <= GRID_ROWS - rowSpan; y++) {
      for (let x = 0; x <= GRID_COLUMNS - colSpan; x++) {
        let canPlace = true;
        for (let i = y; i < y + rowSpan; i++) {
          for (let j = x; j < x + colSpan; j++) {
            if (grid[i] && grid[i][j]) {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }
        if (canPlace) {
          newPosition = { x, y };
          found = true;
          break outer;
        }
      }
    }
    if (found) {
      for (let i = newPosition.y; i < newPosition.y + rowSpan; i++) {
        for (let j = newPosition.x; j < newPosition.x + colSpan; j++) {
          if (grid[i] && grid[i][j] !== undefined) {
            grid[i][j] = true;
          }
        }
      }
      // Preserve original object reference, only update position
      rearrangedTiles.push({ ...tile, position: newPosition });
    }
  }
  // Map rearranged positions back onto original objects by id
  return rearrangedTiles.map((rearranged) => {
    const orig = tiles.find((t) => t.id === rearranged.id);
    return orig ? { ...orig, position: rearranged.position } : rearranged;
  });
}

export function findNextFreePosition(
  tiles: DragboardTileData[],
  gridConfig: DragboardConfig,
  size: 'small' | 'medium' | 'large',
): { x: number; y: number } | null {
  const GRID_ROWS = gridConfig.rows;
  const GRID_COLUMNS = gridConfig.columns;
  const { colSpan, rowSpan } = getTileSpan(size);
  const grid = Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLUMNS).fill(false));
  // Mark occupied cells
  for (const tile of tiles) {
    const tSize = typeof tile.size === 'string' ? tile.size : 'medium';
    const { colSpan: tCol, rowSpan: tRow } = getTileSpan(tSize);
    const pos = tile.position || { x: 0, y: 0 };
    for (let i = pos.y; i < pos.y + tRow; i++) {
      for (let j = pos.x; j < pos.x + tCol; j++) {
        if (grid[i] && grid[i][j] !== undefined) {
          grid[i][j] = true;
        }
      }
    }
  }
  // Find first free spot for the new tile
  for (let y = 0; y <= GRID_ROWS - rowSpan; y++) {
    for (let x = 0; x <= GRID_COLUMNS - colSpan; x++) {
      let canPlace = true;
      for (let i = y; i < y + rowSpan; i++) {
        for (let j = x; j < x + colSpan; j++) {
          if (grid[i] && grid[i][j]) {
            canPlace = false;
            break;
          }
        }
        if (!canPlace) break;
      }
      if (canPlace) {
        return { x, y };
      }
    }
  }
  return null;
}
