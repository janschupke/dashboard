import React, { useMemo, useRef } from 'react';

import { Tooltip } from 'react-tooltip';

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
  const tileContainerRef = useRef<HTMLDivElement>(null);

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

    // Find the actual tile Card element (not the wrapper) to use as drag image
    const tileCard = tileContainerRef.current?.querySelector('[data-tile-id]') as HTMLElement;
    if (tileCard) {
      // Calculate offset to position drag image relative to cursor
      const rect = tileCard.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      e.dataTransfer.setDragImage(tileCard, offsetX, offsetY);
    }

    startTileDrag(id);
  };

  const handleDragEnd = () => {
    endTileDrag(null); // Will be updated by drop handler
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeTile(id);
  };

  // Create drag handle props to pass to the tile header
  const dragHandleProps = {
    draggable: true,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
  };

  return (
    <div
      ref={tileContainerRef}
      className="relative flex flex-col w-full h-full group"
      style={{
        minWidth: `${DRAGBOARD_CONSTANTS.MIN_TILE_WIDTH}px`,
        minHeight: `${DRAGBOARD_CONSTANTS.MIN_TILE_HEIGHT}px`,
        gridColumn: `${col + 1} / span 1`, // Always span 1
        gridRow: `${row + 1} / span 1`, // Always span 1
        opacity: isDragging ? 0.5 : 1,
      }}
      data-tile-id={id}
      role="gridcell"
      aria-label={`Tile ${id}`}
    >
      <>
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 z-20 opacity-100 transition-opacity duration-200 p-1 rounded bg-surface-secondary hover:bg-surface-tertiary text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-interactive-primary"
          aria-label="Remove tile"
          data-tooltip-id={`dragboard-tile-remove-tooltip-${id}`}
          data-tooltip-content="Remove tile"
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Icon name="close" size="sm" />
        </button>
        <Tooltip id={`dragboard-tile-remove-tooltip-${id}`} />
      </>
      {React.isValidElement(children)
        ? React.cloneElement(children, { dragHandleProps } as {
            dragHandleProps: typeof dragHandleProps;
          })
        : children}
    </div>
  );
};

// Memoize with custom comparison - only re-render if id or viewportColumns changed
export const DragboardTile = React.memo(DragboardTileComponent, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id && prevProps.viewportColumns === nextProps.viewportColumns;
});
