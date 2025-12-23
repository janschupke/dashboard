# State Management Implementation Plan

## Overview
This document outlines the implementation plan to fix state management issues in the dragboard tile system, **preventing excessive re-renders** while ensuring proper loading states, refresh behavior, and React Query best practices.

## Current Architecture Analysis

### State Management Flow
1. **DragboardProvider** (`DragboardProvider.tsx`): Manages tile order and drag state
   - Uses `useState` for tiles array
   - Normalizes orders to sequential indices (0, 1, 2, ...)
   - Updates tiles array on drag/drop and remove operations
   - **PROBLEM**: Context value includes entire `tiles` array and `dragState`, causing all consumers to re-render on any change

2. **Tile Rendering** (`Overlay.tsx`):
   - Renders tiles using `tiles.map()` with `tile.id` as key
   - Each tile wrapped in `DragboardTile` component
   - `Tile` component is memoized, but `DragboardTile` is NOT

3. **Data Fetching** (`useTileData.ts`):
   - Uses React Query (`useQuery`) for data fetching
   - Manages loading states, caching, and refresh intervals
   - Returns `isLoading`, `status`, `data`, and `manualRefresh`

4. **Refresh Service** (`TileRefreshService.ts`):
   - Manages global refresh callbacks
   - Currently not being used by individual tiles (missing registration)

### Current Problems

#### Problem 1: Dropping a tile causes ALL tiles to re-render unnecessarily
**Root Cause**:
- `DragboardProvider` context value includes entire `tiles` array
- When one tile's order changes, `normalizeOrders()` creates NEW objects for ALL tiles
- All `DragboardTile` components subscribe to context via `useDragboard()`
- Context value reference changes → all consumers re-render
- `DragboardTile` is NOT memoized, so it re-renders even if props haven't changed

**Impact**: Performance degradation, unnecessary React Query re-subscriptions, flickering UI

#### Problem 2: Changing position causes excessive re-renders
**Root Cause**:
- Same as Problem 1 - context updates propagate to all tiles
- `dragState` changes also cause all tiles to re-render
- `normalizeOrders` creates new tile objects even when order hasn't changed for most tiles

**Impact**: Poor performance during drag operations

#### Problem 3: Clicking refresh button does not trigger loading indicator for that tile
**Root Cause**:
- `manualRefresh()` calls `refetch()` from React Query
- `isLoading` calculation in `useTileData` doesn't account for manual refresh
- Logic: `showLoading = isPending || isLoading || (isFetching && (!result || !hasValidData))`
- When manually refreshing with existing data, `isFetching` is true but `hasValidData` is also true, so loading state is not shown

**Impact**: No visual feedback when manually refreshing a tile

#### Problem 4: Removing a tile causes ALL tiles to re-render and show loading unnecessarily
**Root Cause**:
- When a tile is removed, something is triggering query invalidation for ALL tiles
- All tiles re-render and show loading state
- This is EXCESSIVE and unnecessary - only the removed tile's query should be cleaned up
- All tiles re-render unnecessarily due to context update (from Problem 1)

**Impact**: Poor performance, unnecessary API calls, bad UX - tiles shouldn't all refresh when one is removed

#### Problem 5: Need configurable periodic UI re-renders for all tiles (only time tiles enabled now)
**Root Cause**:
- No mechanism for periodic UI-only updates (not data fetching) that can be configured per tile
- Time tiles need to update display every second without refetching data
- Other tiles might need this in the future
- Must be configurable and performant (minimal re-render scope)

**Impact**: Time tiles don't update in real-time. Need a reusable, configurable solution for all tile types

#### Problem 6: Automatic re-fetch when visible
**Current State**:
- React Query has `refetchOnMount: true` configured
- `refetchOnWindowFocus` is configurable per tile
- Should work, but needs verification

#### Problem 7: React Query best practices
**Current State**:
- Using React Query v5
- Has `staleTime`, `refetchInterval`, `gcTime` configured
- Needs review for optimal caching strategy
- **PROBLEM**: Excessive re-renders may cause unnecessary query re-subscriptions

## Implementation Plan

### Phase 1: Prevent Excessive Re-renders (Problems 1 & 2) - **CRITICAL**

