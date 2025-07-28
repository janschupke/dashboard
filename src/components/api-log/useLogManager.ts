import { useState, useCallback } from 'react';

import { useLogContext } from './useLogContext';

export const useLogManager = () => {
  const [isLogViewOpen, setIsLogViewOpen] = useState(false);
  const { logs } = useLogContext();

  const toggleLogView = useCallback(() => {
    setIsLogViewOpen((prev) => !prev);
  }, []);

  const closeLogView = useCallback(() => {
    setIsLogViewOpen(false);
  }, []);

  const hasLogs = logs.length > 0;
  const errorCount = logs.filter((log) => log.level === 'error').length;
  const warningCount = logs.filter((log) => log.level === 'warning').length;

  return {
    isLogViewOpen,
    toggleLogView,
    closeLogView,
    hasLogs,
    errorCount,
    warningCount,
  };
};
