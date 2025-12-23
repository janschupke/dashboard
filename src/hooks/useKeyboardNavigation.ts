import { useCallback, useEffect } from 'react';

// Types for keyboard navigation configuration
export interface KeyboardNavigationConfig {
  items?: string[];
  onToggle?: (itemId: string) => void;
  onSidebarToggle?: () => void;
  isCollapsed?: boolean;
}

export interface KeyboardNavigationOptions {
  navigation?: KeyboardNavigationConfig;
  enabled?: boolean;
  toggleLogView?: () => void;
  refreshAllTiles?: () => void | Promise<void>;
  isRefreshing?: boolean;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

/**
 * Unified keyboard navigation and hotkey system
 * Handles both navigation (arrow keys, selection) and hotkeys (L, R, Escape, etc.)
 * in a hierarchical manner to prevent conflicts.
 * Handles L (log) and R (refresh) hotkeys directly.
 */
export const useKeyboardNavigation = (options: KeyboardNavigationOptions) => {
  const {
    navigation,
    enabled = true,
    toggleLogView,
    refreshAllTiles,
    isRefreshing,
    selectedIndex,
    setSelectedIndex,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Default filter: ignore input fields and modifier keys
      const defaultFilter = (event: KeyboardEvent) => {
        const tag = (event.target as HTMLElement)?.tagName;
        return !(
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey
        );
      };

      if (!defaultFilter(event)) return;

      // Handle L hotkey (toggle log view)
      if ((event.key === 'l' || event.key === 'L') && typeof toggleLogView === 'function') {
        event.preventDefault();
        toggleLogView();
        return;
      }

      // Handle R hotkey (refresh all tiles, disabled while refreshing)
      if ((event.key === 'r' || event.key === 'R') && typeof refreshAllTiles === 'function') {
        if (!isRefreshing) {
          event.preventDefault();
          void refreshAllTiles();
        }
        return;
      }

      // Handle navigation if configured
      if (navigation?.items && navigation.items.length > 0) {
        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault();
            setSelectedIndex(selectedIndex === 0 ? navigation.items.length - 1 : selectedIndex - 1);
            break;
          case 'ArrowDown':
            event.preventDefault();
            setSelectedIndex(selectedIndex === navigation.items.length - 1 ? 0 : selectedIndex + 1);
            break;
          case 'Enter':
          case ' ': // Spacebar
            event.preventDefault();
            if (navigation.items[selectedIndex] && navigation.onToggle) {
              navigation.onToggle(navigation.items[selectedIndex]);
            }
            break;
          case 'ArrowLeft':
            event.preventDefault();
            if (navigation.isCollapsed === false && navigation.onSidebarToggle) {
              navigation.onSidebarToggle();
            }
            break;
          case 'ArrowRight':
            event.preventDefault();
            if (navigation.isCollapsed === true && navigation.onSidebarToggle) {
              navigation.onSidebarToggle();
            }
            break;
        }
      }
    },
    [
      enabled,
      navigation,
      selectedIndex,
      toggleLogView,
      refreshAllTiles,
      isRefreshing,
      setSelectedIndex,
    ],
  );

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  return {
    selectedIndex,
    setSelectedIndex,
  };
};
