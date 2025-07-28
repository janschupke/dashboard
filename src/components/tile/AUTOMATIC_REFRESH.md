# Automatic Data Refetch Implementation

This document describes the automatic data refetch system implemented at the tile level in the dashboard.

## Overview

The automatic refetch system provides tile-level control over data refresh intervals, allowing different tile types to have their own refresh schedules based on the nature of their data.

## Architecture

### 1. Enhanced `useTileData` Hook

The `useTileData` hook has been extended to support automatic refresh with the following features:

- **Configurable refresh intervals** per tile type
- **Window focus refresh** - refreshes data when the window regains focus
- **Smart interval management** - prevents overlapping requests
- **Graceful cleanup** - properly cleans up intervals on unmount

### 2. Tile-Specific Configuration

Each tile type can have its own refresh configuration:

```typescript
export interface TileRefreshConfig {
  refreshInterval?: number; // Refresh interval in milliseconds
  enableAutoRefresh?: boolean; // Whether to enable automatic refresh
  refreshOnFocus?: boolean; // Whether to refresh on window focus
}
```

### 3. Centralized Refresh Intervals

Refresh intervals are defined in `src/contexts/constants.ts`:

```typescript
export const REFRESH_INTERVALS = {
  TILE_DATA: 10 * 60 * 1000, // 10 minutes default
  TILES: {
    TIME: 60 * 1000, // 1 minute for time tiles
    WEATHER: 5 * 60 * 1000, // 5 minutes for weather
    CRYPTOCURRENCY: 2 * 60 * 1000, // 2 minutes for crypto
    // ... other tile types
  },
} as const;
```

## Implementation Pattern

### For New Tiles

1. **Import the utility function**:

```typescript
import { useTileData, getTileRefreshConfig } from '../../tile/useTileData';
```

2. **Add refresh configuration**:

```typescript
const refreshConfig = useMemo(() => getTileRefreshConfig(tile.type), [tile.type]);
const { data, status, lastUpdated } = useTileData(
  apiFunction,
  tile.id,
  params,
  isForceRefresh,
  refreshConfig, // Add this parameter
);
```

3. **Add tile type to constants** (if new):

```typescript
// In src/contexts/constants.ts
TILES: {
  YOUR_TILE_TYPE: 5 * 60 * 1000, // 5 minutes
}
```

4. **Map tile type in getTileRefreshConfig**:

```typescript
// In src/components/tile/useTileData.ts
const intervalMap: Record<string, number> = {
  [TileType.YOUR_TILE_TYPE]: tileRefreshIntervals.YOUR_TILE_TYPE,
  // ... existing mappings
};
```

### For Existing Tiles

Simply add the refresh configuration to existing `useTileData` calls:

```typescript
// Before
const { data, status, lastUpdated } = useTileData(getYourData, tile.id, params, isForceRefresh);

// After
const refreshConfig = useMemo(() => getTileRefreshConfig(tile.type), [tile.type]);
const { data, status, lastUpdated } = useTileData(
  getYourData,
  tile.id,
  params,
  isForceRefresh,
  refreshConfig,
);
```

## Features

### 1. Smart Interval Management

- Prevents overlapping requests by tracking last fetch time
- Only refreshes if enough time has passed since last fetch
- Properly cleans up intervals on component unmount

### 2. Window Focus Refresh

- Automatically refreshes data when the window regains focus
- Only refreshes if more than 30 seconds have passed since last fetch
- Can be disabled per tile if needed

### 3. Configurable Per Tile

- Each tile type can have its own refresh interval
- Can disable automatic refresh for specific tiles
- Can disable focus refresh for specific tiles

### 4. Backward Compatibility

- Existing tiles continue to work without changes
- Default refresh interval is 10 minutes (same as before)
- All existing functionality is preserved

## Refresh Intervals by Tile Type

| Tile Type          | Refresh Interval | Reason                             |
| ------------------ | ---------------- | ---------------------------------- |
| Time               | 1 minute         | Time data changes frequently       |
| Weather            | 5 minutes        | Weather updates regularly          |
| Cryptocurrency     | 2 minutes        | Crypto prices change rapidly       |
| Precious Metals    | 5 minutes        | Metal prices update periodically   |
| Earthquake         | 10 minutes       | Earthquake data is less frequent   |
| Federal Funds Rate | 1 hour           | Interest rates change slowly       |
| GDX ETF            | 2 minutes        | ETF prices change frequently       |
| Uranium            | 5 minutes        | Uranium prices update periodically |
| Weather Alerts     | 5 minutes        | Alerts can change quickly          |
| Euribor Rate       | 1 hour           | Interest rates change slowly       |

## Best Practices

### 1. Choose Appropriate Intervals

- **High-frequency data** (crypto, time): 1-2 minutes
- **Medium-frequency data** (weather, metals): 5 minutes
- **Low-frequency data** (interest rates): 1 hour
- **Static data**: Disable auto-refresh

### 2. Consider API Limits

- Respect API rate limits when setting intervals
- Use longer intervals for APIs with strict limits
- Consider implementing exponential backoff for failed requests

### 3. User Experience

- Don't refresh too frequently to avoid UI flicker
- Consider user's network conditions
- Provide visual feedback during refresh

### 4. Performance

- Intervals are cleaned up properly on unmount
- No memory leaks from abandoned intervals
- Efficient interval management prevents overlapping requests

## Testing

### Manual Testing

1. Add a tile to the dashboard
2. Wait for the configured refresh interval
3. Verify data updates automatically
4. Switch away from the window and back
5. Verify data refreshes on window focus

### Automated Testing

```typescript
// Test that refresh config is applied correctly
test('should use tile-specific refresh interval', () => {
  const config = getTileRefreshConfig(TileType.CRYPTOCURRENCY);
  expect(config.refreshInterval).toBe(REFRESH_INTERVALS.TILES.CRYPTOCURRENCY);
});

// Test that default is used for unknown tile types
test('should use default interval for unknown tile type', () => {
  const config = getTileRefreshConfig('UNKNOWN_TILE');
  expect(config.refreshInterval).toBe(REFRESH_INTERVALS.TILE_DATA);
});
```

## Troubleshooting

### Common Issues

1. **Data not refreshing**: Check if `enableAutoRefresh` is true
2. **Too frequent refreshes**: Increase the refresh interval
3. **Memory leaks**: Ensure intervals are cleaned up on unmount
4. **API rate limits**: Increase intervals for APIs with strict limits

### Debugging

- Check browser console for interval-related logs
- Verify refresh intervals in constants file
- Test with different tile types to isolate issues

## Future Enhancements

1. **User-configurable intervals**: Allow users to customize refresh intervals
2. **Smart refresh**: Refresh based on data staleness rather than fixed intervals
3. **Background refresh**: Refresh data in background tabs
4. **Network-aware refresh**: Adjust intervals based on network conditions
5. **Battery-aware refresh**: Reduce refresh frequency on mobile devices