#### 1.1 Optimize Context Value Updates
**File**: `src/components/dragboard/DragboardProvider.tsx`

**Problem**: Context value includes entire `tiles` array, causing all consumers to re-render on any change.

**Solution Options**:

**Option A: Split Context (Recommended)**
- Create separate contexts: `TilesContext` and `DragStateContext`
- Only tiles that need drag state subscribe to `DragStateContext`
- Reduces re-renders significantly

**Option B: Use Context Selectors (Better Performance)**
- Keep single context but use selector pattern
- Consumers only subscribe to specific parts of context
- Requires custom hook with `useContextSelector` pattern

**Option C: Memoize Context Value More Granularly**
- Split context value into separate memoized objects
- Only update what changed

**Recommended**: Option A - Split Context

**Implementation**:
```typescript
// Create separate contexts
const TilesContext = createContext<DragboardTileData[] | null>(null);
const DragStateContext = createContext<DragState | null>(null);
const DragboardActionsContext = createContext<DragboardActions | null>(null);

// Separate hooks
export const useTiles = () => {
  const tiles = useContext(TilesContext);
  if (!tiles) throw new Error('useTiles must be used within DragboardProvider');
  return tiles;
};

export const useDragState = () => {
  const dragState = useContext(DragStateContext);
  if (!dragState) throw new Error('useDragState must be used within DragboardProvider');
  return dragState;
};

// DragboardTile only subscribes to tiles and dragState for its specific tile
export const useTileById = (id: string) => {
  const tiles = useTiles();
  const dragState = useDragState();
  return useMemo(() => ({
    tile: tiles.find(t => t.id === id),
    isDragging: dragState.draggingTileId === id,
  }), [tiles, dragState.draggingTileId, id]);
};
```

#### 1.2 Optimize normalizeOrders to Preserve Object References
**File**: `src/components/dragboard/DragboardProvider.tsx`

**Problem**: `normalizeOrders` creates new objects for ALL tiles even when only one tile's order changed.

**Solution**: Only create new objects for tiles whose order actually changed.

**Implementation**:
```typescript
const normalizeOrders = useCallback((tilesArray: DragboardTileData[]): DragboardTileData[] => {
  return tilesArray.map((tile, index) => {
    // Only create new object if order changed
    if (tile.order === index) {
      return tile; // Preserve reference
    }
    return { ...tile, order: index };
  });
}, []);
```

**Benefits**:
- Tiles with unchanged order keep same object reference
- React.memo can properly prevent re-renders
- Significant performance improvement

#### 1.3 Memoize DragboardTile Component
**File**: `src/components/dragboard/DragboardTile.tsx`

**Problem**: `DragboardTile` is not memoized, so it re-renders on every parent re-render.

**Solution**: Wrap with `React.memo` and use selective context subscriptions.

**Implementation**:
```typescript
interface DragboardTileProps {
  id: string;
  children: React.ReactNode;
  viewportColumns: number;
}

const DragboardTileComponent: React.FC<DragboardTileProps> = ({
  id,
  children,
  viewportColumns,
}) => {
  // Use selective hook that only re-renders when THIS tile changes
  const { tile, isDragging } = useTileById(id);
  const { startTileDrag, endTileDrag, removeTile } = useDragboardActions();

  if (!tile) return null;

  const row = Math.floor(tile.order / viewportColumns);
  const col = tile.order % viewportColumns;

  // ... rest of component
};

export const DragboardTile = React.memo(DragboardTileComponent, (prevProps, nextProps) => {
  // Custom comparison: only re-render if id or viewportColumns changed
  return prevProps.id === nextProps.id &&
         prevProps.viewportColumns === nextProps.viewportColumns;
});
```

#### 1.4 Memoize Tile Component Props
**File**: `src/components/tile/Tile.tsx`

**Problem**: `Tile` is memoized but props might change reference unnecessarily.

**Solution**: Ensure props are stable and add proper comparison function.

**Implementation**:
```typescript
export const Tile = memo(TileComponent, (prevProps, nextProps) => {
  // Only re-render if tile object reference changed or other props changed
  return prevProps.tile === nextProps.tile &&
         prevProps.onRemove === nextProps.onRemove &&
         prevProps.refreshKey === nextProps.refreshKey;
});
```

