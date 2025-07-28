import './index.css';
import './theme-init';

import React from 'react';

import ReactDOM from 'react-dom/client';

import App from './App';
import { CryptocurrencyDataMapper } from './components/tile-implementations/cryptocurrency/dataMapper';
import { earthquakeDataMapper } from './components/tile-implementations/earthquake/dataMapper';
import { ecbEuriborDataMapper } from './components/tile-implementations/euribor-rate/dataMapper';
import { FederalFundsRateDataMapper } from './components/tile-implementations/federal-funds-rate/dataMapper';
import { gdxEtfDataMapper } from './components/tile-implementations/gdx-etf/dataMapper';
import { PreciousMetalsDataMapper } from './components/tile-implementations/precious-metals/dataMapper';
import { TimeDataMapper } from './components/tile-implementations/time/dataMapper';
import { UraniumHtmlDataParser } from './components/tile-implementations/uranium/dataParser';
import { WeatherDataMapper } from './components/tile-implementations/weather/dataMapper';
import { WeatherAlertsDataMapper } from './components/tile-implementations/weather-alerts/dataMapper';
import { DataServicesContext } from './contexts/DataServicesContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { setupGlobalErrorHandling } from './services/apiErrorInterceptor';
import { DataFetcher } from './services/dataFetcher';
import { DataMapperRegistry } from './services/dataMapper';
import { DataParserRegistry } from './services/dataParser';
import { TileType } from './types/tile';

setupGlobalErrorHandling();

// Instantiate registries and fetcher
const parserRegistry = new DataParserRegistry();
const mapperRegistry = new DataMapperRegistry();
const dataFetcher = new DataFetcher(mapperRegistry, parserRegistry);

// Register all mappers
mapperRegistry.register(TileType.CRYPTOCURRENCY, new CryptocurrencyDataMapper());
mapperRegistry.register(TileType.PRECIOUS_METALS, new PreciousMetalsDataMapper());
mapperRegistry.register(TileType.FEDERAL_FUNDS_RATE, new FederalFundsRateDataMapper());
mapperRegistry.register(TileType.TIME_HELSINKI, new TimeDataMapper());
mapperRegistry.register(TileType.TIME_PRAGUE, new TimeDataMapper());
mapperRegistry.register(TileType.TIME_TAIPEI, new TimeDataMapper());
mapperRegistry.register(TileType.WEATHER_HELSINKI, new WeatherDataMapper());
mapperRegistry.register(TileType.WEATHER_PRAGUE, new WeatherDataMapper());
mapperRegistry.register(TileType.WEATHER_TAIPEI, new WeatherDataMapper());
mapperRegistry.register(TileType.GDX_ETF, gdxEtfDataMapper);
mapperRegistry.register(TileType.EURIBOR_RATE, ecbEuriborDataMapper);
mapperRegistry.register(TileType.EARTHQUAKE, earthquakeDataMapper);
mapperRegistry.register(TileType.WEATHER_ALERTS, new WeatherAlertsDataMapper());

// Register all parsers
parserRegistry.register(TileType.URANIUM, new UraniumHtmlDataParser());

const dataServices = { parserRegistry, mapperRegistry, dataFetcher };

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <DataServicesContext.Provider value={dataServices}>
        <App />
      </DataServicesContext.Provider>
    </ThemeProvider>
  </React.StrictMode>,
);
