import React, { useRef, createContext } from 'react';

import { TileRefreshService } from '../services/tileRefreshService';

export const TileRefreshContext = createContext<TileRefreshService | null>(null);

export const TileRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const serviceRef = useRef(new TileRefreshService());

  return (
    <TileRefreshContext.Provider value={serviceRef.current}>{children}</TileRefreshContext.Provider>
  );
};