**Note**: This requires ensuring `tile` object reference is stable (see 1.2).

### Phase 2: Fix Loading States (Problems 3 & 4)

#### 2.1 Fix Manual Refresh Loading Indicator
**File**: `src/components/tile/useTileData.ts`

**Problem**: Loading indicator doesn't show when manually refreshing a tile with existing data.

**Solution**: Always show loading when `isFetching` is true, regardless of data availability.

**Implementation**:
```typescript
// Update showLoading calculation - simpler approach
const showLoading = isPending || isLoading || isFetching;
```

**Rationale**:
- `isFetching` is true during any fetch operation (including manual refresh)
- Users expect visual feedback when clicking refresh
- Previous data can still be displayed via `placeholderData` option

**Alternative (More Granular)**: Track manual refresh separately if needed:
```typescript
const [isManualRefreshing, setIsManualRefreshing] = useState(false);

const manualRefresh = useCallback(() => {
  setIsManualRefreshing(true);
  refetch().finally(() => setIsManualRefreshing(false));
}, [refetch]);

const showLoading = isPending || isLoading || isFetching || isManualRefreshing;
```

**Recommended**: Use simpler approach - `isFetching` already covers this case.

#### 2.2 Prevent Unnecessary Re-renders and Loading States on Tile Removal
**File**: `src/components/dragboard/DragboardProvider.tsx` and `src/components/overlay/Overlay.tsx`

**Problem**: Removing a tile causes ALL tiles to re-render and show loading state unnecessarily.

**Root Causes**:
1. Context update causes all tiles to re-render (see Phase 1)
2. Something is invalidating all queries when a tile is removed
3. `TilePersistenceListener` might be triggering updates

**Solution**:
- Only remove the specific tile's query from cache
- Do NOT invalidate all queries
- Ensure context updates don't propagate unnecessarily (Phase 1 fixes this)

**Implementation**:
```typescript
import { useQueryClient } from '@tanstack/react-query';

export const DragboardProvider: React.FC<DragboardProviderProps> = ({
  initialTiles = [],
  children,
}) => {
  const queryClient = useQueryClient();

  const removeTile = useCallback((id: string) => {
    setTiles((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      return normalizeOrders(filtered);
    });

    // ONLY remove the specific tile's query - do NOT invalidate all queries
    queryClient.removeQueries({
      queryKey: ['tile-data', id]
    });

    // Optionally: clean up localStorage for removed tile
    // storageManager.removeTileState(id);
  }, [normalizeOrders, queryClient]);

  // ... rest of component
};
```

**Also check**: `TilePersistenceListener` in `Overlay.tsx` - ensure it's not causing unnecessary updates.

**Benefits**:
- Only the removed tile's data is cleaned up
- Other tiles continue working normally
- No unnecessary re-renders or loading states
- Better performance and UX

### Phase 3: Configurable Periodic UI Re-renders (Problem 5)

#### 3.1 Create Reusable Hook for Periodic UI Updates
**File**: `src/hooks/usePeriodicUpdate.ts` (new file)

**Purpose**: Create a configurable hook that triggers re-renders at specified intervals for UI-only updates (not data fetching).

**Implementation**:
```typescript
import { useState, useEffect, useRef } from 'react';

export interface UsePeriodicUpdateOptions {
  /** Update interval in milliseconds. If 0 or undefined, updates are disabled */
  interval?: number;
  /** Whether updates are enabled. Defaults to true if interval is set */
  enabled?: boolean;
}

/**
 * Hook that triggers re-renders at specified intervals for UI-only updates.
 * Does NOT trigger data fetching - only causes component re-render.
 *
 * @param options Configuration for periodic updates
 * @returns Current update counter (increments on each interval)
 */
export function usePeriodicUpdate(options: UsePeriodicUpdateOptions = {}): number {
  const { interval, enabled = interval !== undefined && interval > 0 } = options;
  const [updateCount, setUpdateCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !interval || interval <= 0) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setUpdateCount((prev) => prev + 1);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval]);

  return updateCount;
}
```

