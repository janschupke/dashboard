import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useGdxEtfApi } from './useGdxEtfApi';
import type { GdxEtfTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import type { AlphaVantageParams } from '../../../services/apiEndpoints';
import { useMemo } from 'react';
import { getApiKeys } from '../../../services/apiConfig';
import { DataRow } from '../../ui/DataRow';

const GdxEtfTileContent = ({ data }: { data: GdxEtfTileData | null }) => {
  // Check if data is null or contains only default/empty values
  const hasValidData = data && data.currentPrice > 0 && data.symbol && data.symbol.length > 0;

  if (!hasValidData) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-sm text-theme-tertiary">No data available</div>
      </div>
    );
  }

  // Ensure all required values are numbers
  const currentPrice = data.currentPrice || 0;
  const priceChange = data.priceChange || 0;
  const priceChangePercent = data.priceChangePercent || 0;
  const symbol = data.symbol || 'GDX';
  const name = data.name || 'VanEck Gold Miners ETF';

  return (
    <div className="flex flex-col h-full p-2">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          <DataRow
            index={1}
            name={name}
            code={symbol}
            price={currentPrice}
            priceChange={priceChange}
            priceChangePercent={priceChangePercent}
            showBorder={false}
          />
        </div>
      </div>
    </div>
  );
};

export const GdxEtfTile = ({
  tile,
  meta,
  ...rest
}: {
  tile: DragboardTileData;
  meta: TileMeta;
}) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getGdxEtf } = useGdxEtfApi();
  const apiKeys = getApiKeys();

  const params = useMemo<AlphaVantageParams>(
    () => ({
      function: 'GLOBAL_QUOTE',
      symbol: 'GDX',
      ...(apiKeys.alphaVantage && { apikey: apiKeys.alphaVantage }),
    }),
    [apiKeys.alphaVantage],
  );

  const refreshConfig = useMemo(
    () => ({
      refreshInterval: 60 * 60 * 1000, // 1 hour
      enableAutoRefresh: true,
      refreshOnFocus: true,
    }),
    [],
  );
  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getGdxEtf,
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
      <GdxEtfTileContent data={data} />
    </GenericTile>
  );
};

GdxEtfTile.displayName = 'GdxEtfTile';
