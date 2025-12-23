# Dragboard Implementation Plan - From Scratch

## Overview

This document outlines a complete, working implementation of the Dragboard component system from scratch. The previous implementation had critical bugs with column width calculation and responsive behavior. This plan provides a clean, correct implementation.

## LocalStorage Format and Alignment

### Storage Format

The dragboard stores tile layout in localStorage using `StorageManager.DashboardState`:

```typescript
interface DashboardState {
  tiles: Array<{
    id: string;
    type: string;
    order: number; // Order in the list (0, 1, 2, ...) - determines grid placement
    createdAt: number;
    config?: Record<string, unknown>;
  }>;
}
```

**Why Order Instead of Positions?**

- Spec says "they always re-arrange so that no empty gaps remain"
- If we always consolidate to fill gaps, explicit positions are unnecessary
- Order-based placement is simpler: tiles placed sequentially, wrap automatically
- Drag and drop changes order, not coordinates
- No wrapping logic needed - CSS Grid handles it naturally

### Key Design Decisions

1. **Order-Based Placement, Not Positions**:
   - Tiles are stored as an ordered list (by `createdAt` or explicit `order` field)
   - No `position` field needed - tiles are placed sequentially in grid
   - Grid places tiles left-to-right, top-to-bottom based on order
   - Wrapping happens automatically based on viewport columns
   - **Simpler**: No position calculations, no wrapping logic, no coordinate system
   - **Drag and drop**: Changes tile order, not position

2. **All Tiles Are 1×1**:
   - All tiles are 1 column × 1 row (colSpan=1, rowSpan=1)
   - No size field in storage or types
   - No size variations anywhere

3. **No Hacks Required**:
   - Storage format matches exactly what dragboard needs
   - Order is stored as-is, no transformation
   - Viewport columns calculated at render time
   - Grid placement is automatic based on order

4. **Persistence Flow**:

   ```
   User Action → Provider updates tiles → TilePersistenceListener watches → Saves to localStorage
   ```

   - Provider does NOT access localStorage directly
   - `TilePersistenceListener` (in Overlay) handles persistence
   - This keeps dragboard decoupled from storage implementation

## Core Requirements

### Functional Requirements

1. **Encapsulated, reusable component** - No implementation leaks to rest of app
2. **Tile rearrangement** - Tiles can be moved by drag-and-drop
3. **Add tiles from sidebar** - By clicking or dragging sidebar items
4. **Remove tiles** - Click X button to remove
5. **Auto-consolidation** - Tiles always rearrange to fill gaps (no empty spaces)
6. **Equal row heights** - All tiles in same row stretch to match tallest tile
7. **Responsive columns** - Column count adapts to viewport width
8. **Tile stretching** - Tiles stretch to fill container width
9. **Minimum dimensions** - Tiles are at least 250px wide, 200px high

### Technical Requirements

1. **No hardcoded values** - Use constants and enums
2. **Tailwind CSS** - Use Tailwind for styling
3. **CSS Grid** - Use CSS Grid for layout
4. **Separation of concerns** - Logic separate from presentation
5. **Small components** - Keep components focused and small
6. **Unit tests** - Write tests for all logic

## Architecture

### Component Structure

```
src/components/dragboard/
├── constants.ts              # All constants (min width, height, gap, etc.)
├── types.ts                  # TypeScript types and interfaces
├── DragboardProvider.tsx     # State management, context, and all logic
├── DragboardGrid.tsx         # Grid container component
└── DragboardTile.tsx         # Individual tile wrapper
```

**Why no separate services?**

- Order management is trivial (array index = order)
- Drag/drop is simple array reordering
- No collision detection needed (order-based = no collisions)
- No consolidation needed (order-based = no gaps)
- Keep it simple - inline logic in Provider

### Data Flow

```
User Action
    ↓
Component (UI Layer)
    ↓
Provider (State + Logic Layer)
    ↓
Provider updates state
    ↓
Component re-renders
```

## Implementation Steps

### Step 1: Define Constants and Types

**File**: `src/components/dragboard/constants.ts`

```typescript
export const DRAGBOARD_CONSTANTS = {
  MIN_TILE_WIDTH: 250, // pixels
  MIN_TILE_HEIGHT: 200, // pixels
  GRID_GAP: 16, // pixels (1rem)
  TILE_COL_SPAN: 1, // All tiles span 1 column
  TILE_ROW_SPAN: 1, // All tiles span 1 row
} as const;
```

**File**: `src/components/dragboard/types.ts`

