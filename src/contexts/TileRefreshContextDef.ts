import { createContext } from 'react';

import { TileRefreshService } from '../services/tileRefreshService';

export const TileRefreshContext = createContext<TileRefreshService | null>(null);
