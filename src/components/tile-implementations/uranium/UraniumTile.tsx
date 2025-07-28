import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useUraniumApi } from './useUraniumApi';
import type { UraniumTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';
import { REFRESH_INTERVALS } from '../../../contexts/constants';

const UraniumTileContent = ({ data }: { data: UraniumTileData | null }) => {
  if (data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">${data.spotPrice}</div>
        <div className="text-sm text-theme-text-secondary">Uranium Price</div>
      </div>
    );
  }
  return null;
};

export const UraniumTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getUraniumPrice } = useUraniumApi();
  const params = useMemo(() => ({ range: '1D' }), []);
  const refreshConfig = useMemo(
    () => ({
      refreshInterval: REFRESH_INTERVALS.TILES.URANIUM,
      enableAutoRefresh: true,
      refreshOnFocus: true,
    }),
    [],
  );
  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getUraniumPrice,
    tile.id,
    params,
    isForceRefresh,
    refreshConfig,
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
      <UraniumTileContent data={data} />
    </GenericTile>
  );
};

UraniumTile.displayName = 'UraniumTile';
