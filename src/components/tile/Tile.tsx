import React, { Suspense, memo } from 'react';
import type { DragboardTileData } from '../dragboard';
import { getLazyTileComponent, getTileMeta } from './TileFactoryRegistry';
import { GenericTile } from './GenericTile';
import { LoadingComponent } from './LoadingComponent';

export interface TileProps {
  tile: DragboardTileData;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onRemove?: (id: string) => void;
  refreshKey?: number;
}

const TileComponent = ({ tile, dragHandleProps, onRemove, refreshKey }: TileProps) => {
  const LazyTileComponent = getLazyTileComponent(tile.type);
  const meta = getTileMeta(tile.type);

  if (!LazyTileComponent || !meta) {
    return (
      <GenericTile
        tile={tile}
        meta={{
          title: 'Unknown Tile',
          icon: 'warning',
        }}
        dragHandleProps={dragHandleProps}
        onRemove={onRemove}
      >
        <div className="flex items-center justify-center h-full p-4 text-theme-text-tertiary">
          <p>Unknown tile type: {tile.type}</p>
        </div>
      </GenericTile>
    );
  }

  return (
    <Suspense
      fallback={
        <GenericTile
          tile={tile}
          meta={meta}
          dragHandleProps={dragHandleProps}
          onRemove={onRemove}
        >
          <LoadingComponent />
        </GenericTile>
      }
    >
      <LazyTileComponent
        tile={tile}
        meta={meta}
        dragHandleProps={dragHandleProps}
        onRemove={onRemove}
        refreshKey={refreshKey}
      />
    </Suspense>
  );
};

export const Tile = memo(TileComponent);
