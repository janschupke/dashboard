import { DateTime } from 'luxon';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';

import { hoursToMs } from '../utils/timeUtils';

import { StorageManager, STORAGE_KEYS, DEFAULT_APPCONFIG } from './storageManager';

import type { AppConfig, DashboardState, SidebarState, TileState } from './storageManager';

describe('StorageManager', () => {
  // TODO: add to central mock system?
  let localStorageMock: Record<string, unknown>;
  let storageManager: StorageManager;

  beforeEach(() => {
    localStorageMock = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => localStorageMock[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        Object.keys(localStorageMock).forEach((k) => delete localStorageMock[k]);
      }),
    });
    storageManager = new StorageManager();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('AppConfig', () => {
    it('should get and set app config', () => {
      expect(storageManager.getAppConfig()).toEqual(DEFAULT_APPCONFIG);
      const newConfig: AppConfig = { isSidebarCollapsed: true, theme: 'dark' };
      storageManager.setAppConfig(newConfig);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.APPCONFIG,
        JSON.stringify(newConfig),
      );
      expect(storageManager.getAppConfig()).toEqual(newConfig);
    });
    it('should initialize from localStorage', () => {
      localStorageMock[STORAGE_KEYS.APPCONFIG] = JSON.stringify({
        isSidebarCollapsed: true,
        theme: 'dark',
      });
      storageManager = new StorageManager();
      expect(storageManager.getAppConfig()).toEqual({ isSidebarCollapsed: true, theme: 'dark' });
    });
  });

  describe('DashboardState', () => {
    const dashboard: DashboardState = {
      tiles: [
        {
          id: '1',
          type: 'foo',
          order: 0,
          createdAt: 123,
          config: { a: 1 },
        },
      ],
    };
    it('should get and set dashboard state', () => {
      expect(storageManager.getDashboardState()).toBeNull();
      storageManager.setDashboardState(dashboard);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.DASHBOARD_STATE,
        JSON.stringify(dashboard),
      );
      expect(storageManager.getDashboardState()).toEqual(dashboard);
    });
    it('should initialize from localStorage', () => {
      localStorageMock[STORAGE_KEYS.DASHBOARD_STATE] = JSON.stringify(dashboard);
      storageManager = new StorageManager();
      expect(storageManager.getDashboardState()).toEqual(dashboard);
    });
  });

  describe('TileState', () => {
    const tileId = 'tile-1';
    const tileState: TileState = {
      data: { foo: 1 },
      lastDataRequest: 123,
      lastDataRequestSuccessful: true,
    };
    it('should get and set tile state', () => {
      expect(storageManager.getTileState(tileId)).toBeNull();
      storageManager.setTileState(tileId, tileState);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TILE_STATE,
        JSON.stringify({ [tileId]: tileState }),
      );
      expect(storageManager.getTileState(tileId)).toEqual(tileState);
    });
    it('should initialize from localStorage', () => {
      localStorageMock[STORAGE_KEYS.TILE_STATE] = JSON.stringify({ [tileId]: tileState });
      storageManager = new StorageManager();
      expect(storageManager.getTileState(tileId)).toEqual(tileState);
    });
    it('should return null for missing tile', () => {
      expect(storageManager.getTileState('missing')).toBeNull();
    });
  });

  describe('SidebarState', () => {
    const sidebar: SidebarState = { activeTiles: ['1'], isCollapsed: false, lastUpdated: 123 };
    it('should get and set sidebar state', () => {
      expect(storageManager.getSidebarState()).toBeNull();
      storageManager.setSidebarState(sidebar);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.SIDEBAR,
        JSON.stringify(sidebar),
      );
      expect(storageManager.getSidebarState()).toEqual(sidebar);
    });
    it('should initialize from localStorage', () => {
      localStorageMock[STORAGE_KEYS.SIDEBAR] = JSON.stringify(sidebar);
      storageManager = new StorageManager();
      expect(storageManager.getSidebarState()).toEqual(sidebar);
    });
  });

  describe('Logs', () => {
    const logEntry = {
      level: 'error' as const,
      apiCall: 'testApi',
      reason: 'fail',
      details: { foo: 'bar' },
    };
    it('should add and get logs, filter by 1 hour', () => {
      // Add a recent log
      storageManager.addLog(logEntry);
      let logs = storageManager.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0]!.level).toBe('error');
      // Simulate an old log in storage
      const oldLog = {
        id: 'old',
        timestamp: DateTime.now().toMillis() - hoursToMs(2),
        level: 'error',
        apiCall: 'testApi',
        reason: 'fail',
        details: { foo: 'bar' },
      };
      localStorageMock[STORAGE_KEYS.LOGS] = JSON.stringify([oldLog]);
      storageManager = new StorageManager();
      logs = storageManager.getLogs();
      expect(logs.length).toBe(0);
    });
    it('should not exceed 1000 logs', () => {
      for (let i = 0; i < 1100; i++) {
        storageManager.addLog({ ...logEntry, reason: `fail${i}` });
      }
      const logs = storageManager.getLogs();
      expect(logs.length).toBeLessThanOrEqual(1000);
    });
    it('should clear logs', () => {
      storageManager.addLog(logEntry);
      storageManager.clearLogs();
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.LOGS);
      expect(storageManager.getLogs()).toEqual([]);
    });
    it('should initialize from localStorage', () => {
      const logsArr = [
        { id: '1', timestamp: Date.now(), level: 'error', apiCall: 'a', reason: 'b' },
      ];
      localStorageMock[STORAGE_KEYS.LOGS] = JSON.stringify(logsArr);
      storageManager = new StorageManager();
      expect(storageManager.getLogs()).toEqual(logsArr);
    });
  });

  describe('Error handling', () => {
    it('should handle JSON parse errors gracefully', () => {
      localStorageMock[STORAGE_KEYS.APPCONFIG] = '{bad json}';
      storageManager = new StorageManager();
      expect(() => storageManager.getAppConfig()).not.toThrow();
      expect(storageManager.getAppConfig()).toEqual(DEFAULT_APPCONFIG);
    });
    it('should handle localStorage errors gracefully', () => {
      (localStorage.setItem as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('fail');
      });
      expect(() => storageManager.setAppConfig(DEFAULT_APPCONFIG)).not.toThrow();
      expect(() => storageManager.setDashboardState({ tiles: [] })).not.toThrow();
      expect(() =>
        storageManager.setTileState('id', {
          data: null,
          lastDataRequest: 0,
          lastDataRequestSuccessful: false,
        }),
      ).not.toThrow();
      expect(() =>
        storageManager.setSidebarState({ activeTiles: [], isCollapsed: false, lastUpdated: 0 }),
      ).not.toThrow();
      expect(() =>
        storageManager.addLog({ level: 'error', apiCall: 'a', reason: 'b' }),
      ).not.toThrow();
      (localStorage.removeItem as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('fail');
      });
      expect(() => storageManager.clearLogs()).not.toThrow();
    });
  });
});
