import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

import type { DragboardTileData } from './types';

interface DragboardContextValue {
  tiles: DragboardTileData[];
  addTile: (tile: Omit<DragboardTileData, 'order'>) => void;
  removeTile: (id: string) => void;
  startTileDrag: (tileId: string) => void;
  endTileDrag: (dropIndex: number | null) => void;
  startSidebarDrag: (tileType: string) => void;
  endSidebarDrag: (dropIndex: number | null, tileType: string) => void;
  setDropTarget: (dropIndex: number | null) => void;
  dragState: {
    draggingTileId: string | null;
    dropIndex: number | null;
    sidebarTileType?: string; // For sidebar drags
  };
}

const DragboardContext = createContext<DragboardContextValue | null>(null);

export const useDragboard = () => {
  const context = useContext(DragboardContext);
  if (!context) {
    throw new Error('useDragboard must be used within DragboardProvider');
  }
  return context;
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
      createdAt: tile.createdAt ?? Date.now(),
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
  const normalizeOrders = useCallback((tilesArray: DragboardTileData[]): DragboardTileData[] => {
    return tilesArray.map((tile, index) => ({
      ...tile,
      order: index,
    }));
  }, []);

  const addTile = useCallback(
    (tile: Omit<DragboardTileData, 'order'>) => {
      setTiles((prev) => {
        const newTile: DragboardTileData = {
          ...tile,
          order: prev.length,
          createdAt: tile.createdAt ?? Date.now(),
        };
        return [...prev, newTile];
      });
    },
    [],
  );

  const removeTile = useCallback((id: string) => {
    setTiles((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      return normalizeOrders(filtered);
    });
  }, [normalizeOrders]);

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
        const [draggedTile] = newTiles.splice(draggingIndex, 1);
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
          sidebarTileType: undefined,
        });
        return;
      }

      setTiles((prev) => {
        const newTile: DragboardTileData = {
          id: `tile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: tileType,
          order: dropIndex,
          createdAt: Date.now(),
        };

        const newTiles = [...prev];
        newTiles.splice(dropIndex, 0, newTile);

        return normalizeOrders(newTiles);
      });

      setDragState({
        draggingTileId: null,
        dropIndex: null,
        sidebarTileType: undefined,
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

  const value: DragboardContextValue = useMemo(
    () => ({
      tiles,
      addTile,
      removeTile,
      startTileDrag,
      endTileDrag,
      startSidebarDrag,
      endSidebarDrag,
      setDropTarget,
      dragState,
    }),
    [tiles, addTile, removeTile, startTileDrag, endTileDrag, startSidebarDrag, endSidebarDrag, setDropTarget, dragState],
  );

  return <DragboardContext.Provider value={value}>{children}</DragboardContext.Provider>;
};
