import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { DateTime } from 'luxon';

import { generateTileId } from '../../utils/idGenerator';

import type { DragboardTileData } from './types';

// Split contexts to prevent unnecessary re-renders
const TilesContext = createContext<DragboardTileData[] | null>(null);
const DragStateContext = createContext<{
  draggingTileId: string | null;
  dropIndex: number | null;
  sidebarTileType?: string;
} | null>(null);
const DragboardActionsContext = createContext<{
  addTile: (tile: Omit<DragboardTileData, 'order'>) => void;
  removeTile: (id: string) => void;
  startTileDrag: (tileId: string) => void;
  endTileDrag: (dropIndex: number | null) => void;
  startSidebarDrag: (tileType: string) => void;
  endSidebarDrag: (dropIndex: number | null, tileType: string) => void;
  setDropTarget: (dropIndex: number | null) => void;
} | null>(null);

/* eslint-disable react-refresh/only-export-components */
// Separate hooks for selective subscriptions
export const useTiles = (): DragboardTileData[] => {
  const tiles = useContext(TilesContext);
  if (!tiles) {
    throw new Error('useTiles must be used within DragboardProvider');
  }
  return tiles;
};

export const useDragState = (): {
  draggingTileId: string | null;
  dropIndex: number | null;
  sidebarTileType?: string;
} => {
  const dragState = useContext(DragStateContext);
  if (!dragState) {
    throw new Error('useDragState must be used within DragboardProvider');
  }
  return dragState;
};

export const useDragboardActions = (): {
  addTile: (tile: Omit<DragboardTileData, 'order'>) => void;
  removeTile: (id: string) => void;
  startTileDrag: (tileId: string) => void;
  endTileDrag: (dropIndex: number | null) => void;
  startSidebarDrag: (tileType: string) => void;
  endSidebarDrag: (dropIndex: number | null, tileType: string) => void;
  setDropTarget: (dropIndex: number | null) => void;
} => {
  const actions = useContext(DragboardActionsContext);
  if (!actions) {
    throw new Error('useDragboardActions must be used within DragboardProvider');
  }
  return actions;
};

// Hook to get specific tile data - only re-renders when that tile changes
export const useTileById = (
  id: string,
): {
  tile: DragboardTileData | undefined;
  isDragging: boolean;
} => {
  const tiles = useTiles();
  const dragState = useDragState();
  return useMemo(
    () => ({
      tile: tiles.find((t) => t.id === id),
      isDragging: dragState.draggingTileId === id,
    }),
    [tiles, dragState.draggingTileId, id],
  );
};

// Legacy hook for backward compatibility - use specific hooks when possible
export const useDragboard = (): {
  tiles: DragboardTileData[];
  dragState: {
    draggingTileId: string | null;
    dropIndex: number | null;
    sidebarTileType?: string;
  };
  addTile: (tile: Omit<DragboardTileData, 'order'>) => void;
  removeTile: (id: string) => void;
  startTileDrag: (tileId: string) => void;
  endTileDrag: (dropIndex: number | null) => void;
  startSidebarDrag: (tileType: string) => void;
  endSidebarDrag: (dropIndex: number | null, tileType: string) => void;
  setDropTarget: (dropIndex: number | null) => void;
} => {
  const tiles = useTiles();
  const dragState = useDragState();
  const actions = useDragboardActions();
  return useMemo(
    () => ({
      tiles,
      dragState,
      ...actions,
    }),
    [tiles, dragState, actions],
  );
};

interface DragboardProviderProps {
  initialTiles?: DragboardTileData[];
  children: React.ReactNode;
}

