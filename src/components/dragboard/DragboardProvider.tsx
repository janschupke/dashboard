import React, { useCallback, useMemo, useState, useRef } from 'react';

import { DateTime } from 'luxon';

import { generateTileId } from '../../utils/idGenerator';
import { getHighestOccupiedRow, snapToTileGrid, tileFits } from '../../utils/gridUtils';
import { DragboardContext, DragboardDragContext } from './DragboardContext';
import { findNextFreePosition, rearrangeTiles } from './rearrangeTiles';

import type {
  DragboardConfig,
  DragboardDragState,
  DragboardContextValue,
} from './DragboardContext';
import type { DragboardTileData, TileType } from './dragboardTypes';

interface DragboardProviderProps {
  config: DragboardConfig;
  initialTiles?: DragboardTileData[];
  children: React.ReactNode;
}

export const DragboardProvider: React.FC<DragboardProviderProps> = ({
  config,
  initialTiles = [],
  children,
}) => {
  // Set config defaults
  const {
    consolidation = true,
    movementEnabled = true,
    columns,
    rows: defaultRows,
    tileSizes,
    // breakpoints, // removed unused
  } = config;

  // Internal tile state
  const [tiles, setTiles] = useState<DragboardTileData[]>(initialTiles);

  // Sync tiles state with initialTiles prop (for reload/restore)
  React.useEffect(() => {
    setTiles(initialTiles);
  }, [initialTiles]);

  // Track current row count (for dynamic extension/reduction)
  const [rows, setRows] = useState(defaultRows);
  const defaultRowsRef = useRef(defaultRows);
  const tilesRef = useRef(tiles);
  React.useEffect(() => {
    tilesRef.current = tiles;
  }, [tiles]);

  // Drag state
  const [dragState, setDragState] = useState<DragboardDragState>({
    draggingTileId: null,
    dragOrigin: null,
    dragOffset: null,
    dropTarget: null,
    isSidebarDrag: false,
    sidebarTileType: undefined,
  });

  // Helper: Check if a tile fits in the current grid
  const checkTileFits = useCallback(
    (tile: DragboardTileData) => {
      return tileFits(tile, tiles, tileSizes, rows, columns);
    },
    [tileSizes, rows, columns, tiles],
  );

  // Helper: Extend rows to fit a tile if needed
  const extendRowsIfNeeded = useCallback(
    (tile: DragboardTileData) => {
      const { rowSpan } = tileSizes[tile.size] || tileSizes['medium'];
      const neededRows = tile.position.y + rowSpan;
      if (neededRows > rows) setRows(neededRows);
    },
    [tileSizes, rows],
  );

  // Helper: Reduce rows if possible (after remove/move)
  const reduceRowsIfPossible = useCallback(() => {
    const highest = getHighestOccupiedRow(tiles, tileSizes, defaultRowsRef.current);
    if (rows > highest) setRows(highest);
  }, [tiles, tileSizes, rows]);

  // Tile drag actions (drag state only)
  const startTileDrag = useCallback((tileId: string, origin: { x: number; y: number }) => {
    setDragState((prev) => ({
      ...prev,
      draggingTileId: tileId,
      dragOrigin: origin,
      dragOffset: { x: 0, y: 0 },
      isSidebarDrag: false,
      sidebarTileType: undefined,
    }));
  }, []);

  const updateTileDrag = useCallback((offset: { x: number; y: number }) => {
    setDragState((prev) => ({ ...prev, dragOffset: offset }));
  }, []);

  // Internal tile actions
  const addTile = useCallback(
    (tile: DragboardTileData) => {
      setTiles((prev) => {
        const next = [...prev, tile];
        if (consolidation) {
          return rearrangeTiles(next);
        }
        return next;
      });
      extendRowsIfNeeded(tile);
      reduceRowsIfPossible();
    },
    [consolidation, extendRowsIfNeeded, reduceRowsIfPossible],
  );

  const removeTile = useCallback(
    (id: string) => {
      setTiles((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (consolidation && next.length > 0) {
          return rearrangeTiles(next);
        }
        return next;
      });
      reduceRowsIfPossible();
    },
    [consolidation, reduceRowsIfPossible],
  );

  const updateTile = useCallback((id: string, updates: Partial<DragboardTileData>) => {
    setTiles((prev) => prev.map((tile) => (tile.id === id ? { ...tile, ...updates } : tile)));
  }, []);

  const moveTile = useCallback(
    (tileId: string, newPosition: { x: number; y: number }) => {
      setTiles((prev) => {
        const next = prev.map((tile) =>
          tile.id === tileId ? { ...tile, position: newPosition } : tile,
        );
        if (consolidation) {
          return rearrangeTiles(next);
        }
        return next;
      });
      reduceRowsIfPossible();
    },
    [consolidation, reduceRowsIfPossible],
  );

  const reorderTiles = useCallback(
    (newTiles: DragboardTileData[]) => {
      setTiles(consolidation ? rearrangeTiles(newTiles) : newTiles);
    },
    [consolidation],
  );

  // End tile drag (move or out-of-bounds)
  const endTileDrag = useCallback(
    (dropTarget: { x: number; y: number } | null, tileId?: string) => {
      if (!tileId) return;
      const tile = tiles.find((t) => t.id === tileId);
      if (!tile) return;
      let snappedTarget = dropTarget;
      // Out of bounds logic
      if (
        dropTarget &&
        (dropTarget.x < 0 || dropTarget.y < 0 || dropTarget.x >= columns || dropTarget.y >= rows)
      ) {
        if (config.allowDragOutOfBounds) {
          removeTile(tileId);
        } // else, do nothing (tile stays in place)
        setDragState((prev) => ({
          ...prev,
          draggingTileId: null,
          dragOrigin: null,
          dragOffset: null,
          dropTarget: null,
          isSidebarDrag: false,
          sidebarTileType: undefined,
        }));
        return;
      }
      if (dropTarget) {
        const tileSize: 'small' | 'medium' | 'large' = tile.size;
        snappedTarget = snapToTileGrid(dropTarget.x, dropTarget.y, { ...config, rows }, tileSize);
        moveTile(tileId, snappedTarget);
        // Dynamic row extension (after move)
        extendRowsIfNeeded({ ...tile, position: snappedTarget });
        // Dynamic row reduction (after move)
        reduceRowsIfPossible();
      }
      setDragState((prev) => ({
        ...prev,
        draggingTileId: null,
        dragOrigin: null,
        dragOffset: null,
        dropTarget: snappedTarget,
        isSidebarDrag: false,
        sidebarTileType: undefined,
      }));
    },
    [columns, rows, moveTile, removeTile, config, extendRowsIfNeeded, reduceRowsIfPossible, tiles],
  );

  // Sidebar drag actions
  const startSidebarDrag = useCallback((tileType: string) => {
    setDragState((prev) => ({
      ...prev,
      draggingTileId: null,
      dragOrigin: null,
      dragOffset: null,
      dropTarget: null,
      isSidebarDrag: true,
      sidebarTileType: tileType,
    }));
  }, []);

  const endSidebarDrag = useCallback(
    (dropTarget: { x: number; y: number } | null, tileType?: string) => {
      if (!tileType) return;
      let snappedTarget = dropTarget;
      // Only allow drop if within bounds
      if (
        dropTarget &&
        (dropTarget.x < 0 || dropTarget.y < 0 || dropTarget.x >= columns || dropTarget.y >= rows)
      ) {
        // Out of bounds drop: do nothing
        setDragState((prev) => ({
          ...prev,
          draggingTileId: null,
          dragOrigin: null,
          dragOffset: null,
          dropTarget: null,
          isSidebarDrag: false,
          sidebarTileType: undefined,
        }));
        return;
      }
      // Find next free position if not provided
      if (!dropTarget) {
        snappedTarget = findNextFreePosition(tiles, { ...config, rows }, 'medium') || {
          x: 0,
          y: 0,
        };
      }
      // Prepare new tile
      const newTile: DragboardTileData = {
        id: generateTileId(),
        type: tileType as TileType,
        position: snappedTarget!,
        size: 'medium',
        createdAt: DateTime.now().toMillis(),
      };
      // Check if tile fits
      if (!checkTileFits(newTile)) {
        if (!config.dynamicExtensions) {
          throw new Error('Board is full and dynamicExtensions is disabled.');
        } else {
          // Extend rows to fit
          extendRowsIfNeeded(newTile);
        }
      }
      addTile(newTile);
      // Dynamic row extension (after add)
      extendRowsIfNeeded(newTile);
      // Dynamic row reduction (after add)
      reduceRowsIfPossible();
      setDragState((prev) => ({
        ...prev,
        draggingTileId: null,
        dragOrigin: null,
        dragOffset: null,
        dropTarget: snappedTarget,
        isSidebarDrag: false,
        sidebarTileType: undefined,
      }));
    },
    [columns, rows, config, tiles, addTile, checkTileFits, extendRowsIfNeeded, reduceRowsIfPossible],
  );

  // Set drop target for drag-over events
  const setDropTarget = useCallback((target: { x: number; y: number } | null) => {
    setDragState((prev) => ({ ...prev, dropTarget: target }));
  }, []);

  // Memoize drag context value separately for performance
  const dragContextValue = useMemo(
    () => ({
      dragState,
      startTileDrag,
      updateTileDrag,
      endTileDrag,
      startSidebarDrag,
      endSidebarDrag,
      setDropTarget,
    }),
    [
      dragState,
      startTileDrag,
      updateTileDrag,
      endTileDrag,
      startSidebarDrag,
      endSidebarDrag,
      setDropTarget,
    ],
  );

  // Memoize main context value (public API)
  const value = useMemo<
    DragboardContextValue & {
      tiles: DragboardTileData[];
      addTile: (tile: DragboardTileData) => void;
      removeTile: (id: string) => void;
      updateTile: (id: string, updates: Partial<DragboardTileData>) => void;
      moveTile: (tileId: string, newPosition: { x: number; y: number }) => void;
      reorderTiles: (tiles: DragboardTileData[]) => void;
      movementEnabled: boolean;
      rows: number;
    }
  >(
    () => ({
      config: { ...config, rows },
      dragState,
      startTileDrag,
      updateTileDrag,
      endTileDrag,
      startSidebarDrag,
      endSidebarDrag,
      setDropTarget,
      tiles,
      addTile,
      removeTile,
      updateTile,
      moveTile,
      reorderTiles,
      movementEnabled,
      rows,
    }),
    [
      config,
      rows,
      dragState,
      startTileDrag,
      updateTileDrag,
      endTileDrag,
      startSidebarDrag,
      endSidebarDrag,
      setDropTarget,
      tiles,
      addTile,
      removeTile,
      updateTile,
      moveTile,
      reorderTiles,
      movementEnabled,
    ],
  );

  return (
    <DragboardContext.Provider value={value}>
      <DragboardDragContext.Provider value={dragContextValue}>
        {children}
      </DragboardDragContext.Provider>
    </DragboardContext.Provider>
  );
};
