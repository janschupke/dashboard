import type { TileType } from '../../types/tile';
import { SidebarItem } from './SidebarItem';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useEffect, useMemo, useCallback } from 'react';
import { TILE_CATALOG } from '../tile/TileFactoryRegistry';
import { useDragboard } from '../dragboard';
import { findNextFreePosition } from '../dragboard/rearrangeTiles';
import { DASHBOARD_GRID_CONFIG } from '../overlay/gridConfig';
import { TILE_CATEGORIES } from '../../types/tileCategories';
import type { TileCategory } from '../../types/tileCategories';

interface SidebarProps {
  isCollapsed: boolean;
  onSidebarToggle: () => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

export function Sidebar({
  isCollapsed,
  onSidebarToggle,
  selectedIndex,
  setSelectedIndex,
}: SidebarProps) {
  const { tiles, addTile, removeTile } = useDragboard();

  // Use TILE_CATALOG for available tiles
  const availableTiles = useMemo(
    () =>
      TILE_CATALOG.map((entry) => {
        const meta =
          entry.meta ||
          (entry.getMeta ? entry.getMeta() : { title: '', icon: '', category: undefined });
        return {
          type: entry.type,
          name: meta.title,
          icon: meta.icon,
          category: meta.category,
        };
      }).filter((tile) => !!tile.category),
    [],
  );

  // Group tiles by category
  const tilesByCategory = useMemo(() => {
    const groups: Record<TileCategory, typeof availableTiles> = {
      Weather: [],
      Time: [],
      Macroeconomics: [],
      Finance: [],
    };
    availableTiles.forEach((tile) => {
      if (tile.category && groups[tile.category]) {
        groups[tile.category].push(tile);
      }
    });
    return groups;
  }, [availableTiles]);

  // Flattened list for hotkey navigation
  const flatTiles = useMemo(
    () => TILE_CATEGORIES.flatMap((cat) => tilesByCategory[cat]),
    [tilesByCategory],
  );

  const isTileActive = useCallback(
    (tileType: TileType) => tiles.some((tile) => tile.type === tileType),
    [tiles],
  );

  const handleTileToggle = useCallback(
    async (tileType: TileType) => {
      if (isTileActive(tileType)) {
        const tile = tiles.find((t) => t.type === tileType);
        if (tile) removeTile(tile.id);
      } else {
        const position = findNextFreePosition(tiles, DASHBOARD_GRID_CONFIG, 'medium') || {
          x: 0,
          y: 0,
        };
        await addTile({
          id: `tile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: tileType,
          position,
          size: 'medium',
          createdAt: Date.now(),
        });
      }
    },
    [isTileActive, addTile, removeTile, tiles],
  );

  const { selectedIndex: navIndex, setSelectedIndex: navSetIndex } = useKeyboardNavigation({
    navigation: {
      items: flatTiles.map((tile) => tile.type),
      onToggle: (tileType) => handleTileToggle(tileType as TileType),
      onSidebarToggle,
      isCollapsed,
    },
    enabled: true,
  });
  // Keep selectedIndex in sync with parent
  useEffect(() => {
    if (navIndex !== selectedIndex) setSelectedIndex(navIndex);
  }, [navIndex, selectedIndex, setSelectedIndex]);
  useEffect(() => {
    if (selectedIndex !== navIndex) navSetIndex(selectedIndex);
  }, [selectedIndex, navIndex, navSetIndex]);

  useEffect(() => {
    const selectedItem = flatTiles[selectedIndex];
    if (selectedItem) {
      const announcement = `Selected ${selectedItem.name} tile`;
      const liveRegion = document.getElementById('keyboard-announcements');
      if (liveRegion) {
        liveRegion.textContent = announcement;
      }
    }
  }, [selectedIndex, flatTiles]);

  return (
    <>
      <aside
        role="complementary"
        aria-label="Tile catalog sidebar"
        className={`h-full bg-surface-primary shadow-lg border-r border-theme-primary transition-all duration-300 ease-in-out flex-shrink-0 ${isCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-64 opacity-100'}`}
        style={{ minWidth: isCollapsed ? 0 : 256 }}
      >
        <div
          className={`flex flex-col h-full transition-all duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          {!isCollapsed && (
            <>
              <div className="flex-shrink-0 p-4 border-b border-theme-primary">
                <h2 className="text-lg font-semibold text-theme-primary" id="tiles-heading">
                  Available Tiles ({flatTiles.length})
                </h2>
              </div>
              <div className="relative flex-1 p-4 overflow-y-auto scrollbar-hide">
                <div
                  role="listbox"
                  aria-labelledby="tiles-heading"
                  aria-label="Available dashboard tiles"
                >
                  {TILE_CATEGORIES.map((category) => (
                    <section key={category} className="mb-4">
                      <h3
                        className="text-base font-bold text-theme-primary mb-1"
                        role="heading"
                        aria-level={3}
                      >
                        {category}
                      </h3>
                      <hr className="border-theme-primary mb-2" />
                      <div className="space-y-3">
                        {tilesByCategory[category].map((tile) => {
                          const idx = flatTiles.findIndex((t) => t.type === tile.type);
                          return (
                            <SidebarItem
                              key={tile.type}
                              tileType={tile.type}
                              name={tile.name}
                              icon={tile.icon}
                              isActive={isTileActive(tile.type)}
                              isSelected={selectedIndex === idx}
                              onClick={() => handleTileToggle(tile.type)}
                            />
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
                <div className="pointer-events-none absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-surface-primary to-transparent" />
              </div>
            </>
          )}
        </div>
      </aside>
      <div id="keyboard-announcements" className="sr-only" aria-live="polite" aria-atomic="true" />
    </>
  );
}
