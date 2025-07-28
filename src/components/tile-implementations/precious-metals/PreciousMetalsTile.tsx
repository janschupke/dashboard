import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { usePreciousMetalsApi } from './usePreciousMetalsApi';
import type { PreciousMetalsTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';
import { DataRow } from '../../ui/DataRow';

const PreciousMetalsTileContent = ({ data }: { data: PreciousMetalsTileData | null }) => {
  if (data) {
    return (
      <div className="flex flex-col h-full p-2">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1">
            <DataRow
              index={1}
              name="Gold"
              code="XAU"
              price={data.gold.price}
              priceChange={data.gold.change_24h}
              priceChangePercent={data.gold.change_percentage_24h}
            />
            <DataRow
              index={2}
              name="Silver"
              code="XAG"
              price={data.silver.price}
              priceChange={data.silver.change_24h}
              priceChangePercent={data.silver.change_percentage_24h}
            />
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const PreciousMetalsTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getPreciousMetals } = usePreciousMetalsApi();
  const params = useMemo(() => ({ symbol: 'XAU' as const }), []);
  const refreshConfig = useMemo(
    () => ({
      refreshInterval: 1 * 60 * 1000, // 1 minute
      enableAutoRefresh: true,
      refreshOnFocus: true,
    }),
    [],
  );
  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getPreciousMetals,
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
      <PreciousMetalsTileContent data={data} />
    </GenericTile>
  );
};

PreciousMetalsTile.displayName = 'PreciousMetalsTile';