#### 3.2 Integrate Periodic Updates into Tile System
**File**: `src/components/tile/GenericTile.tsx` or create `src/components/tile/useTilePeriodicUpdate.ts`

**Option A: Add to GenericTile** (if all tiles might need it)
**Option B: Create separate hook** (if only specific tiles need it)

**Recommended**: Option B - Create separate hook that tiles can opt into

**Implementation**:
```typescript
// src/components/tile/useTilePeriodicUpdate.ts
import { usePeriodicUpdate, UsePeriodicUpdateOptions } from '../../hooks/usePeriodicUpdate';

export interface TilePeriodicUpdateConfig extends UsePeriodicUpdateOptions {
  // Can extend with tile-specific options if needed
}

/**
 * Hook for tiles that need periodic UI updates.
 * Returns update counter that can be used to trigger re-renders.
 */
export function useTilePeriodicUpdate(config?: TilePeriodicUpdateConfig): number {
  return usePeriodicUpdate(config);
}
```

#### 3.3 Implement in Time Tile
**File**: `src/components/tile-implementations/time/TimeTile.tsx`

**Changes**:
- Use `useTilePeriodicUpdate` with 1 second interval
- Use update counter to trigger time recalculation
- Keep API refresh separate (5-10 minutes for timezone/offset)

**Implementation**:
```typescript
import { useTilePeriodicUpdate } from '../../tile/useTilePeriodicUpdate';

export const TimeTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const { getTime } = useTimeApi();
  const cityConfig = CITY_CONFIG[tile.type as keyof typeof CITY_CONFIG] || CITY_CONFIG[TileType.TIME_TAIPEI];

  // Periodic UI update every second (does NOT fetch data)
  const updateCount = useTilePeriodicUpdate({
    interval: 1000, // 1 second
    enabled: true,
  });

  const params = useMemo(
    () => ({
      lat: cityConfig.lat,
      lng: cityConfig.lng,
      by: 'position' as const,
      format: 'json' as const,
    }),
    [cityConfig.lat, cityConfig.lng],
  );

  // API refresh every 5 minutes (for timezone/offset updates)
  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getTime,
    tile.id,
    {},
    params,
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      enableAutoRefresh: true,
    }
  );

  // Recalculate time display on each update (using updateCount as dependency)
  const currentTimeData = useMemo(() => {
    if (!data) return null;

    // Calculate current time in tile's timezone using current moment
    const now = DateTime.now().setZone(data.timezone);

    return {
      ...data,
      currentTime: now.toFormat('HH:mm:ss'),
      date: now.toISODate() ?? '',
      isBusinessHours: calculateBusinessHours(now),
      businessStatus: getBusinessStatus(now),
    };
  }, [data, updateCount]); // updateCount triggers recalculation every second

  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={formatDateToISO(lastUpdated)}
      data={currentTimeData}
      onManualRefresh={manualRefresh}
      isLoading={isLoading}
      {...rest}
    >
      <TimeTileContent data={currentTimeData} city={cityConfig.city} />
    </GenericTile>
  );
};
```

