import React, { useCallback, useMemo } from 'react';

import { useDragboard, useDragboardDrag } from './DragboardContext';

export interface DraggableTileProps {
  id: string;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onRemove?: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
  'data-tile-id'?: string;
  'data-tile-type'?: string;
  role?: string;
  'aria-label'?: string;
}

export type DraggableTileComponent = React.ComponentType<DraggableTileProps>;

export interface DragboardTileProps {
  id: string;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const DragboardTileComponent: React.FC<DragboardTileProps> = ({ id, position, size, children }) => {
  const { config, removeTile } = useDragboard();
  const { dragState, startTileDrag, endTileDrag } = useDragboardDrag();
  const isDragging = dragState.draggingTileId === id;

  // Native drag-and-drop handlers - memoized to prevent recreation
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!config.movementEnabled) return;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/dashboard-tile-id', id);
      startTileDrag(id, position);
    },
    [id, position, startTileDrag, config.movementEnabled],
  );

  const handleDragEnd = useCallback(() => {
    if (!config.movementEnabled) return;
    endTileDrag(dragState.dropTarget, id);
  }, [dragState.dropTarget, endTileDrag, id, config.movementEnabled]);

  // Pass drag handle props to the child tile - memoized to prevent recreation
  const dragHandleProps = useMemo<React.HTMLAttributes<HTMLDivElement>>(
    () =>
      config.movementEnabled
        ? {
            draggable: true,
            onDragStart: handleDragStart,
            onDragEnd: handleDragEnd,
          }
        : {},
    [handleDragStart, handleDragEnd, config.movementEnabled],
  );

  // Memoize the remove function to prevent recreation
  const handleRemove = React.useCallback(
    (tileId: string) => {
      removeTile(tileId);
    },
    [removeTile],
  );

  // Helper type guard
  function hasIdProp(child: unknown): child is { props: { id: string } } {
    return (
      React.isValidElement(child) &&
      typeof child.props === 'object' &&
      child.props !== null &&
      'id' in child.props
    );
  }

  return (
    <div
      className={`relative transition-shadow duration-200 ${isDragging ? 'opacity-50' : ''}`}
      style={{
        gridColumn: `${position.x + 1} / span ${config.tileSizes[size].colSpan}`,
        gridRow: `${position.y + 1} / span ${config.tileSizes[size].rowSpan}`,
        zIndex: isDragging ? 50 : undefined,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch', // Stretch to fill grid cell height
        justifySelf: 'stretch', // Stretch to fill grid cell width
        minHeight: '100px', // Minimum height to match drop zones
      }}
      data-tile-id={id}
      role="gridcell"
      aria-label={`Tile ${id}`}
    >
      {/* Tile header for drag handle */}
      <div
        {...dragHandleProps}
        className="absolute top-0 left-0 w-full h-8 cursor-grab z-20"
        style={{ pointerEvents: config.movementEnabled ? 'auto' : 'none' }}
      />
      {/* Only clone child if id changes, else pass as-is */}
      {hasIdProp(children) && children.props.id === id
        ? children
        : React.isValidElement(children)
          ? React.cloneElement(children, {
              dragHandleProps,
              onRemove: handleRemove,
            } as Partial<DraggableTileProps>)
          : children}
      {isDragging && (
        <div className="absolute inset-0 bg-theme-primary opacity-30 pointer-events-none z-50 rounded-lg" />
      )}
    </div>
  );
};
export const DragboardTile = React.memo(
  DragboardTileComponent,
  (prev, next) =>
    prev.id === next.id &&
    prev.position.x === next.position.x &&
    prev.position.y === next.position.y &&
    prev.size === next.size &&
    prev.children === next.children,
);
