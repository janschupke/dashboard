import { createContext } from 'react';

import type { APILogEntry } from '../../services/storageManager';

interface LogContextType {
  logs: APILogEntry[];
  addLog: (entry: Omit<APILogEntry, 'id' | 'timestamp'>) => void;
  removeLog: (id: string) => void;
  clearLogs: () => void;
  refreshLogs: () => void;
}

export const LogContext = createContext<LogContextType | undefined>(undefined);