```typescript
/**
 * Tile data structure - matches what's stored in localStorage
 * All tiles are the same size (1 column, 1 row)
 * Placement is order-based, not position-based
 */
export interface DragboardTileData {
  id: string;
  type: string; // TileType from app
  order: number; // Order in list (0, 1, 2, ...) - determines grid placement
  createdAt?: number;
  config?: Record<string, unknown>;
}

/**
 * Dragboard configuration
 * Simplified - no config needed, all behavior is automatic
 */
export interface DragboardConfig {
  // Empty - no config needed for order-based placement
}

/**
 * Dashboard state as stored in localStorage
 * This matches the StorageManager.DashboardState interface
 */
export interface DashboardState {
  tiles: Array<{
    id: string;
    type: string;
    order: number;
    createdAt: number;
    config?: Record<string, unknown>;
  }>;
}
```

**Action Items**:

- [ ] Create `constants.ts` with all constants (including TILE_COL_SPAN=1, TILE_ROW_SPAN=1)
- [ ] Create `types.ts` with all TypeScript interfaces
- [ ] Add `DashboardState` interface matching localStorage format (no size field)
- [ ] Export types for use in rest of app
- [ ] No hardcoded values anywhere

---

### Step 2: Create Provider (Context + State + Logic)

**File**: `src/components/dragboard/DragboardProvider.tsx`

**Purpose**: Single file with context, state, and all logic. No separate context file needed.

**State**:

- `tiles: DragboardTileData[]` - All tiles (from localStorage initially)
- `dragState: { draggingTileId: string | null, dropIndex: number | null, sidebarTileType?: string }` - Drag state

**Context Interface**:

```typescript
interface DragboardContextValue {
  tiles: DragboardTileData[];
  addTile: (tile: Omit<DragboardTileData, 'order'>) => void;
  removeTile: (id: string) => void;
  startTileDrag: (tileId: string) => void;
  endTileDrag: (dropIndex: number | null) => void;
  startSidebarDrag: (tileType: string) => void;
  endSidebarDrag: (dropIndex: number | null, tileType: string) => void;
  dragState: {
    draggingTileId: string | null;
    dropIndex: number | null;
    sidebarTileType?: string; // For sidebar drags
  };
}
```

**Initialization**:

- Accept `initialTiles` prop (from localStorage via Overlay)
- Normalize: ensure tiles have `order` matching array index (0, 1, 2, ...)
- Ensure `createdAt` exists

**Functions** (all inline, no services):

1. **`addTile(tile)`**
   - Assign `order = tiles.length` (next index)
   - Add to tiles array
   - **Note**: Persisted by TilePersistenceListener

2. **`removeTile(id)`**
   - Remove tile from array
   - Reassign orders to match indices (0, 1, 2, ...)
   - **Note**: Persisted by TilePersistenceListener

3. **`startTileDrag(tileId)`**
   - Set `dragState.draggingTileId = tileId`

4. **`endTileDrag(dropIndex)`**
   - If `dropIndex === null`: cancel drag
   - Otherwise: reorder array (move tile to dropIndex)
   - Reassign orders to match indices
   - Clear drag state

5. **`startSidebarDrag(tileType)`**
   - Set `dragState.draggingTileId = null`, `dragState.sidebarTileType = tileType`

6. **`endSidebarDrag(dropIndex, tileType)`**
   - If `dropIndex === null`: add to end
   - Otherwise: insert at dropIndex
   - Assign order = dropIndex, shift others
   - Reassign orders to match indices
   - Clear drag state

**LocalStorage Integration**:

- Provider does NOT directly interact with localStorage
- Overlay component has `TilePersistenceListener` that watches `tiles` from context
- When tiles change, listener calls `storage.setDashboardState({ tiles })`
- This ensures dragboard is decoupled from storage implementation

**Key Simplifications**:

- **Order = Array Index**: No separate order field needed. Sort tiles by order, then index = order.
- **No viewportColumns in context**: Grid calculates it, passes directly to tiles via props
- **No rows state**: Calculate from `Math.ceil(tiles.length / viewportColumns)` when needed
- **No services**: All logic inline in Provider

**Action Items**:

- [ ] Single file with context + state + logic
- [ ] Normalize tiles on load: sort by order, reassign 0,1,2...
- [ ] Inline drag/drop logic (simple array reordering)
- [ ] No localStorage access (TilePersistenceListener handles it)

---

### Step 3: Create DragboardGrid Component

**File**: `src/components/dragboard/DragboardGrid.tsx`

**Purpose**: Grid container that handles layout and drop zones.

**Key Implementation Details**:

