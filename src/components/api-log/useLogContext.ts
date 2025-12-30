import { useContext } from 'react';

import { LogContext, type LogContextType } from './LogContextDef';

export const useLogContext = (): LogContextType => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useLogContext must be used within a LogProvider');
  }
  return context;
};
