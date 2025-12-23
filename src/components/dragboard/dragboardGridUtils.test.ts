import { describe, it, expect } from 'vitest';

import {
  calculateViewportColumns,
  calculateGridCellFromPosition,
  calculateDropIndex,
  clampDropIndex,
  calculateDropZonePosition,
} from './dragboardGridUtils';
import { DRAGBOARD_CONSTANTS } from './constants';

describe('dragboardGridUtils', () => {
  describe('calculateViewportColumns', () => {
    it('should return minimum 1 column', () => {
      expect(calculateViewportColumns(100)).toBe(1);
      expect(calculateViewportColumns(0)).toBe(1);
      expect(calculateViewportColumns(-100)).toBe(1);
    });

    it('should calculate correct number of columns for typical widths', () => {
      // For 1000px width: (1000 - 32 + 16) / (250 + 16) = 984 / 266 ≈ 3.7 → 3
      expect(calculateViewportColumns(1000)).toBe(3);

      // For 500px width: (500 - 32 + 16) / (250 + 16) = 484 / 266 ≈ 1.8 → 1
      expect(calculateViewportColumns(500)).toBe(1);

      // For 1500px width: (1500 - 32 + 16) / (250 + 16) = 1484 / 266 ≈ 5.5 → 5
      expect(calculateViewportColumns(1500)).toBe(5);
    });

    it('should account for padding and gap correctly', () => {
      const width = 1000;
      const columns = calculateViewportColumns(width);
      const availableWidth = width - 32;
      const totalCellWidth = columns * DRAGBOARD_CONSTANTS.MIN_TILE_WIDTH;
      const totalGapWidth = (columns - 1) * DRAGBOARD_CONSTANTS.GRID_GAP;
      expect(totalCellWidth + totalGapWidth).toBeLessThanOrEqual(availableWidth);
    });
  });

  describe('calculateGridCellFromPosition', () => {
    const containerWidth = 1000;
    const viewportColumns = 3;

    it('should calculate correct cell for position in first cell', () => {
      const { row, col } = calculateGridCellFromPosition(20, 20, containerWidth, viewportColumns);
      expect(row).toBe(0);
      expect(col).toBe(0);
    });

    it('should calculate correct cell for position in second column', () => {
      const availableWidth = containerWidth - 32;
      const cellWidth = (availableWidth - (viewportColumns - 1) * DRAGBOARD_CONSTANTS.GRID_GAP) / viewportColumns;
      const x = cellWidth + DRAGBOARD_CONSTANTS.GRID_GAP + 10; // Second cell
      const { row, col } = calculateGridCellFromPosition(x, 20, containerWidth, viewportColumns);
      expect(row).toBe(0);
      expect(col).toBe(1);
    });

    it('should calculate correct cell for position in second row', () => {
      const cellHeight = DRAGBOARD_CONSTANTS.MIN_TILE_HEIGHT;
      const y = cellHeight + DRAGBOARD_CONSTANTS.GRID_GAP + 10; // Second row
      const { row, col } = calculateGridCellFromPosition(20, y, containerWidth, viewportColumns);
      expect(row).toBe(1);
      expect(col).toBe(0);
    });

    it('should clamp column to valid range', () => {
      const { col } = calculateGridCellFromPosition(10000, 20, containerWidth, viewportColumns);
      expect(col).toBe(viewportColumns - 1);
    });

    it('should not allow negative row', () => {
      const { row } = calculateGridCellFromPosition(20, -100, containerWidth, viewportColumns);
      expect(row).toBe(0);
    });
  });

  describe('calculateDropIndex', () => {
    it('should calculate correct drop index for first cell', () => {
      expect(calculateDropIndex(0, 0, 3)).toBe(0);
    });

    it('should calculate correct drop index for second column', () => {
      expect(calculateDropIndex(0, 1, 3)).toBe(1);
    });

    it('should calculate correct drop index for second row', () => {
      expect(calculateDropIndex(1, 0, 3)).toBe(3);
    });

    it('should calculate correct drop index for middle cell', () => {
      expect(calculateDropIndex(1, 1, 3)).toBe(4);
    });

    it('should handle different column counts', () => {
      expect(calculateDropIndex(2, 1, 4)).toBe(9); // row 2, col 1, 4 columns = 2*4 + 1 = 9
    });
  });

  describe('clampDropIndex', () => {
    it('should allow dropping at end for sidebar drags', () => {
      expect(clampDropIndex(5, 3, true)).toBe(3); // tiles.length
      expect(clampDropIndex(10, 3, true)).toBe(3);
    });

    it('should allow dropping at tiles.length - 1 for tile drags', () => {
      expect(clampDropIndex(5, 3, false)).toBe(2); // tiles.length - 1
      expect(clampDropIndex(10, 3, false)).toBe(2);
    });

    it('should not clamp valid indices', () => {
      expect(clampDropIndex(0, 5, true)).toBe(0);
      expect(clampDropIndex(2, 5, true)).toBe(2);
      expect(clampDropIndex(1, 5, false)).toBe(1);
    });

    it('should handle empty tiles array', () => {
      expect(clampDropIndex(5, 0, true)).toBe(0);
      expect(clampDropIndex(5, 0, false)).toBe(0);
    });
  });

  describe('calculateDropZonePosition', () => {
    it('should return null for null drop index', () => {
      expect(calculateDropZonePosition(null, 3)).toBeNull();
    });

    it('should calculate correct position for first cell', () => {
      const result = calculateDropZonePosition(0, 3);
      expect(result).toEqual({ row: 0, col: 0 });
    });

    it('should calculate correct position for second column', () => {
      const result = calculateDropZonePosition(1, 3);
      expect(result).toEqual({ row: 0, col: 1 });
    });

    it('should calculate correct position for second row', () => {
      const result = calculateDropZonePosition(3, 3);
      expect(result).toEqual({ row: 1, col: 0 });
    });

    it('should calculate correct position for middle cell', () => {
      const result = calculateDropZonePosition(4, 3);
      expect(result).toEqual({ row: 1, col: 1 });
    });

    it('should handle different column counts', () => {
      const result = calculateDropZonePosition(9, 4);
      expect(result).toEqual({ row: 2, col: 1 });
    });
  });
});

