import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';

import { DRAGBOARD_CONSTANTS } from './constants';
import {
  calculateViewportColumns,
  calculateGridCellFromPosition,
  calculateDropIndex,
  clampDropIndex,
  calculateDropZonePosition,
} from './dragboardGridUtils';
import { useTiles, useDragState, useDragboardActions } from './DragboardProvider';

interface DragboardGridProps {
  children: React.ReactNode;
}

export const DragboardGrid: React.FC<DragboardGridProps> = ({ children }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [viewportColumns, setViewportColumns] = useState(1);
  const tiles = useTiles();
  const dragState = useDragState();
  const { endTileDrag, endSidebarDrag, setDropTarget } = useDragboardActions();

  useEffect(() => {
    const updateColumns = (): void => {
      if (!gridRef.current) return;
      const width = gridRef.current.getBoundingClientRect().width;
      const columns = calculateViewportColumns(width);
      setViewportColumns(columns);
    };

    updateColumns();
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(updateColumns);
    });

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    window.addEventListener('resize', updateColumns);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateColumns);
    };
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      // Set dropEffect based on drag source
      if (dragState.sidebarTileType) {
        e.dataTransfer.dropEffect = 'copy';
      } else {
        e.dataTransfer.dropEffect = 'move';
      }

      if (!gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 16; // Account for padding
      const y = e.clientY - rect.top - 16;

      // Calculate which grid cell the mouse is over
      const { row, col } = calculateGridCellFromPosition(x, y, rect.width, viewportColumns);
      let dropIndex = calculateDropIndex(row, col, viewportColumns);

      // Clamp drop index to valid range
      dropIndex = clampDropIndex(dropIndex, tiles.length, !!dragState.sidebarTileType);

      setDropTarget(dropIndex);
    },
    [viewportColumns, setDropTarget, dragState, tiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      if (!gridRef.current) return;

      // Use the dropIndex from dragState (set by handleDragOver)
      const dropIndex = dragState.dropIndex ?? 0;

      setDropTarget(null); // Clear drop target on drop

      if (dragState.draggingTileId) {
        endTileDrag(dropIndex);
      } else if (dragState.sidebarTileType) {
        endSidebarDrag(dropIndex, dragState.sidebarTileType);
      }
    },
    [dragState, endTileDrag, endSidebarDrag, setDropTarget],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      // Only cancel if leaving the grid entirely
      if (!gridRef.current?.contains(e.relatedTarget as Node)) {
        setDropTarget(null);
        if (dragState.draggingTileId) {
          endTileDrag(null);
        } else if (dragState.sidebarTileType) {
          endSidebarDrag(null, dragState.sidebarTileType);
        }
      }
    },
    [dragState, endTileDrag, endSidebarDrag, setDropTarget],
  );

  // Clone children and pass viewportColumns as prop
  const childrenWithProps = useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { viewportColumns } as { viewportColumns: number });
      }
      return child;
    });
  }, [children, viewportColumns]);

  // Calculate drop zone position
  const dropZonePosition = useMemo(
    () => calculateDropZonePosition(dragState.dropIndex, viewportColumns),
    [dragState.dropIndex, viewportColumns],
  );

  const isDragging = dragState.draggingTileId !== null || dragState.sidebarTileType !== undefined;

  return (
    <div
      ref={gridRef}
      className="relative w-full min-h-full p-4 grid gap-4 content-start"
      style={{
        gridTemplateColumns: `repeat(${viewportColumns}, minmax(${DRAGBOARD_CONSTANTS.MIN_TILE_WIDTH}px, 1fr))`,
        gridAutoRows: `minmax(${DRAGBOARD_CONSTANTS.MIN_TILE_HEIGHT}px, auto)`,
        alignItems: 'stretch',
        gap: `${DRAGBOARD_CONSTANTS.GRID_GAP}px`,
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      role="grid"
      data-testid="dragboard-grid"
    >
      {childrenWithProps}
      {isDragging && dropZonePosition && (
        <div
          className="border-2 border-dashed rounded-lg pointer-events-none z-10 transition-all duration-150"
          style={{
            gridColumn: `${dropZonePosition.col + 1} / span 1`,
            gridRow: `${dropZonePosition.row + 1} / span 1`,
            minWidth: `${DRAGBOARD_CONSTANTS.MIN_TILE_WIDTH}px`,
            minHeight: `${DRAGBOARD_CONSTANTS.MIN_TILE_HEIGHT}px`,
            borderColor: 'var(--interactive-primary)',
            backgroundColor: 'var(--interactive-primary)',
            opacity: 0.1,
          }}
          data-testid="drop-zone-indicator"
        />
      )}
    </div>
  );
};
