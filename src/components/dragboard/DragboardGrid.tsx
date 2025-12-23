import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';

import { useDragboard } from './DragboardProvider';
import { DRAGBOARD_CONSTANTS } from './constants';

interface DragboardGridProps {
  children: React.ReactNode;
}

// Calculate viewport columns correctly
const calculateViewportColumns = (containerWidth: number): number => {
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

export const DragboardGrid: React.FC<DragboardGridProps> = ({ children }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [viewportColumns, setViewportColumns] = useState(1);
  const { dragState, endTileDrag, endSidebarDrag, setDropTarget } = useDragboard();

  useEffect(() => {
    const updateColumns = () => {
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
      e.dataTransfer.dropEffect = 'move';

      if (!gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 16; // Account for padding
      const y = e.clientY - rect.top - 16;

      // Calculate which grid cell the mouse is over
      const cellWidth = (rect.width - 32) / viewportColumns; // Account for padding
      const cellHeight = DRAGBOARD_CONSTANTS.MIN_TILE_HEIGHT + DRAGBOARD_CONSTANTS.GRID_GAP;

      const col = Math.floor(x / (cellWidth + DRAGBOARD_CONSTANTS.GRID_GAP));
      const row = Math.floor(y / (cellHeight + DRAGBOARD_CONSTANTS.GRID_GAP));

      const dropIndex = Math.max(0, row * viewportColumns + col);
      setDropTarget(dropIndex);
    },
    [viewportColumns, setDropTarget],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      if (!gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 16; // Account for padding
      const y = e.clientY - rect.top - 16;

      // Calculate which grid cell the mouse is over
      const cellWidth = (rect.width - 32) / viewportColumns; // Account for padding
      const cellHeight = DRAGBOARD_CONSTANTS.MIN_TILE_HEIGHT + DRAGBOARD_CONSTANTS.GRID_GAP;

      const col = Math.floor(x / (cellWidth + DRAGBOARD_CONSTANTS.GRID_GAP));
      const row = Math.floor(y / (cellHeight + DRAGBOARD_CONSTANTS.GRID_GAP));

      const dropIndex = Math.max(0, row * viewportColumns + col);

      setDropTarget(null); // Clear drop target on drop

      if (dragState.draggingTileId) {
        endTileDrag(dropIndex);
      } else if (dragState.sidebarTileType) {
        endSidebarDrag(dropIndex, dragState.sidebarTileType);
      }
    },
    [viewportColumns, dragState, endTileDrag, endSidebarDrag],
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
  const dropZonePosition = useMemo(() => {
    if (dragState.dropIndex === null) return null;
    const row = Math.floor(dragState.dropIndex / viewportColumns);
    const col = dragState.dropIndex % viewportColumns;
    return { row, col };
  }, [dragState.dropIndex, viewportColumns]);

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
