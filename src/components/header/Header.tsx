import { LogButton } from '../api-log/LogButton';

import { CollapseButton } from './CollapseButton';
import { LogoutButton } from './LogoutButton';
import { RefreshButton } from './RefreshButton';
import { ThemeButton } from './ThemeButton';

export interface HeaderProps {
  isLogViewOpen: boolean;
  toggleLogView: () => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  toggleCollapse: () => void;
  tilesCount: number;
  refreshAllTiles?: () => void | Promise<void>;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isLogViewOpen,
  toggleLogView,
  toggleTheme,
  theme,
  toggleCollapse,
  tilesCount,
  refreshAllTiles,
  isRefreshing = false,
}) => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-surface-primary border-b border-theme-primary px-3 md:px-4 py-3 flex items-center justify-between h-16">
    <div className="flex items-center space-x-2 md:space-x-3">
      <CollapseButton onToggle={toggleCollapse} />
      <h1 className="text-lg md:text-xl font-semibold text-theme-primary">Dashboard</h1>
    </div>
    <div className="flex items-center space-x-1 md:space-x-2">
      <LogButton isOpen={isLogViewOpen} onToggle={toggleLogView} />
      <RefreshButton onRefresh={refreshAllTiles ?? (() => {})} isRefreshing={isRefreshing} />
      <ThemeButton theme={theme} onToggle={toggleTheme} />
      <LogoutButton />
      <span className="hidden sm:inline-block text-sm text-theme-secondary">{tilesCount} tiles</span>
    </div>
  </header>
);
