import React from 'react';

import { vi } from 'vitest';

import { DataFetcher } from '../../services/dataFetcher';
import { DataMapperRegistry } from '../../services/dataMapper';
import { DataParserRegistry } from '../../services/dataParser';
import { AppTheme } from '../../services/storageManager';

export function createMockDataServices() {
  const parserRegistry = new DataParserRegistry();
  const mapperRegistry = new DataMapperRegistry();
  const dataFetcher = new DataFetcher(mapperRegistry, parserRegistry);
  return { parserRegistry, mapperRegistry, dataFetcher };
}

export const dragboardProviderProps: Array<Record<string, unknown>> = [];
export const headerMock = vi.fn();

export const resetComponentMocks = () => {
  dragboardProviderProps.length = 0;
  headerMock.mockClear();
};

export const mockDragboardComponents = () => {
  vi.mock('../../components/dragboard', () => ({
    DragboardProvider: ({ children, ...props }: { children: React.ReactNode }) => {
      dragboardProviderProps.push(props);
      return React.createElement('div', { 'data-testid': 'mock-dragboard-provider' }, children);
    },
    DragboardGrid: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'mock-dragboard-grid' }, children),
    DragboardTile: ({
      children,
      id,
    }: {
      children: React.ReactNode;
      id: string;
      position: Record<string, unknown>;
      size: string;
    }) => React.createElement('div', { 'data-testid': `mock-dragboard-tile-${id}` }, children),
  }));
};

export const mockTileComponent = () => {
  vi.mock('../../components/tile/Tile', () => ({
    Tile: ({ tile }: { tile: Record<string, unknown> }) =>
      React.createElement('div', { 'data-testid': `mock-tile-${tile.id}` }, `MockTile ${tile.id}`),
  }));
};

export const mockHeaderComponent = () => {
  vi.mock('../../components/header/Header.tsx', () => ({
    Header: (props: Record<string, unknown>) => {
      headerMock(props);

      console.log('MOCK HEADER RENDERED', props);
      return React.createElement('div', { 'data-testid': 'mock-header' }, [
        'MockHeader',
        React.createElement(
          'button',
          {
            'data-testid': 'toggle-sidebar',
            onClick: props.toggleCollapse as () => void,
          },
          'ToggleSidebar',
        ),
      ]);
    },
  }));
};

export const mockLogViewComponent = () => {
  vi.mock('../../components/api-log/LogView', () => ({
    LogView: () => React.createElement('div', { 'data-testid': 'mock-logview' }, 'MockLogView'),
  }));
};

export const mockLazyImports = () => {
  vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
      ...actual,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      lazy: (_importFn: () => Promise<unknown>) => {
        // Return a synchronous component instead of lazy
        return () =>
          React.createElement('div', { 'data-testid': 'mock-lazy-component' }, 'MockLazyComponent');
      },
    };
  });
};

export const mockHooks = () => {
  // Mock useTheme to prevent theme context issues
  vi.mock('../../hooks/useTheme', () => ({
    useTheme: () => ({
      theme: AppTheme.light,
      toggleTheme: vi.fn(),
      tokens: {},
    }),
  }));

  // Mock useLogManager to prevent log context issues
  vi.mock('../../components/api-log/useLogManager', () => ({
    useLogManager: () => ({
      isLogViewOpen: false,
      toggleLogView: vi.fn(),
      closeLogView: vi.fn(),
      hasLogs: false,
      errorCount: 0,
      warningCount: 0,
    }),
  }));

  // Mock useLogContext to prevent LogProvider errors
  vi.mock('../../components/api-log/useLogContext', () => ({
    useLogContext: () => ({
      logs: [],
      addLog: vi.fn(),
      removeLog: vi.fn(),
      clearLogs: vi.fn(),
      refreshLogs: vi.fn(),
    }),
  }));

  // Mock useKeyboardNavigation to prevent event listeners
  vi.mock('../../hooks/useKeyboardNavigation', () => ({
    useKeyboardNavigation: () => ({}),
  }));
};

export const setupComponentMocks = () => {
  mockDragboardComponents();
  mockTileComponent();
  mockHeaderComponent();
  mockLogViewComponent();
  mockLazyImports();
  mockHooks();
};
