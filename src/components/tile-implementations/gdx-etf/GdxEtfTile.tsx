import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useGdxEtfApi } from './useGdxEtfApi';
import type { GdxEtfTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { useTileData } from '../../tile/useTileData';
import type { AlphaVantageParams } from '../../../services/apiEndpoints';
import { useMemo } from 'react';
import { getApiKeys } from '../../../services/apiConfig';

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number, percent: number) => {
    const sign = change >= 0 ? '+' : '';
    const changeFormatted = formatPrice(Math.abs(change));
    const percentFormatted = `${sign}${(percent || 0).toFixed(2)}%`;
    return { changeFormatted, percentFormatted };
  };

  // Ensure all required values are numbers
  const currentPrice = data.currentPrice || 0;
  const priceChange = data.priceChange || 0;
  const priceChangePercent = data.priceChangePercent || 0;
  const symbol = data.symbol || 'GDX';

  const { changeFormatted, percentFormatted } = formatChange(priceChange, priceChangePercent);
  const isPositive = priceChange >= 0;

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-2 p-2">
      <div className="text-2xl font-bold text-theme-primary">{formatPrice(currentPrice)}</div>
      <div className="text-sm text-theme-tertiary">{symbol}</div>
      <div className={`text-xs ${isPositive ? 'text-status-success' : 'text-status-error'}`}>
        {changeFormatted} ({percentFormatted})
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

  const { data, status, lastUpdated } = useTileData(getGdxEtf, tile.id, params, isForceRefresh);

  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      data={data}
      {...rest}
    >
      <GdxEtfTileContent data={data} />
    </GenericTile>
  );
};

GdxEtfTile.displayName = 'GdxEtfTile';