**Benefits**:
- Reusable for any tile type
- Only time tiles enabled now, but others can opt in later
- Minimal re-render scope (only TimeTileContent recalculates)
- API refresh separate from UI updates
- Performant (only updates what's needed)

### Phase 4: Ensure Automatic Re-fetch When Visible (Problem 6)

#### 4.1 Verify React Query Configuration
**File**: `src/components/tile/useTileData.ts`

**Current Configuration Review**:
- `refetchOnMount: true` ✓ (already set)
- `refetchOnWindowFocus: refreshOnFocus && enableAutoRefresh` ✓ (configurable)
- `refetchInterval: enableAutoRefresh && refreshInterval > 0 ? refreshInterval : false` ✓ (already set)

**Action**: Verify this works correctly - should already be in place

#### 4.2 Add Intersection Observer for Visibility
**Optional Enhancement**: Add intersection observer to pause/resume queries when tiles are not visible

**File**: `src/components/tile/useTileData.ts` (optional)

**Implementation** (if needed):
```typescript
// Use React Query's built-in visibility handling
// Or add custom hook with Intersection Observer
```

**Status**: React Query handles this with `refetchOnMount` - verify if additional optimization needed

### Phase 5: React Query Best Practices (Problem 7)

#### 5.1 Review and Optimize Caching Strategy
**File**: `src/components/tile/useTileData.ts` and `src/contexts/QueryClientProvider.tsx`

**Current Configuration**:
- `staleTime: enableAutoRefresh ? refreshInterval : Infinity` ✓
- `gcTime: 5 * 60 * 1000` (in QueryClientProvider) ✓
- `refetchInterval: enableAutoRefresh && refreshInterval > 0 ? refreshInterval : false` ✓

**Recommended Improvements**:

1. **Optimize `staleTime`**:
   - Current: `refreshInterval` (e.g., 10 minutes)
   - Consider: `refreshInterval * 0.8` to allow some buffer
   - Or: Keep as is - data is fresh for the refresh interval

2. **Optimize `gcTime`**:
   - Current: 5 minutes
   - Consider: Increase to 10-15 minutes for better UX
   - Tiles that are removed and re-added should use cached data

3. **Add `refetchOnReconnect`**:
   - Already set in QueryClientProvider ✓

4. **Ensure `placeholderData`**:
   - Current: `(previousData) => previousData` ✓
   - Good for keeping previous data during refetch

**Action Items**:
- Review `gcTime` - consider increasing to 10-15 minutes
- Verify `staleTime` calculation is optimal
- Add comments explaining caching strategy

#### 5.2 Ensure Proper Query Key Stability
**File**: `src/components/tile/useTileData.ts`

**Current**: Query keys are stable based on `tileId`, `pathParams`, `queryParams` ✓

**Action**: Verify query keys don't change unnecessarily

#### 5.3 Add Query Invalidation on Tile Removal
**Already covered in Phase 2.2** ✓

### Phase 6: Tile Refresh Service Integration

#### 6.1 Register Tiles with Refresh Service
**File**: `src/components/tile/useTileData.ts`

**Changes**:
- Register `manualRefresh` callback with `TileRefreshService`
- Clean up on unmount

**Implementation**:
```typescript
// In useTileData.ts
import { TileRefreshService } from '../../services/tileRefreshService';

// Get refresh service instance (needs to be passed from context or created)
// Option 1: Pass from context
// Option 2: Create singleton instance
// Option 3: Pass as prop (not ideal)

// Register callback
useEffect(() => {
  const refreshService = getRefreshService(); // Need to implement this
  const unregister = refreshService.registerRefreshCallback(async () => {
    await refetch();
  });

  return unregister;
}, [refetch]);
```

**Challenge**: Need to pass `TileRefreshService` instance to tiles

**Solution Options**:
1. Create React Context for `TileRefreshService`
2. Create singleton instance
3. Pass service through props (not ideal)

**Recommended**: Create React Context

**File**: `src/contexts/TileRefreshContext.tsx` (new file)

**Implementation**:
```typescript
import React, { createContext, useContext } from 'react';
import { TileRefreshService } from '../services/tileRefreshService';

const TileRefreshContext = createContext<TileRefreshService | null>(null);

export const useTileRefreshService = () => {
  const service = useContext(TileRefreshContext);
  if (!service) {
    throw new Error('useTileRefreshService must be used within TileRefreshProvider');
  }
  return service;
};

export const TileRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const serviceRef = React.useRef(new TileRefreshService());

  return (
    <TileRefreshContext.Provider value={serviceRef.current}>
      {children}
    </TileRefreshContext.Provider>
  );
};
```

**Update**: `src/components/overlay/Overlay.tsx` to use context instead of ref

#### 6.2 Update Overlay to Use Context
**File**: `src/components/overlay/Overlay.tsx`

**Changes**:
- Wrap with `TileRefreshProvider`
- Use `useTileRefreshService` hook instead of ref

## Implementation Order

1. **Phase 1**: Fix re-rendering (Problems 1 & 2) - **HIGH PRIORITY**
2. **Phase 2**: Fix loading states (Problems 3 & 4) - **HIGH PRIORITY**
3. **Phase 3**: Time tile real-time updates (Problem 5) - **MEDIUM PRIORITY**
4. **Phase 4**: Verify automatic re-fetch (Problem 6) - **LOW PRIORITY** (should already work)
5. **Phase 5**: React Query best practices (Problem 7) - **MEDIUM PRIORITY**
6. **Phase 6**: Tile refresh service integration - **MEDIUM PRIORITY**

## Testing Checklist

### Phase 1 Testing
- [ ] Drag and drop a tile - verify all tiles re-render and positions update
- [ ] Move tile to different position - verify grid layout updates
- [ ] Add tile from sidebar - verify new tile appears in correct position
- [ ] Verify no performance issues with frequent re-renders

### Phase 2 Testing
- [ ] Click refresh button on a tile - verify loading indicator appears
- [ ] Remove a tile - verify remaining tiles do NOT show loading state or re-render unnecessarily
- [ ] Verify only the removed tile's query is cleaned up
- [ ] Verify loading states clear after data is fetched
- [ ] Test with network errors - verify error states work correctly

### Phase 3 Testing
- [ ] Verify time tile UI updates every second (without API calls)
- [ ] Verify time tile API still refreshes at configured interval (5 minutes)
- [ ] Test with multiple time tiles - verify all update independently
- [ ] Verify business hours status updates correctly every second
- [ ] Test that other tiles can opt into periodic updates if needed
- [ ] Verify periodic updates don't cause excessive re-renders (use React DevTools Profiler)

### Phase 4 Testing
- [ ] Verify tiles refetch when component mounts
- [ ] Verify tiles refetch when window regains focus (if enabled)
- [ ] Test with tiles off-screen - verify they refetch when scrolled into view

### Phase 5 Testing
- [ ] Verify cached data is used when appropriate
- [ ] Test tile removal and re-addition - verify cached data is used
- [ ] Verify stale data is refetched correctly
- [ ] Test with slow network - verify placeholder data is shown

### Phase 6 Testing
- [ ] Click global refresh button - verify all tiles refresh
- [ ] Verify tiles register/unregister correctly
- [ ] Test with tile removal during refresh - verify no errors

## Files to Modify

### High Priority
1. `src/components/overlay/Overlay.tsx` - Fix tile keys for re-rendering
2. `src/components/tile/useTileData.ts` - Fix loading states
3. `src/components/dragboard/DragboardProvider.tsx` - Add query invalidation on remove
4. `src/components/tile-implementations/time/TimeTile.tsx` - Add real-time updates

### Medium Priority
5. `src/contexts/TileRefreshContext.tsx` - New file for refresh service context
6. `src/components/tile/useTileData.ts` - Register with refresh service
7. `src/contexts/QueryClientProvider.tsx` - Optimize caching settings

### Low Priority
8. `src/components/tile-implementations/time/useRealtimeTime.ts` - New hook (optional)
9. Documentation updates

## Risk Assessment

### Low Risk
- Phase 1: Changing keys is low risk, well-tested pattern
- Phase 2: Loading state fixes are straightforward
- Phase 3: Time tile updates are isolated

### Medium Risk
- Phase 5: Caching changes could affect performance (test thoroughly)
- Phase 6: Context changes affect multiple components

### Mitigation
- Test each phase independently
- Use feature flags if needed
- Roll back plan for each phase
- Monitor performance after changes

## Success Criteria

1. ✅ Dropping a tile does NOT cause unnecessary re-renders of other tiles
2. ✅ Changing tile position only re-renders affected tiles
3. ✅ Clicking refresh button shows loading indicator for that specific tile
4. ✅ Removing a tile does NOT cause other tiles to re-render or show loading state
5. ✅ Time tile UI updates every second (configurable, reusable mechanism)
6. ✅ Tiles automatically refetch when visible (verify existing behavior)
7. ✅ React Query caching follows best practices
8. ✅ Global refresh button works correctly
9. ✅ Periodic update mechanism is reusable for any tile type (only time tiles enabled now)

## Notes

- Consider using React DevTools Profiler to verify re-renders
- Monitor React Query DevTools for query behavior
- Consider adding performance metrics for tile operations
- Document caching strategy for future reference