export const DragboardProvider: React.FC<DragboardProviderProps> = ({
  initialTiles = [],
  children,
}) => {
  // Normalize initial tiles: sort by saved order, then reassign sequential orders (0, 1, 2, ...)
  // This ensures orders are always sequential with no gaps, while preserving relative order
  const normalizedInitialTiles = useMemo(() => {
    const sorted = [...initialTiles].sort((a, b) => {
      const aOrder = a.order ?? 0;
      const bOrder = b.order ?? 0;
      return aOrder - bOrder;
    });
    return sorted.map((tile, index) => ({
      ...tile,
      order: index, // Sequential: 0, 1, 2, ...
      createdAt: tile.createdAt ?? DateTime.now().toMillis(),
    }));
  }, [initialTiles]);

  const [tiles, setTiles] = useState<DragboardTileData[]>(normalizedInitialTiles);

  // Update tiles when initialTiles change (e.g., loaded from localStorage)
  useEffect(() => {
    setTiles(normalizedInitialTiles);
  }, [normalizedInitialTiles]);
  const [dragState, setDragState] = useState<{
    draggingTileId: string | null;
    dropIndex: number | null;
    sidebarTileType?: string;
  }>({
    draggingTileId: null,
    dropIndex: null,
  });

  // Normalize orders to match array indices (0, 1, 2, ...)
  // Only create new objects for tiles whose order actually changed
  const normalizeOrders = useCallback((tilesArray: DragboardTileData[]): DragboardTileData[] => {
    return tilesArray.map((tile, index) => {
      // Only create new object if order changed
      if (tile.order === index) {
        return tile; // Preserve reference
      }
      return { ...tile, order: index };
    });
  }, []);

  const addTile = useCallback((tile: Omit<DragboardTileData, 'order'>) => {
    setTiles((prev) => {
      const newTile: DragboardTileData = {
        ...tile,
        order: prev.length,
        createdAt: tile.createdAt ?? DateTime.now().toMillis(),
      };
      return [...prev, newTile];
    });
  }, []);

  const queryClient = useQueryClient();

  const removeTile = useCallback(
    (id: string) => {
      setTiles((prev) => {
        const filtered = prev.filter((t) => t.id !== id);
        return normalizeOrders(filtered);
      });

      // ONLY remove the specific tile's query - do NOT invalidate all queries
      queryClient.removeQueries({
        queryKey: ['tile-data', id],
      });
    },
    [normalizeOrders, queryClient],
  );

  const startTileDrag = useCallback((tileId: string) => {
    setDragState({
      draggingTileId: tileId,
      dropIndex: null,
    });
  }, []);

  const endTileDrag = useCallback(
    (dropIndex: number | null) => {
      if (dropIndex === null) {
        setDragState({
          draggingTileId: null,
          dropIndex: null,
        });
        return;
      }

      setTiles((prev) => {
        const draggingId = dragState.draggingTileId;
        if (!draggingId) return prev;

        const draggingIndex = prev.findIndex((t) => t.id === draggingId);
        if (draggingIndex === -1) return prev;

        const newTiles = [...prev];
        const draggedTile = newTiles.splice(draggingIndex, 1)[0];
        if (!draggedTile) return prev;
        newTiles.splice(dropIndex, 0, draggedTile);

        return normalizeOrders(newTiles);
      });

      setDragState({
        draggingTileId: null,
        dropIndex: null,
      });
    },
    [dragState.draggingTileId, normalizeOrders],
  );

  const startSidebarDrag = useCallback((tileType: string) => {
    setDragState({
      draggingTileId: null,
      dropIndex: null,
      sidebarTileType: tileType,
    });
  }, []);

  const endSidebarDrag = useCallback(
    (dropIndex: number | null, tileType: string) => {
      // If dropIndex is null, the drag was cancelled - don't create a tile
      if (dropIndex === null) {
        setDragState({
          draggingTileId: null,
          dropIndex: null,
        });
        return;
      }

      setTiles((prev) => {
        const newTile: DragboardTileData = {
          id: generateTileId(),
          type: tileType,
          order: dropIndex,
          createdAt: DateTime.now().toMillis(),
        };

        const newTiles = [...prev];
        newTiles.splice(dropIndex, 0, newTile);

        return normalizeOrders(newTiles);
      });

      setDragState({
        draggingTileId: null,
        dropIndex: null,
      });
    },
    [normalizeOrders],
  );

  const setDropTarget = useCallback((dropIndex: number | null) => {
    setDragState((prev) => ({
      ...prev,
      dropIndex,
    }));
  }, []);

  // Memoize actions separately - they don't change
  const actions = useMemo(
    () => ({
      addTile,
      removeTile,
      startTileDrag,
      endTileDrag,
      startSidebarDrag,
      endSidebarDrag,
      setDropTarget,
    }),
    [
      addTile,
      removeTile,
      startTileDrag,
      endTileDrag,
      startSidebarDrag,
      endSidebarDrag,
      setDropTarget,
    ],
  );

  // Memoize drag state separately
  const memoizedDragState = useMemo(() => dragState, [dragState]);

  return (
    <TilesContext.Provider value={tiles}>
      <DragStateContext.Provider value={memoizedDragState}>
        <DragboardActionsContext.Provider value={actions}>
          {children}
        </DragboardActionsContext.Provider>
      </DragStateContext.Provider>
    </TilesContext.Provider>
  );
};
