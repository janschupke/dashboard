import React, { createContext, useContext, useRef } from 'react';
import { TileRefreshService } from '../services/tileRefreshService';

const TileRefreshContext = createContext<TileRefreshService | null>(null);

export const useTileRefreshService = () => {
  const service = useContext(TileRefreshContext);
  if (!service) {
    throw new Error('useTileRefreshService must be used within TileRefreshProvider');
  }
  return service;
};

export const TileRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const serviceRef = useRef(new TileRefreshService());

  return <TileRefreshContext.Provider value={serviceRef.current}>{children}</TileRefreshContext.Provider>;
};

