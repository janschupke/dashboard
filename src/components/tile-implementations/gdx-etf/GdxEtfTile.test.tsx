import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MockDataServicesProvider } from '../../../test/mocks/componentMocks.tsx';
import { TileType } from '../../../types/tile';
import * as useTileDataModule from '../../tile/useTileData';

import { gdxEtfDataMapper } from './dataMapper';
import { GdxEtfTile } from './GdxEtfTile';

import type { GdxEtfTileData } from './types';
import type { DragboardTileData } from '../../dragboard';
import type { TileMeta } from '../../tile/GenericTile';

vi.mock('../../tile/useTileData', () => ({
  useTileData: vi.fn(),
  TileStatus: {
    Loading: 'loading',
    Success: 'success',
    Error: 'error',
    Stale: 'stale',
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider
    setup={({ mapperRegistry }) => {
      mapperRegistry.register(TileType.GDX_ETF, gdxEtfDataMapper);
    }}
  >
    {children}
  </MockDataServicesProvider>
);

describe('GdxEtfTile', () => {
  const mockTile: DragboardTileData = {
    id: 'test-gdx-tile',
    type: TileType.GDX_ETF,
    order: 0,
    createdAt: Date.now(),
  };

  const mockMeta: TileMeta = {
    title: 'GDX ETF',
    icon: 'chart',
    category: 'Finance',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tile with valid data', () => {
    const mockUseTileData = vi.spyOn(useTileDataModule, 'useTileData');
    mockUseTileData.mockReturnValue({
      data: {
        symbol: 'GDX',
        name: 'VanEck Gold Miners ETF',
        currentPrice: 30.5,
        previousClose: 30.0,
        priceChange: 0.5,
        priceChangePercent: 1.67,
        volume: 1000000,
        marketCap: 1000000000,
        high: 31.0,
        low: 29.5,
        open: 30.1,
        lastUpdated: '2024-06-01T16:00:00Z',
        tradingStatus: 'open',
      } as GdxEtfTileData,
      status: 'success',
      lastUpdated: new Date('2024-06-01T16:00:00Z'),
      manualRefresh: () => {},
      isLoading: false,
    });

    render(<GdxEtfTile tile={mockTile} meta={mockMeta} />, { wrapper });

    expect(screen.getByText('$30.50')).toBeInTheDocument();
    expect(screen.getByText('GDX')).toBeInTheDocument();
    // Use a function matcher to match the full text content for price change and percent
    expect(
      screen.getByText((_, node) => (node ? node.textContent === '+0.50 (+1.67%)' : false)),
    ).toBeInTheDocument();
  });

  it('renders tile with undefined values gracefully', () => {
    const mockUseTileData = vi.spyOn(useTileDataModule, 'useTileData');
    mockUseTileData.mockReturnValue({
      data: {
        symbol: undefined,
        name: undefined,
        currentPrice: 30.5,
        previousClose: undefined,
        priceChange: undefined,
        priceChangePercent: undefined,
        volume: undefined,
        marketCap: undefined,
        high: undefined,
        low: undefined,
        open: undefined,
        lastUpdated: undefined,
        tradingStatus: undefined,
      } as unknown as GdxEtfTileData,
      status: 'success',
      lastUpdated: new Date('2024-06-01T16:00:00Z'),
      manualRefresh: () => {},
      isLoading: false,
    });

    render(<GdxEtfTile tile={mockTile} meta={mockMeta} />, { wrapper });

    expect(screen.getByText('tiles.noDataAvailable')).toBeInTheDocument();
  });

  it('renders no data message when currentPrice is 0', () => {
    const mockUseTileData = vi.spyOn(useTileDataModule, 'useTileData');
    mockUseTileData.mockReturnValue({
      data: {
        symbol: 'GDX',
        name: 'VanEck Gold Miners ETF',
        currentPrice: 0,
        previousClose: 30.0,
        priceChange: 0.5,
        priceChangePercent: 1.67,
        volume: 1000000,
        marketCap: 1000000000,
        high: 31.0,
        low: 29.5,
        open: 30.1,
        lastUpdated: '2024-06-01T16:00:00Z',
        tradingStatus: 'open',
      } as GdxEtfTileData,
      status: 'success',
      lastUpdated: new Date('2024-06-01T16:00:00Z'),
      manualRefresh: () => {},
      isLoading: false,
    });

    render(<GdxEtfTile tile={mockTile} meta={mockMeta} />, { wrapper });

    expect(screen.getByText('tiles.noDataAvailable')).toBeInTheDocument();
  });

  it('renders no data message when data is null', () => {
    const mockUseTileData = vi.spyOn(useTileDataModule, 'useTileData');
    mockUseTileData.mockReturnValue({
      data: null,
      status: 'success',
      lastUpdated: new Date('2024-06-01T16:00:00Z'),
      manualRefresh: () => {},
      isLoading: false,
    });

    render(<GdxEtfTile tile={mockTile} meta={mockMeta} />, { wrapper });

    expect(screen.getByText('tiles.noDataAvailable')).toBeInTheDocument();
  });
});
