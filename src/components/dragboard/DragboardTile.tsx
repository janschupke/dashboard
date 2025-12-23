import React from 'react';

import { useDragboard } from './DragboardProvider';
import { DRAGBOARD_CONSTANTS } from './constants';

import type { DragboardTileData } from './types';

interface DragboardTileProps {
  id: string;
  children: React.ReactNode;
  viewportColumns: number; // Passed from Grid component
}

export const DragboardTile: React.FC<DragboardTileProps> = ({
  id,
  children,
  viewportColumns,
}) => {
  const { tiles, startTileDrag, endTileDrag, dragState } = useDragboard();
  const tile = tiles.find((t) => t.id === id);

  if (!tile) {
    return null;
  }

  const isDragging = dragState.draggingTileId === id;

  // Calculate grid position from order
  // Order 0 = first cell, order 1 = second cell, etc.
  // Wrapping happens automatically: order 3 with 3 columns = row 2, col 1
  const row = Math.floor(tile.order / viewportColumns);
  const col = tile.order % viewportColumns;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    startTileDrag(id);
  };

  const handleDragEnd = () => {
    endTileDrag(null); // Will be updated by drop handler
  };

  return (
    <div
      className="relative flex flex-col w-full h-full"
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
      {children}
    </div>
  );
};
