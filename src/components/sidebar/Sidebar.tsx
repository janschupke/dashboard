import React, { useEffect, useMemo, useCallback } from 'react';

import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';

import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { TILE_CATEGORIES } from '../../types/tileCategories';
import { generateTileId } from '../../utils/idGenerator';
import { TILE_CATALOG } from '../tile/TileFactoryRegistry';

import { SidebarItem } from './SidebarItem';

import type { TileType } from '../../types/tile';
import type { TileCategory } from '../../types/tileCategories';
import type { DragboardTileData } from '../dragboard';

interface SidebarProps {
  isCollapsed: boolean;
  onSidebarToggle: () => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  tiles: DragboardTileData[];
  addTile: (tile: DragboardTileData) => void;
  removeTile: (id: string) => void;
  variant?: 'desktop' | 'mobile';
}

export function Sidebar({
  isCollapsed,
  onSidebarToggle,
  selectedIndex,
  setSelectedIndex,
  tiles,
  addTile,
  removeTile,
  variant = 'desktop',
}: SidebarProps): React.ReactNode {
  // Use TILE_CATALOG for available tiles
  const availableTiles = useMemo(
    () =>
      TILE_CATALOG.map((entry) => {
        const meta =
          entry.meta ??
          (entry.getMeta ? entry.getMeta() : { title: '', icon: '', category: undefined });
        return {
          type: entry.type,
          name: meta.title,
          icon: meta.icon,
          category: meta.category,
          disabled: entry.disabled ?? false,
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

  const { t } = useTranslation();

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
        // Add tile - order will be assigned automatically (at end)
        addTile({
          id: generateTileId(),
          type: tileType,
          order: tiles.length, // Add at end
          createdAt: DateTime.now().toMillis(),
        });
      }
    },
    [isTileActive, addTile, removeTile, tiles],
  );

  useKeyboardNavigation({
    navigation: {
      items: flatTiles.map((tile) => tile.type),
      onToggle: (tileType) => void handleTileToggle(tileType as TileType),
      onSidebarToggle,
      isCollapsed,
    },
    enabled: true,
    selectedIndex,
    setSelectedIndex,
  });

  useEffect(() => {
    const selectedItem = flatTiles[selectedIndex];
    if (selectedItem) {
      const announcement = `Selected ${selectedItem.name} tile`;
      // TODO: what is this?
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
        aria-label={/* i18n */ 'sidebar.ariaLabel'}
        className={
          variant === 'desktop'
            ? `h-full bg-surface-primary shadow-lg border-r border-theme-primary transition-all duration-300 ease-in-out flex-shrink-0 ${isCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-64 opacity-100'}`
            : `w-full bg-surface-primary shadow-lg border-b border-theme-primary transform origin-top transition-transform duration-300 ease-in-out ${isCollapsed ? 'scale-y-0 pointer-events-none' : 'scale-y-100'} max-h-[calc(100vh-4rem)] overflow-hidden`
        }
        style={variant === 'desktop' ? { minWidth: isCollapsed ? 0 : 256 } : undefined}
      >
        <div
          className={`flex flex-col h-full transition-all duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${variant === 'mobile' ? 'max-h-[calc(100vh-4rem)] overflow-y-auto' : ''}`}
        >
          {!isCollapsed && (
            <>
              <div className="flex-shrink-0 p-4 border-b border-theme-primary">
                <h2 className="text-lg font-semibold text-theme-primary" id="tiles-heading">
                  {t('sidebar.availableTiles', { count: flatTiles.length })}
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
                        {t(`tileCategories.${category}`)}
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
                              disabled={tile.disabled}
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
