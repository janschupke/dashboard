import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useCryptoApi } from './useCryptoApi';
import type { CryptocurrencyTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';
import { DataRow } from '../../ui/DataRow';

const CryptocurrencyTileContent = ({ data }: { data: CryptocurrencyTileData | null }) => {
  if (data && data.coins.length > 0) {
    const coins = data.coins.slice(0, 5);

    return (
      <div className="flex flex-col h-full p-2">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1">
            {coins.map((coin, index) => (
              <DataRow
                key={coin.id}
                index={index + 1}
                name={coin.name}
                code={coin.symbol}
                price={coin.current_price}
                priceChange={coin.price_change_24h}
                priceChangePercent={coin.price_change_percentage_24h}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const CryptocurrencyTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getCryptocurrencyMarkets } = useCryptoApi();
  const params = useMemo(
    () => ({
      vs_currency: 'usd',
      per_page: 5,
      order: 'market_cap_desc',
    }),
    [],
  );
  const refreshConfig = useMemo(
    () => ({
      refreshInterval: 2 * 60 * 1000, // 2 minutes
      enableAutoRefresh: true,
      refreshOnFocus: true,
    }),
    [],
  );
  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getCryptocurrencyMarkets,
    tile.id,
    params,
    isForceRefresh,
    refreshConfig,
  );

  // TODO: fix the undefined update
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
      <CryptocurrencyTileContent data={data} />
    </GenericTile>
  );
};

CryptocurrencyTile.displayName = 'CryptocurrencyTile';
