import React, { useState, useEffect, useCallback } from 'react';

import { storageManager } from '../../services/storageManager';

import { LogContext } from './LogContextDef';

import type { APILogEntry } from '../../services/storageManager';

interface LogProviderProps {
  children: React.ReactNode;
}

export const LogProvider: React.FC<LogProviderProps> = ({ children }) => {
  const [logs, setLogs] = useState<APILogEntry[]>([]);

  const refreshLogs = useCallback((): void => {
    const storedLogs = storageManager.getLogs();
    setLogs(Array.isArray(storedLogs) ? storedLogs : []);
  }, []);

  // Subscribe to log changes
  useEffect(() => {
    storageManager.subscribeToLogs(refreshLogs);
    return () => {
      storageManager.unsubscribeFromLogs(refreshLogs);
    };
  }, [refreshLogs]);

  const addLog = useCallback(
    (entry: Omit<APILogEntry, 'id' | 'timestamp'>): void => {
      storageManager.addLog(entry);
      // refreshLogs(); // now handled by listener
    },
    [
      /*refreshLogs*/
    ],
  );

  const removeLog = useCallback(
    (id: string): void => {
      storageManager.removeLog(id);
      // refreshLogs(); // now handled by listener
    },
    [
      /*refreshLogs*/
    ],
  );

  const clearLogs = useCallback(
    (): void => {
      storageManager.clearLogs();
      // refreshLogs(); // now handled by listener
    },
    [
      /*refreshLogs*/
    ],
  );

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

  const value = {
    logs,
    addLog,
    removeLog,
    clearLogs,
    refreshLogs,
  };

  return <LogContext.Provider value={value}>{children}</LogContext.Provider>;
};
