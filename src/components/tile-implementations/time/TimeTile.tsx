import { useMemo } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useTileData } from '../../tile/useTileData';
import { useTimeApi } from './useTimeApi';
import { TimeTileContent } from './TimeTileContent';
import { CITY_CONFIG } from './config';
import { TileType } from '../../../types/tile';

export const TimeTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const { getTime } = useTimeApi();
  const cityConfig =
    CITY_CONFIG[tile.type as keyof typeof CITY_CONFIG] || CITY_CONFIG[TileType.TIME_TAIPEI];
  const params = useMemo(
    () => ({
      lat: cityConfig.lat,
      lng: cityConfig.lng,
      by: 'position' as const,
      format: 'json' as const,
    }),
    [cityConfig.lat, cityConfig.lng],
  );
  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getTime,
    tile.id,
    params,
  );
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      data={data}
      onManualRefresh={manualRefresh}
      isLoading={isLoading}
      {...rest}
    >
      <TimeTileContent data={data} city={cityConfig.city} />
    </GenericTile>
  );
};

TimeTile.displayName = 'TimeTile';
