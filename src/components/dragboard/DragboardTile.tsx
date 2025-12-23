import React, { useMemo } from 'react';

import { Icon } from '../ui/Icon';

import { DRAGBOARD_CONSTANTS } from './constants';
import { useTileById, useDragboardActions } from './DragboardProvider';

export interface DragboardTileProps {
  id: string;
  children: React.ReactNode;
  viewportColumns?: number; // Passed from Grid component via cloneElement
}

const DragboardTileComponent: React.FC<DragboardTileProps> = ({
  id,
  children,
  viewportColumns = 1,
}) => {
  // Use selective hook that only re-renders when THIS tile changes
  const { tile, isDragging } = useTileById(id);
  const { startTileDrag, endTileDrag, removeTile } = useDragboardActions();

  // Calculate grid position from order
  // Order 0 = first cell, order 1 = second cell, etc.
  // Wrapping happens automatically: order 3 with 3 columns = row 2, col 1
  const { row, col } = useMemo(
    () => ({
      row: tile ? Math.floor(tile.order / viewportColumns) : 0,
      col: tile ? tile.order % viewportColumns : 0,
    }),
    [tile, viewportColumns],
  );

  if (!tile) {
    return null;
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    startTileDrag(id);
  };

  const handleDragEnd = () => {
    endTileDrag(null); // Will be updated by drop handler
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeTile(id);
  };

  return (
    <div
      className="relative flex flex-col w-full h-full group"
      style={{
        minWidth: `${DRAGBOARD_CONSTANTS.MIN_TILE_WIDTH}px`,
        minHeight: `${DRAGBOARD_CONSTANTS.MIN_TILE_HEIGHT}px`,
        gridColumn: `${col + 1} / span 1`, // Always span 1
        gridRow: `${row + 1} / span 1`, // Always span 1
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-tile-id={id}
      role="gridcell"
      aria-label={`Tile ${id}`}
    >
      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded bg-surface-secondary hover:bg-surface-tertiary text-theme-secondary hover:text-theme-primary focus:outline-none focus:ring-2 focus:ring-interactive-primary"
        aria-label="Remove tile"
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Icon name="close" size="sm" />
      </button>
      {children}
    </div>
  );
};

// Memoize with custom comparison - only re-render if id or viewportColumns changed
export const DragboardTile = React.memo(DragboardTileComponent, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id && prevProps.viewportColumns === nextProps.viewportColumns;
});
