import React from 'react';
import type { ReactNode } from 'react';

import { DataServicesContext } from '../../contexts/DataServicesContext';
import { ToastContext } from '../../contexts/ToastContextDef';

import { createMockDataServices } from './componentMocksUtils';

// Only export React components from this file.

type MockDataServicesProviderProps = {
  children: ReactNode;
  setup?: (services: ReturnType<typeof createMockDataServices>) => void;
};
export const MockDataServicesProvider: React.FC<MockDataServicesProviderProps> = ({
  children,
  setup,
}) => {
  const services = createMockDataServices();
  if (setup) setup(services);
  return <DataServicesContext.Provider value={services}>{children}</DataServicesContext.Provider>;
};

type MockToastProviderProps = {
  children: ReactNode;
};

export const MockToastProvider: React.FC<MockToastProviderProps> = ({ children }) => {
  const mockToastContext = {
    toasts: [],
    addToast: () => {},
    removeToast: () => {},
  };

  return <ToastContext.Provider value={mockToastContext}>{children}</ToastContext.Provider>;
};
