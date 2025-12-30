import React, { Suspense, memo } from 'react';

import { TileType } from '../../types/tile';

import { GenericTile } from './GenericTile';
import { LoadingComponent } from './LoadingComponent';
import { getLazyTileComponent, getTileMeta } from './TileFactoryRegistry';

import type { DragboardTileData } from '../dragboard';

export interface TileProps {
  tile: DragboardTileData;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onRemove?: (id: string) => void;
  refreshKey?: number;
}

const TileComponent = ({
  tile,
  dragHandleProps,
  onRemove,
  refreshKey,
}: TileProps): React.ReactNode => {
  const LazyTileComponent = getLazyTileComponent(tile.type as TileType);
  const meta = getTileMeta(tile.type as TileType);

  if (!LazyTileComponent || !meta) {
    return (
      <GenericTile
        tile={tile}
        meta={{
          title: 'tiles.unknownTile', // i18n key consumed downstream if needed
          icon: 'warning',
        }}
        {...(dragHandleProps !== undefined && { dragHandleProps })}
        {...(onRemove !== undefined && { onRemove })}
        data={null}
      >
        <div className="flex items-center justify-center h-full p-4 text-tertiary">
          <p>
            {'tiles.unknownTileType'}: {tile.type}
          </p>
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
          {...(dragHandleProps !== undefined && { dragHandleProps })}
          {...(onRemove !== undefined && { onRemove })}
          data={null}
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

export const Tile = memo(TileComponent, (prevProps, nextProps): boolean => {
  // Only re-render if tile object reference changed or other props changed
  return (
    prevProps.tile === nextProps.tile &&
    prevProps.onRemove === nextProps.onRemove &&
    prevProps.refreshKey === nextProps.refreshKey
  );
});
