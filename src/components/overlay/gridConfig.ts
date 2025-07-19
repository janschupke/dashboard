// Grid and tile sizing configuration for the dashboard (app-owned)

export const DASHBOARD_GRID_CONFIG = {
  columns: 8,
  rows: 12, // This will be dynamically adjusted
  tileSizes: {
    small: { colSpan: 2, rowSpan: 1 },
    medium: { colSpan: 2, rowSpan: 1 },
    large: { colSpan: 4, rowSpan: 1 },
  },
  breakpoints: { sm: 640, md: 768, lg: 1024 },
  dynamicExtensions: true, // Enable dynamic row expansion
  consolidation: true, // Consolidate tiles to minimize gaps
};

export type TileSize = 'small' | 'medium' | 'large';

export function getTileSpan(size: TileSize) {
  return DASHBOARD_GRID_CONFIG.tileSizes[size] || DASHBOARD_GRID_CONFIG.tileSizes.medium;
}
