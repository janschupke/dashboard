import { useContext } from 'react';

import { TileRefreshContext } from '../contexts/TileRefreshContext';

export const useTileRefreshService = () => {
  const service = useContext(TileRefreshContext);
  if (!service) {
    throw new Error('useTileRefreshService must be used within TileRefreshProvider');
  }
  return service;
};