1. **Column Calculation (CRITICAL - THIS WAS BROKEN)**:

   ```typescript
   // Calculate viewport columns correctly
   const calculateViewportColumns = (containerWidth: number): number => {
     const padding = 32; // p-4 = 16px each side
     const availableWidth = containerWidth - padding;
     // Formula: availableWidth = n * minWidth + (n-1) * gap
     // Solving: n = (availableWidth + gap) / (minWidth + gap)
     const columns = Math.floor(
       (availableWidth + DRAGBOARD_CONSTANTS.GRID_GAP) /
         (DRAGBOARD_CONSTANTS.MIN_TILE_WIDTH + DRAGBOARD_CONSTANTS.GRID_GAP),
     );
     return Math.max(1, columns);
   };
   ```

2. **Grid Template (CRITICAL - FIX COLUMN WIDTH ISSUE)**:

   ```tsx
   <div
     className="relative w-full h-full p-4 grid gap-4 content-start overflow-hidden"
     style={{
       gridTemplateColumns: `repeat(${viewportColumns}, minmax(${DRAGBOARD_CONSTANTS.MIN_TILE_WIDTH}px, 1fr))`,
       gridAutoRows: `minmax(${DRAGBOARD_CONSTANTS.MIN_TILE_HEIGHT}px, auto)`,
       alignItems: 'stretch',
     }}
   >
   ```

3. **Responsive Calculation**:
   - Use `ResizeObserver` to watch container width
   - Calculate `viewportColumns` in local state
   - Pass `viewportColumns` to tiles via props (not context)

4. **Drop Zones**:
   - Show only when dragging
   - Calculate drop index from mouse position
   - Convert mouse position to grid cell index

**Action Items**:

- [ ] Calculate columns with ResizeObserver
- [ ] Pass `viewportColumns` to tiles as prop
- [ ] Implement drop zones
- [ ] Handle drag events

---

### Step 4: Create DragboardTile Component

**File**: `src/components/dragboard/DragboardTile.tsx`

**Purpose**: Individual tile wrapper that handles grid placement based on order.

**Key Implementation Details**:

1. **Order-Based Placement (SIMPLE)**:

   ```typescript
   // Get viewport columns from props (not context)
   const { viewportColumns } = props; // From Grid component
   const { order } = tile; // From props

   // Calculate grid position from order
   const row = Math.floor(order / viewportColumns);
   const col = order % viewportColumns;
   ```

2. **Grid Positioning**:

   ```tsx
   <div
     className="relative flex flex-col w-full h-full"
     style={{
       minWidth: `${DRAGBOARD_CONSTANTS.MIN_TILE_WIDTH}px`,
       minHeight: `${DRAGBOARD_CONSTANTS.MIN_TILE_HEIGHT}px`,
       gridColumn: `${col + 1} / span 1`, // Always span 1
       gridRow: `${row + 1} / span 1`,     // Always span 1
     }}
   >
   ```

3. **Drag Handlers**:
   - `onDragStart`: Set drag data and call `startTileDrag`
   - `onDragEnd`: Call `endTileDrag` with new order index

**Action Items**:

- [ ] Implement order-to-position calculation
- [ ] Handle drag events (pass order index, not position)
- [ ] Apply correct grid positioning
- [ ] Ensure tiles stretch vertically (h-full)
- [ ] Write tests

---

**Why Removed**:

- Step 9 (Column Width): Already covered in Step 3 (Grid component)
- Step 10 (Vertical Stretching): Just CSS, not a separate step
- Step 11 (LocalStorage): Already covered in Step 2 (Provider)

**Action Items**:

- [ ] Column width handled in Grid component
- [ ] Vertical stretching is CSS (`alignItems: 'stretch'`, `h-full`)
- [ ] LocalStorage handled by TilePersistenceListener (already documented)

---

### Step 5: Integration and Testing

**Action Items**:

- [ ] Integrate with Overlay component
- [ ] Test loading tiles from localStorage
- [ ] Test saving tiles to localStorage
- [ ] Test adding tiles from sidebar
- [ ] Test removing tiles
- [ ] Test drag and drop
- [ ] Test responsive behavior (resize window)
- [ ] Test with 1 tile, 3 tiles, many tiles
- [ ] Test with sidebar open/closed
- [ ] Test vertical stretching
- [ ] Test column width equality
- [ ] Write integration tests
- [ ] Write unit tests for all components

---

## Critical Implementation Details

### Column Width Calculation (THE FIX)

**WRONG (Previous Implementation)**:

```typescript
// ❌ This creates too many columns
const finalColumns = Math.max(viewportColumns, maxColumnNeeded, config.columns);
```

**RIGHT (New Implementation)**:

```typescript
// ✅ Only use viewport columns
const viewportColumns = calculateViewportColumns(containerWidth);
// Grid has exactly viewportColumns columns
// Tiles placed by order: row = floor(order / columns), col = order % columns
// CSS Grid automatically wraps - no manual wrapping logic needed!
```

