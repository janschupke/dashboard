import React from 'react';

import type { DragboardTileData } from '../components/dragboard/dragboardTypes';

// --- Types ---
export const AppTheme = {
  light: 'light',
  dark: 'dark',
} as const;
export type AppTheme = (typeof AppTheme)[keyof typeof AppTheme];

export const APILogLevel = {
  WARNING: 'warning',
  ERROR: 'error',
} as const;
export type APILogLevelType = (typeof APILogLevel)[keyof typeof APILogLevel];

export interface AppConfig {
  isSidebarCollapsed: boolean;
  theme: AppTheme;
}

export interface SidebarState {
  activeTiles: string[];
  isCollapsed: boolean;
  lastUpdated: number;
}

// Improved typing for API log details - only string or number values
export interface APILogDetails {
  [key: string]: string | number;
}

export interface APILogEntry {
  id: string;
  timestamp: number;
  level: APILogLevelType;
  apiCall: string;
  reason: string;
  details?: APILogDetails;
}

export interface TileDataType {
  // Base properties that all tile data should have
  lastUpdated?: string;
}

// Generic TileConfig with typed data for tile content
export interface TileConfig<TData extends TileDataType = TileDataType> extends TileDataType {
  data: TData | null;
  lastDataRequest: number;
  lastDataRequestSuccessful: boolean;
}

// Extended DashboardTile that includes TileConfig in the config property
export interface DashboardTileWithConfig extends Omit<DragboardTileData, 'config'> {
  config: TileConfig;
}

// --- Constants ---
export const STORAGE_KEYS = {
  APPCONFIG: 'dashboard-app-config',
  DASHBOARD_STATE: 'dashboard-dashboard-state',
  TILE_STATE: 'dashboard-tile-state',
  SIDEBAR: 'dashboard-sidebar-state',
  LOGS: 'dashboard_api_logs',
};

// Log retention time: 1 hour in milliseconds
export const LOG_RETENTION_TIME = 60 * 60 * 1000;

export const DEFAULT_APPCONFIG: AppConfig = {
  isSidebarCollapsed: false,
  theme: AppTheme.light,
};

// TODO: is this retrieved from Dragboard or calculated in app?
// --- StorageManager Types ---
export interface DashboardState {
  tiles: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    size: string;
    createdAt: number;
    config?: Record<string, unknown>;
  }>;
}

export interface TileState<TData = unknown> {
  data: TData | null;
  lastDataRequest: number;
  lastDataRequestSuccessful: boolean;
}

export class StorageManager {
  private appConfig: AppConfig = DEFAULT_APPCONFIG;
  private dashboardState: DashboardState | null = null;
  private tileState: Record<string, TileState> = {};
  private sidebarState: SidebarState | null = null;
  private logs: APILogEntry[] = [];
  private initialized = false;
  // TODO: research, also LogContext. It's weird.
  private logListeners: Array<() => void> = [];

  init() {
    if (this.initialized) return;
    try {
      const appConfigRaw = localStorage.getItem(STORAGE_KEYS.APPCONFIG);
      this.appConfig = appConfigRaw ? JSON.parse(appConfigRaw) : DEFAULT_APPCONFIG;
      const dashboardRaw = localStorage.getItem(STORAGE_KEYS.DASHBOARD_STATE);
      this.dashboardState = dashboardRaw ? JSON.parse(dashboardRaw) : null;
      const tileStateRaw = localStorage.getItem(STORAGE_KEYS.TILE_STATE);
      this.tileState = tileStateRaw ? JSON.parse(tileStateRaw) : {};
      const sidebarRaw = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
      this.sidebarState = sidebarRaw ? JSON.parse(sidebarRaw) : null;
      const logsRaw = localStorage.getItem(STORAGE_KEYS.LOGS);
      this.logs = logsRaw ? JSON.parse(logsRaw) : [];
      this.initialized = true;
    } catch (error) {
      console.error('StorageManager init failed:', error);
    }
  }

  getAppConfig(): AppConfig {
    this.init();
    return this.appConfig;
  }

  setAppConfig(config: AppConfig) {
    this.appConfig = config;
    try {
      localStorage.setItem(STORAGE_KEYS.APPCONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save app config:', error);
    }
  }

  // Dashboard state (layout/config)
  getDashboardState(): DashboardState | null {
    this.init();
    return this.dashboardState;
  }

  setDashboardState(state: DashboardState) {
    this.dashboardState = state;
    try {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_STATE, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save dashboard state:', error);
    }
  }

  // Per-tile state (data/fetch)
  getTileState<TData = unknown>(tileId: string): TileState<TData> | null {
    this.init();
    return (this.tileState[tileId] as TileState<TData>) || null;
  }

  // TODO: fix unknown
  setTileState<TData = unknown>(tileId: string, state: TileState<TData>) {
    this.tileState[tileId] = state;
    try {
      localStorage.setItem(STORAGE_KEYS.TILE_STATE, JSON.stringify(this.tileState));
    } catch (error) {
      console.error('Failed to save tile state:', error);
    }
  }

  clearTileState() {
    this.tileState = {};
    try {
      localStorage.removeItem(STORAGE_KEYS.TILE_STATE);
    } catch (error) {
      console.error('Failed to clear tile state:', error);
    }
  }

  getSidebarState(): SidebarState | null {
    this.init();
    return this.sidebarState;
  }

  setSidebarState(state: SidebarState) {
    this.sidebarState = state;
    try {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
    }
  }

  subscribeToLogs(listener: () => void) {
    this.logListeners.push(listener);
  }

  unsubscribeFromLogs(listener: () => void) {
    this.logListeners = this.logListeners.filter((l) => l !== listener);
  }

  private notifyLogListeners() {
    for (const listener of this.logListeners) {
      try {
        listener();
      } catch {
        // Ignore listener errors
      }
    }
  }

  private clearExpiredLogs() {
    const retentionThreshold = Date.now() - LOG_RETENTION_TIME;
    this.logs = this.logs.filter((log) => log.timestamp >= retentionThreshold);
  }

  getLogs(): APILogEntry[] {
    this.init();
    this.clearExpiredLogs();
    return this.logs;
  }

  addLog(entry: Omit<APILogEntry, 'id' | 'timestamp'>) {
    const newLog: APILogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    // Add new log and filter out old logs
    this.logs.unshift(newLog);
    this.clearExpiredLogs();
    if (this.logs.length > 1000) this.logs.splice(1000);
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save logs:', error);
    }
    this.notifyLogListeners();
  }

  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem(STORAGE_KEYS.LOGS);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
    this.notifyLogListeners();
  }
}

export const storageManager = new StorageManager();

export const StorageManagerContext = React.createContext(storageManager);
export const useStorageManager = () => React.useContext(StorageManagerContext);
