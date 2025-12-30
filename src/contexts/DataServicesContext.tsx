import { createContext, useContext } from 'react';

import { DataFetcher } from '../services/dataFetcher';
import { DataMapperRegistry } from '../services/dataMapper';
import { DataParserRegistry } from '../services/dataParser';

export interface DataServices {
  parserRegistry: DataParserRegistry;
  mapperRegistry: DataMapperRegistry;
  dataFetcher: DataFetcher;
}

export const DataServicesContext = createContext<DataServices | undefined>(undefined);

export const useDataServices = (): DataServices => {
  const ctx = useContext(DataServicesContext);
  if (!ctx) throw new Error('useDataServices must be used within a DataServicesContext.Provider');
  return ctx;
};
