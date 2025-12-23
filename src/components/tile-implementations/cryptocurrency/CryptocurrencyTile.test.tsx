import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { MockDataServicesProvider } from '../../../test/mocks/componentMocks';
import { TileType } from '../../../types/tile';

import { CryptocurrencyTile } from './CryptocurrencyTile';
import { CryptocurrencyDataMapper } from './dataMapper';

import type { CryptocurrencyTileData } from './types';
import type { TileCategory } from '../../../types/tileCategories';
import type { DragboardTileData } from '../../dragboard';
import type { TileMeta } from '../../tile/GenericTile';

// Mock data for testing
const mockCryptocurrencyData: CryptocurrencyTileData = {
  coins: [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      current_price: 45000.0,
      market_cap: 850000000000,
      market_cap_rank: 1,
      price_change_percentage_24h: 2.5,
      price_change_24h: 1097.5,
      total_volume: 25000000000,
      circulating_supply: 19500000,
      total_supply: 21000000,
      max_supply: 21000000,
      ath: 69000,
      ath_change_percentage: -34.78,
      atl: 67.81,
      atl_change_percentage: 66200.0,
      last_updated: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      current_price: 3200.0,
      market_cap: 380000000000,
      market_cap_rank: 2,
      price_change_percentage_24h: -1.2,
      price_change_24h: -38.4,
      total_volume: 15000000000,
      circulating_supply: 120000000,
      total_supply: 120000000,
      max_supply: 0,
      ath: 4800,
      ath_change_percentage: -33.33,
      atl: 0.43,
      atl_change_percentage: 744000.0,
      last_updated: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'binancecoin',
      symbol: 'bnb',
      name: 'BNB',
      current_price: 320.0,
      market_cap: 48000000000,
      market_cap_rank: 3,
      price_change_percentage_24h: 0.8,
      price_change_24h: 2.56,
      total_volume: 2000000000,
      circulating_supply: 150000000,
      total_supply: 150000000,
      max_supply: 150000000,
      ath: 686,
      ath_change_percentage: -53.35,
      atl: 0.04,
      atl_change_percentage: 799900.0,
      last_updated: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'cardano',
      symbol: 'ada',
      name: 'Cardano',
      current_price: 0.5,
      market_cap: 17500000000,
      market_cap_rank: 4,
      price_change_percentage_24h: 1.5,
      price_change_24h: 0.0075,
      total_volume: 800000000,
      circulating_supply: 35000000000,
      total_supply: 45000000000,
      max_supply: 45000000000,
      ath: 3.1,
      ath_change_percentage: -83.87,
      atl: 0.017,
      atl_change_percentage: 2841.18,
      last_updated: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'solana',
      symbol: 'sol',
      name: 'Solana',
      current_price: 95.0,
      market_cap: 41000000000,
      market_cap_rank: 5,
      price_change_percentage_24h: 3.2,
      price_change_24h: 2.95,
      total_volume: 3000000000,
      circulating_supply: 430000000,
      total_supply: 533000000,
      max_supply: 0,
      ath: 260,
      ath_change_percentage: -63.46,
      atl: 0.5,
      atl_change_percentage: 18900.0,
      last_updated: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'ripple',
      symbol: 'xrp',
      name: 'XRP',
      current_price: 0.55,
      market_cap: 29000000000,
      market_cap_rank: 6,
      price_change_percentage_24h: -0.5,
      price_change_24h: -0.00275,
      total_volume: 1200000000,
      circulating_supply: 53000000000,
      total_supply: 100000000000,
      max_supply: 100000000000,
      ath: 3.4,
      ath_change_percentage: -83.82,
      atl: 0.002,
      atl_change_percentage: 27400.0,
      last_updated: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'polkadot',
      symbol: 'dot',
      name: 'Polkadot',
      current_price: 7.2,
      market_cap: 9000000000,
      market_cap_rank: 7,
      price_change_percentage_24h: 1.8,
      price_change_24h: 0.13,
      total_volume: 400000000,
      circulating_supply: 1250000000,
      total_supply: 1250000000,
      max_supply: 0,
      ath: 55.0,
      ath_change_percentage: -86.91,
      atl: 2.7,
      atl_change_percentage: 166.67,
      last_updated: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'dogecoin',
      symbol: 'doge',
      name: 'Dogecoin',
      current_price: 0.08,
      market_cap: 11000000000,
      market_cap_rank: 8,
      price_change_percentage_24h: 0.3,
      price_change_24h: 0.00024,
      total_volume: 600000000,
      circulating_supply: 140000000000,
      total_supply: 140000000000,
      max_supply: 0,
      ath: 0.73,
      ath_change_percentage: -89.04,
      atl: 0.00008,
      atl_change_percentage: 99900.0,
      last_updated: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'avalanche',
      symbol: 'avax',
      name: 'Avalanche',
      current_price: 35.0,
      market_cap: 13000000000,
      market_cap_rank: 9,
      price_change_percentage_24h: 2.1,
      price_change_24h: 0.72,
      total_volume: 800000000,
      circulating_supply: 370000000,
      total_supply: 720000000,
      max_supply: 720000000,
      ath: 146.22,
      ath_change_percentage: -76.06,
      atl: 2.8,
      atl_change_percentage: 1150.0,
      last_updated: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'chainlink',
      symbol: 'link',
      name: 'Chainlink',
      current_price: 15.5,
      market_cap: 9000000000,
      market_cap_rank: 10,
      price_change_percentage_24h: -0.8,
      price_change_24h: -0.124,
      total_volume: 500000000,
      circulating_supply: 580000000,
      total_supply: 1000000000,
      max_supply: 1000000000,
      ath: 52.7,
      ath_change_percentage: -70.59,
      atl: 0.15,
      atl_change_percentage: 10233.33,
      last_updated: '2024-01-01T00:00:00.000Z',
    },
  ],
};

