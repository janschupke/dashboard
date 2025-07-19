import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useTimeApi } from './useTimeApi';
import type { TimeTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';
import { TileType } from '../../../types/tile';

const TimeTileContent = ({ data }: { data: TimeTileData | null }) => {
  if (data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">{data.currentTime}</div>
        <div className="text-sm text-theme-text-secondary">{data.date}</div>
      </div>
    );
  }
  return null;
};

// Map tile types to timezones
const getTimezoneForTileType = (tileType: string): string => {
  switch (tileType) {
    case TileType.TIME_HELSINKI:
      return 'Europe/Helsinki';
    case TileType.TIME_PRAGUE:
      return 'Europe/Prague';
    case TileType.TIME_TAIPEI:
      return 'Asia/Taipei';
    default:
      return 'Europe/Helsinki'; // fallback
  }
};

export const TimeTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getTime } = useTimeApi();
  const timezone = getTimezoneForTileType(tile.type);
  const params = useMemo(() => ({ city: timezone }), [timezone]);
  
  // Create a wrapper function that calls getTime with the correct tile type
  const getTimeWithTileType = useMemo(() => {
    return (tileId: string, params: { city: string }, forceRefresh = false) => {
      return getTime(tileId, params, tile.type as TileType, forceRefresh);
    };
  }, [getTime, tile.type]);
  
  const { data, status, lastUpdated } = useTileData(getTimeWithTileType, tile.id, params, isForceRefresh);
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      data={data}
      {...rest}
    >
      <TimeTileContent data={data} />
    </GenericTile>
  );
};

TimeTile.displayName = 'TimeTile';
