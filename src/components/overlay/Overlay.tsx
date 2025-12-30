import React, { Suspense, useState, useCallback } from 'react';

import { DateTime } from 'luxon';

import { Header } from '../../components/header/Header.tsx';
import { TileRefreshProvider } from '../../contexts/TileRefreshContext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useTheme } from '../../hooks/useTheme';
import { useTileRefreshService } from '../../hooks/useTileRefreshService';
import { useStorageManager } from '../../services/storageManager';
import { DEFAULT_REFRESH_DELAY_MS } from '../../services/tileRefreshService';
import { useLogManager } from '../api-log/useLogManager';
import { DragboardProvider, DragboardGrid, DragboardTile, useDragboard } from '../dragboard';
import { Sidebar } from '../sidebar/Sidebar';
import { Tile } from '../tile/Tile';

import { ErrorBoundary } from './ErrorBoundary';

import type { DragboardTileData } from '../dragboard';

type LogManagerReturn = {
  isLogViewOpen: boolean;
  toggleLogView: () => void;
  closeLogView: () => void;
  hasLogs: boolean;
  errorCount: number;
  warningCount: number;
};

function OverlayContent({
  isSidebarCollapsed,
  setSidebarCollapsed,
  sidebarSelectedIndex,
  setSidebarSelectedIndex,
}: {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (tiles: string[]) => void;
  sidebarSelectedIndex: number;
  setSidebarSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}): React.ReactNode {
  const { theme, toggleTheme } = useTheme();
  const { isLogViewOpen, toggleLogView, closeLogView } = useLogManager() as LogManagerReturn;
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { tiles, addTile, removeTile } = useDragboard();
  const refreshService = useTileRefreshService();

  // Refresh all tiles function - extracted business logic
  const refreshAllTiles = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      // Use the refresh service to handle tile refreshes
      await refreshService.refreshAllTiles();
      // Add a small delay for UI feedback
      await new Promise((resolve) => setTimeout(resolve, DEFAULT_REFRESH_DELAY_MS));
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshService]);

  useKeyboardNavigation({
    toggleLogView,
    refreshAllTiles,
    isRefreshing,
    selectedIndex: sidebarSelectedIndex,
    setSelectedIndex: setSidebarSelectedIndex,
  });

  const LogView = React.lazy(
    (): Promise<{ default: React.ComponentType<{ isOpen: boolean; onClose: () => void }> }> =>
      import('../api-log/LogView').then((m) => ({ default: m.LogView })),
  );

  return (
    <div className="h-screen w-full flex flex-col bg-theme-primary overflow-hidden">
      <Header
        isLogViewOpen={isLogViewOpen}
        toggleLogView={toggleLogView}
        toggleTheme={toggleTheme}
        theme={theme}
        toggleCollapse={() => setSidebarCollapsed(tiles.map((t) => t.id))}
        tilesCount={tiles.length}
        refreshAllTiles={refreshAllTiles}
        isRefreshing={isRefreshing}
      />
      <div className="flex h-full pt-16 relative w-full items-stretch">
        {/* Desktop sidebar */}
        <div
          className="hidden md:block transition-all duration-300 ease-in-out"
          style={{ width: isSidebarCollapsed ? 0 : 256 }}
        >
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onSidebarToggle={() => setSidebarCollapsed(tiles.map((t) => t.id))}
            selectedIndex={sidebarSelectedIndex}
            setSelectedIndex={setSidebarSelectedIndex}
            tiles={tiles}
            addTile={addTile}
            removeTile={removeTile}
            variant="desktop"
          />
        </div>
        {/* Mobile slide-down sidebar from header */}
        <div className="md:hidden fixed left-0 right-0 top-16 z-50">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onSidebarToggle={() => setSidebarCollapsed(tiles.map((t) => t.id))}
            selectedIndex={sidebarSelectedIndex}
            setSelectedIndex={setSidebarSelectedIndex}
            tiles={tiles}
            addTile={addTile}
            removeTile={removeTile}
            variant="mobile"
          />
        </div>
        <main
          className="overflow-auto relative scrollbar-hide transition-all duration-300 ease-in-out w-full"
          style={{ marginLeft: 0 }}
        >
          <DragboardGrid>
            {tiles.map((tile) => (
              <DragboardTile key={tile.id} id={tile.id}>
                <Tile tile={tile} />
              </DragboardTile>
            ))}
          </DragboardGrid>
          <Suspense fallback={null}>
            {isLogViewOpen && <LogView isOpen={isLogViewOpen} onClose={closeLogView} />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function useTileStorage(): {
  initialTiles: DragboardTileData[];
  storage: ReturnType<typeof useStorageManager>;
} {
  const storage = useStorageManager();
  const [initialTiles, setInitialTiles] = React.useState<DragboardTileData[]>([]);
  React.useEffect(() => {
    const dashboard = storage.getDashboardState();
    if (dashboard && Array.isArray(dashboard.tiles)) {
      setInitialTiles(
        dashboard.tiles.map(
          (tile) =>
            ({
              ...tile,
              type: tile.type,
              order: typeof tile.order === 'number' ? tile.order : 0, // Default to 0 if missing
              createdAt:
                typeof tile.createdAt === 'number' ? tile.createdAt : DateTime.now().toMillis(),
              config: tile.config ?? {},
            }) as DragboardTileData,
        ),
      );
    }
  }, [storage]);
  return { initialTiles, storage };
}

function TilePersistenceListener({
  storage,
}: {
  storage: ReturnType<typeof useStorageManager>;
}): null {
  const { tiles } = useDragboard();
  const prevTilesRef = React.useRef<DragboardTileData[] | null>(null);
  React.useEffect(() => {
    const prevTiles = prevTilesRef.current;
    const shouldPersist =
      tiles.length > 0 || (prevTiles && prevTiles.length > 0 && tiles.length === 0);
    if (shouldPersist) {
      storage.setDashboardState({
        tiles: tiles.map((tile: DragboardTileData) => ({
          id: tile.id,
          type: tile.type,
          order: tile.order,
          createdAt:
            typeof tile.createdAt === 'number' ? tile.createdAt : DateTime.now().toMillis(),
          config: tile.config ?? {},
        })),
      });
      if (prevTiles) {
        const prevIds = new Set(prevTiles.map((t: DragboardTileData) => t.id));
        const currentIds = new Set(tiles.map((t: DragboardTileData) => t.id));
        for (const id of prevIds) {
          if (!currentIds.has(id)) {
            // TODO: data reset?
            storage.setTileState(id, {
              data: null,
              lastDataRequest: 0,
              lastDataRequestSuccessful: false,
              lastSuccessfulDataRequest: null,
            });
          }
        }
      }
      if (tiles.length === 0) {
        storage.clearTileState();
      }
    }
    prevTilesRef.current = tiles;
  }, [tiles, storage]);
  return null;
}

export function Overlay(): React.ReactNode {
  const { initialTiles, storage } = useTileStorage();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Load initial sidebar state from storage
    const sidebarState = storage.getSidebarState();
    return sidebarState?.isCollapsed ?? false;
  });
  const [sidebarSelectedIndex, setSidebarSelectedIndex] = useState(0);

  // Save sidebar state when it changes
  const handleSidebarToggle = useCallback(
    (activeTiles: string[]) => {
      setSidebarCollapsed((prev) => {
        const newState = !prev;
        // Save to storage with actual active tiles
        storage.setSidebarState({
          activeTiles,
          isCollapsed: newState,
          lastUpdated: DateTime.now().toMillis(),
        });
        return newState;
      });
    },
    [storage],
  );

  return (
    <ErrorBoundary variant="app">
      <TileRefreshProvider>
        <DragboardProvider initialTiles={initialTiles}>
          <TilePersistenceListener storage={storage} />
          <OverlayContent
            isSidebarCollapsed={isSidebarCollapsed}
            setSidebarCollapsed={handleSidebarToggle}
            sidebarSelectedIndex={sidebarSelectedIndex}
            setSidebarSelectedIndex={setSidebarSelectedIndex}
          />
        </DragboardProvider>
      </TileRefreshProvider>
    </ErrorBoundary>
  );
}
