import { useContext } from 'react';

import { TileRefreshContext } from '../contexts/TileRefreshContext';
import { TileRefreshService } from '../services/tileRefreshService';

export const useTileRefreshService = (): TileRefreshService => {
  const service = useContext(TileRefreshContext);
  if (!service) {
    throw new Error('useTileRefreshService must be used within TileRefreshProvider');
  }
  return service;
};