### Grid Template

**CRITICAL**: Use exact column count, not maximum:

```tsx
gridTemplateColumns: `repeat(${viewportColumns}, minmax(${DRAGBOARD_CONSTANTS.MIN_TILE_WIDTH}px, 1fr))`;
```

This ensures:

- Exactly `viewportColumns` columns
- Each column at least `MIN_TILE_WIDTH` (250px from constants)
- Remaining space distributed equally (`1fr`)
- **Equal column widths guaranteed**

### Order-Based Placement

**CRITICAL**: Calculate grid position from order:

```typescript
// Order 0, 1, 2, 3... maps to grid cells left-to-right, top-to-bottom
const row = Math.floor(order / viewportColumns);
const col = order % viewportColumns;
// CSS Grid automatically handles wrapping - no manual wrapping logic needed!
```

### No State for Columns

**CRITICAL**: Don't store column count in Provider state. Calculate in Grid component:

- Calculate on every render based on container width
- Use ResizeObserver to update on resize
- Pass `viewportColumns` to tiles via props

### LocalStorage Alignment

**CRITICAL**: The dragboard must work seamlessly with localStorage:

1. **Storage Format** (matches `StorageManager.DashboardState`):

   ```typescript
   {
     tiles: [
       {
         id: string,
         type: string,
         order: number,
         createdAt: number,
         config?: Record<string, unknown>
       }
     ]
   }
   ```

2. **Loading from Storage**:
   - Overlay component loads `initialTiles` from `storage.getDashboardState()`
   - Passes to `DragboardProvider` as `initialTiles` prop
   - Provider normalizes tiles: ensures `createdAt` exists

3. **Saving to Storage**:
   - `TilePersistenceListener` component watches `tiles` from context
   - When tiles change, calls `storage.setDashboardState({ tiles })`
   - Provider does NOT directly access storage (separation of concerns)

4. **No Hacks Required**:
   - Tiles stored with order field
   - Order determines grid placement
   - Wrapping happens at render time based on viewport columns
   - No conversion needed between storage and display

---

## Testing Checklist

### Unit Tests

- [ ] `DragboardProvider.test.tsx` - State management and drag/drop logic
- [ ] `DragboardGrid.test.tsx` - Column calculation
- [ ] `DragboardTile.test.tsx` - Order-to-position calculation

### Integration Tests

- [ ] Add tile from sidebar
- [ ] Remove tile
- [ ] Drag tile to new position
- [ ] Drag tile to occupied position (rearrange)
- [ ] Resize window (columns update)
- [ ] Sidebar open/closed (layout adjusts)

### Visual Tests

- [ ] 1 tile - stretches to fill width
- [ ] 3 tiles - wrap correctly, equal columns
- [ ] Many tiles - all wrap, no overflow
- [ ] Different content heights - same row height
- [ ] Resize - columns recalculate correctly

---

## Success Criteria

1. ✅ Columns are always equal width
2. ✅ Columns recalculate correctly on resize
3. ✅ Correct number of columns (not too few, not too many)
4. ✅ Tiles wrap correctly when they exceed viewport
5. ✅ Tiles in same row have same height
6. ✅ No overflow or stacking
7. ✅ Drag and drop works
8. ✅ Tiles consolidate to fill gaps
9. ✅ Responsive to viewport changes
10. ✅ No hardcoded values
11. ✅ Separation of concerns maintained
12. ✅ All tests pass

---

## Implementation Order

1. **Step 1**: Constants and Types
2. **Step 2**: Provider (context + state + all logic, no services)
3. **Step 3**: Grid Component (column calculation, passes viewportColumns as prop)
4. **Step 4**: Tile Component (order-to-position calculation)
5. **Step 5**: Integration and testing

---

## Notes

- **DO** calculate columns in Grid component (local state, not Provider)
- **DO** pass `viewportColumns` to tiles as prop (not context)
- **DO** use `repeat(${viewportColumns}, minmax(${DRAGBOARD_CONSTANTS.MIN_TILE_WIDTH}px, 1fr))` for equal columns
- **DO** calculate grid position from order: `row = floor(order / columns)`, `col = order % columns`
- **DO** use array index as order (sort by order, then index = order)
- **DO NOT** create separate service files for trivial operations
- **DO NOT** split context into multiple files
- **DO NOT** store calculated values (rows, viewportColumns in Provider)
- **DO NOT** create separate drag context - one context is enough

---

**Status**: Ready for implementation
**Priority**: CRITICAL - Follow implementation order (Steps 1-5)
