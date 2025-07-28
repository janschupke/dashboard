# Tile Implementation Pattern

This document describes the unified tile implementation pattern that provides consistent data fetching and status handling across all tiles.

## Overview

The tile system uses a unified pattern with:

- **GenericTile**: Handles common tile functionality (error boundaries, header, close button, status bar)
- **useTileData**: Unified hook for data fetching that returns `FetchResult<T>`
- **Individual Tile Content**: Handle rendering based on status and data
- **API Hooks**: Return `FetchResult<T>` for consistent error handling

## Unified Pattern

### 1. GenericTile Component

The `GenericTile` component provides:

- Error boundary wrapping
- Tile header with icon and title
- Close button
- Status bar showing last update time and status icon
- Common styling and layout
- Drag handle functionality

```tsx
<GenericTile
  tile={tile}
  meta={meta}
  status={status}
  lastUpdate={lastUpdated?.toISOString()}
  onRemove={onRemove}
  dragHandleProps={dragHandleProps}
>
  {/* Tile-specific content goes here */}
</GenericTile>
```

### 2. useTileData Hook

The unified `useTileData` hook handles all data fetching:

```tsx
const { data, status, lastUpdated, error, isCached } = useTileData(
  apiFunction,
  tileId,
  params,
  refreshConfig,
);
```

Returns `FetchResult<T>` with:

- `data`: The fetched data or null
- `status`: 'loading' | 'success' | 'error' | 'stale'
- `lastUpdated`: Date when data was last updated
- `error`: Error message if any
- `isCached`: Whether data is from cache

### 3. Individual Tile Implementation Pattern

Each tile implementation should follow this pattern:

```tsx
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useYourApi } from './useYourApi';
import type { YourTileData } from './types';
import { useTileData } from '../../tile/useTileData';
import { useMemo } from 'react';
import { REFRESH_INTERVALS } from '../../../contexts/constants';

const YourTileContent = ({ data }: { data: YourTileData | null }) => {
  if (!data) return null;

  return <div className="flex flex-col h-full p-2">{/* Your tile content here */}</div>;
};

export const YourTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const { getYourData } = useYourApi();
  const params = useMemo(
    () => ({
      // Your API parameters
    }),
    [],
  );

  const refreshConfig = useMemo(
    () => ({
      refreshInterval: REFRESH_INTERVALS.TILES.YOUR_TILE,
      enableAutoRefresh: true,
      refreshOnFocus: true,
    }),
    [],
  );

  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getYourData,
    tile.id,
    params,
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
      <YourTileContent data={data} />
    </GenericTile>
  );
};
```

### 4. API Hook Pattern

Each API hook should follow this pattern:

```tsx
import { useDataServices } from '../../../contexts/DataServicesContext';
import { useCallback } from 'react';
import { YOUR_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { YourParams } from '../../../services/apiEndpoints';
import { TileType, TileApiCallTitle } from '../../../types/tile';
import type { YourTileData } from './types';
import type { TileConfig } from '../../../services/storageManager';
import { fetchWithError } from '../../../services/fetchWithError';

export function useYourApi() {
  const { dataFetcher } = useDataServices();
  const getYourData = useCallback(
    async (tileId: string, params: YourParams): Promise<TileConfig<YourTileData>> => {
      const url = buildApiUrl<YourParams>(YOUR_ENDPOINT, params);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetchWithError(url);
          const data = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.YOUR_TILE,
        { apiCall: TileApiCallTitle.YOUR_API },
        url,
      );
    },
    [dataFetcher],
  );
  return { getYourData };
}
```

## Key Benefits

1. **Consistent Error Handling**: All tiles use the same error handling pattern
2. **Automatic Refresh**: Tiles automatically refresh based on their configured intervals
3. **Loading States**: Consistent loading states across all tiles
4. **Manual Refresh**: Users can manually refresh tiles
5. **Status Indicators**: Visual status indicators show data freshness
6. **Type Safety**: Full TypeScript support with proper type inference

## Refresh Configuration

Tiles can configure their refresh behavior using the `refreshConfig` parameter:

```tsx
const refreshConfig = {
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  enableAutoRefresh: true,
  refreshOnFocus: true,
};
```

- `refreshInterval`: How often to refresh data (in milliseconds)
- `enableAutoRefresh`: Whether to enable automatic refresh
- `refreshOnFocus`: Whether to refresh when the window gains focus

## Status Handling

The tile system provides consistent status handling:

- **Loading**: Data is being fetched
- **Success**: Data was fetched successfully
- **Error**: An error occurred while fetching data
- **Stale**: Data is available but the last fetch failed

## Error Boundaries

Each tile is wrapped in an error boundary that catches and displays errors gracefully, preventing the entire dashboard from crashing due to a single tile error.