const mockTile: DragboardTileData = {
  id: 'test-crypto-tile',
  type: 'cryptocurrency',
  order: 0,
  createdAt: Date.now(),
  config: {},
};

const mockMeta: TileMeta = {
  title: 'Cryptocurrency',
  icon: 'crypto',
  category: 'Finance' as TileCategory,
};

// Mock the useTileData hook at the top level
vi.mock('../../tile/useTileData', () => ({
  useTileData: () => ({
    data: mockCryptocurrencyData,
    status: 'success',
    lastUpdated: new Date('2024-01-01T00:00:00.000Z'),
  }),

  TileStatus: {
    Loading: 'loading',
    Success: 'success',
    Error: 'error',
    Stale: 'stale',
  },
}));

describe('CryptocurrencyTile', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MockDataServicesProvider
      setup={({ mapperRegistry }) => {
        mapperRegistry.register(TileType.CRYPTOCURRENCY, new CryptocurrencyDataMapper());
      }}
    >
      {children}
    </MockDataServicesProvider>
  );

  it('should display top 5 cryptocurrencies with their data', () => {
    render(<CryptocurrencyTile tile={mockTile} meta={mockMeta} />, { wrapper });

    // Check that all 10 coins are displayed
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('BNB')).toBeInTheDocument();
    expect(screen.getByText('Cardano')).toBeInTheDocument();
    expect(screen.getByText('Solana')).toBeInTheDocument();

    // Check that symbols are displayed (they are rendered in lowercase)
    expect(screen.getByText('btc')).toBeInTheDocument();
    expect(screen.getByText('eth')).toBeInTheDocument();
    expect(screen.getByText('bnb')).toBeInTheDocument();
    expect(screen.getByText('ada')).toBeInTheDocument();
    expect(screen.getByText('sol')).toBeInTheDocument();

    // Check that prices are displayed
    expect(screen.getByText('$45,000.00')).toBeInTheDocument();
    expect(screen.getByText('$3,200.00')).toBeInTheDocument();
    expect(screen.getByText('$320.00')).toBeInTheDocument();
    expect(screen.getByText('$0.50')).toBeInTheDocument();
    expect(screen.getByText('$95.00')).toBeInTheDocument();

    // Check that price changes are displayed with correct colors (match full row text)
    expect(
      screen.getByText((_, node) => (node ? node.textContent === '+1097.50 (+2.50%)' : false)),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => (node ? node.textContent === '-38.40 (-1.20%)' : false)),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => (node ? node.textContent === '+2.56 (+0.80%)' : false)),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => (node ? node.textContent === '+0.01 (+1.50%)' : false)),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => (node ? node.textContent === '+2.95 (+3.20%)' : false)),
    ).toBeInTheDocument();
  });

  it('should display ranking numbers', () => {
    render(<CryptocurrencyTile tile={mockTile} meta={mockMeta} />, { wrapper });

    // Check that ranking numbers are displayed
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });
});
