# Tile Data Flow Refactoring Plan

## Problem Statement

**Issue**: Error tiles don't update the "last request" timestamp on repeated failed requests.

**Root Cause**: When React Query encounters an error, it uses `placeholderData: (previousData) => previousData`, which keeps the previous successful result. However, `dataFetcher` updates storage with the new `lastDataRequest` timestamp before throwing. This creates a mismatch:

- Storage has the NEW `lastDataRequest` timestamp
- React Query's `result` has the OLD `lastDataRequest` timestamp
- `useTileData` reads from `result` first, so it shows the old timestamp

## Current Data Flow

### 1. Request Flow (Success Case)

```
useTileData.queryFn()
  → apiFn() (e.g., getWeather)
    → dataFetcher.fetchAndMap()
      → handleFetchAndTransform()
        → SUCCESS: Save to storage with new lastDataRequest
        → Return TileConfig with new lastDataRequest
  → React Query stores result
  → useTileData reads result.lastDataRequest ✅
```

### 2. Request Flow (Error Case - WITH cached data)

```
useTileData.queryFn()
  → apiFn()
    → dataFetcher.fetchAndMap()
      → handleFetchAndTransform()
        → ERROR: Save to storage with new lastDataRequest
        → Return TileConfig with new lastDataRequest (from cached data)
  → React Query stores result
  → useTileData reads result.lastDataRequest ✅
```

### 3. Request Flow (Error Case - NO cached data)

```
useTileData.queryFn()
  → apiFn()
    → dataFetcher.fetchAndMap()
      → handleFetchAndTransform()
        → ERROR: Save to storage with new lastDataRequest
        → Throw error (no cached data to return)
  → React Query catches error
  → React Query uses placeholderData: keeps OLD result
  → useTileData reads result.lastDataRequest ❌ (OLD timestamp)
  → Storage has NEW timestamp, but we're not reading it
```

## Code Analysis

### Key Files

1. **`src/services/dataFetcher.ts`** (lines 162-184)
   - Updates storage with new `lastDataRequest` on error
   - Returns TileConfig if cached data exists
   - Throws error if no cached data

2. **`src/components/tile/useTileData.ts`** (lines 119-120, 169-180)
   - Uses `placeholderData: (previousData) => previousData` - keeps old result on error
   - `lastRequestTimestamp` memo reads `result?.lastDataRequest` first
   - Falls back to storage only if `result` is null/undefined
   - But `result` is never null on error - it's the previous result

3. **`src/utils/statusCalculator.ts`** (lines 41-59)
   - Returns `lastUpdated: null` for error status when no cached data
   - This is correct for status calculation, but not for timestamp display

## Proposed Solution

### Option 1: Always Read from Storage (Recommended)

**Pros**: Single source of truth, always up-to-date
**Cons**: Requires storage access in render

**Changes**:

1. In `useTileData.ts`, always read `lastDataRequest` from storage, not from `result`
2. Use `result` only for data content, not for timestamps
3. Storage is the authoritative source for request timestamps

### Option 2: Return Error Result Instead of Throwing

**Pros**: React Query gets updated result
**Cons**: Changes error handling semantics, may break other code

**Changes**:

1. In `dataFetcher.ts`, return error TileConfig instead of throwing
2. Remove `placeholderData` from React Query config
3. Handle error state in statusCalculator

### Option 3: Hybrid - Check Storage When Error

**Pros**: Minimal changes, preserves current architecture
**Cons**: More complex logic, two sources of truth

**Changes**:

1. In `useTileData.ts`, when `error` exists, read from storage instead of `result`
2. Keep current flow for success cases

## Recommended Refactoring (Option 1)

### Step 1: Refactor `useTileData.ts`

**Current**:

```typescript
const lastRequestTimestamp = useMemo(() => {
  if (result?.lastDataRequest) {
    return DateTime.fromMillis(result.lastDataRequest).toJSDate();
  }
  // Fall back to cached data's lastDataRequest if result is null
  const cachedData = storageManager.getTileState<T>(tileId);
  if (cachedData?.lastDataRequest) {
    return DateTime.fromMillis(cachedData.lastDataRequest).toJSDate();
  }
  return lastUpdatedDateTime ? lastUpdatedDateTime.toJSDate() : null;
}, [result, tileId, lastUpdatedDateTime]);
```

**Proposed**:

```typescript
// Storage is the single source of truth for request timestamps
const lastRequestTimestamp = useMemo(() => {
  const cachedData = storageManager.getTileState<T>(tileId);
  if (cachedData?.lastDataRequest) {
    return DateTime.fromMillis(cachedData.lastDataRequest).toJSDate();
  }
  // Fallback to result if storage doesn't have it (shouldn't happen)
  if (result?.lastDataRequest) {
    return DateTime.fromMillis(result.lastDataRequest).toJSDate();
  }
  return null;
}, [tileId, result]); // Note: result is still in deps for fallback
```

### Step 2: Update React Query Config

**Current**:

```typescript
placeholderData: (previousData) => previousData,
```

**Consider**: Remove or modify this behavior. However, keeping it is fine if we read from storage.

### Step 3: Ensure Storage is Always Updated

**Verify**: `dataFetcher.ts` always updates storage before returning/throwing. ✅ Already correct.

### Step 4: Add Tests

1. Test that error tiles update `lastDataRequest` on repeated failures
2. Test that storage is always the source of truth
3. Test that successful requests still work correctly

## Implementation Steps

1. ✅ Analyze current code flow
2. ⬜ Refactor `lastRequestTimestamp` to read from storage first
3. ⬜ Update tests to verify error tile timestamp updates
4. ⬜ Test all tile statuses (Success, Error, Stale, Loading)
5. ⬜ Verify no regressions in existing functionality

## Testing Checklist

- [ ] Error tile with no cached data: shows updated timestamp on retry
- [ ] Error tile with cached data: shows updated timestamp on retry
- [ ] Success tile: shows correct timestamp
- [ ] Stale tile: shows correct timestamps (request + data)
- [ ] Loading tile: shows pending state
- [ ] Manual refresh: updates timestamps correctly
- [ ] Auto refresh: updates timestamps correctly

## Risk Assessment

**Low Risk**: Reading from storage is already done as fallback. We're just changing the priority.

**Potential Issues**:

1. Storage might not be initialized in some edge cases
2. Race conditions between storage updates and reads (unlikely with current architecture)
3. Performance: storage reads in render (minimal impact, already doing this)

## Alternative: More Aggressive Refactoring

If we want to completely eliminate the mismatch:

1. **Remove `placeholderData`** - Let React Query handle errors naturally
2. **Return error TileConfig** - Never throw from dataFetcher, always return a TileConfig
3. **Simplify statusCalculator** - Don't need to check cached data separately

This would require more changes but would eliminate the root cause entirely.
