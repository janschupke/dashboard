import React, { useRef } from 'react';

import { TileRefreshService } from '../services/tileRefreshService';

import { TileRefreshContext } from './TileRefreshContextDef';

export const TileRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const serviceRef = useRef(new TileRefreshService());

  return (
    <TileRefreshContext.Provider value={serviceRef.current}>{children}</TileRefreshContext.Provider>
  );
};
