import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useTyphoonApi } from './useTyphoonApi';
import type { TyphoonTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';
import { getApiKeys } from '../../../services/apiConfig';

const TyphoonTileContent = ({ data }: { data: TyphoonTileData | null }) => {
  if (data && data.typhoons.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">{data.typhoons.length}</div>
        <div className="text-sm text-theme-text-secondary">Active Typhoons</div>
      </div>
    );
  }
  return null;
};

export const TyphoonTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getTyphoonData } = useTyphoonApi();
  const apiKeys = getApiKeys();

  const params = useMemo(() => apiKeys.cwb || 'demo-key', [apiKeys.cwb]);

  const { data, status, lastUpdated } = useTileData(
    getTyphoonData,
    tile.id,
    params,
    isForceRefresh,
  );
  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      data={data}
      {...rest}
    >
      <TyphoonTileContent data={data} />
    </GenericTile>
  );
};

TyphoonTile.displayName = 'TyphoonTile';
