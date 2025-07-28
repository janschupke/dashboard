import React from 'react';

import { LogProvider } from '../../components/api-log/LogContext';
import { ThemeProvider } from '../../contexts/ThemeContext';

// TODO: is this used?
export const TestProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <LogProvider>{children}</LogProvider>
    </ThemeProvider>
  );
};
