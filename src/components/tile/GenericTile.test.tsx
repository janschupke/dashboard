import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MockDataServicesProvider } from '../../test/mocks/componentMocks';
import { TileType } from '../../types/tile';

import { GenericTile } from './GenericTile';
import { TileStatus } from './useTileData';

import type { TileMeta } from './GenericTile';
import type { TileDataType } from '../../services/storageManager';
import type { DragboardTileData } from '../dragboard';

// Mock react-tooltip
vi.mock('react-tooltip', () => ({
  Tooltip: ({ id }: { id: string }) => <div data-testid={`tooltip-${id}`} />,
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockDataServicesProvider>{children}</MockDataServicesProvider>
);

describe('GenericTile - Last Request Tooltip', () => {
  const mockTile: DragboardTileData = {
    id: 'test-tile',
    type: TileType.WEATHER_HELSINKI,
    order: 0,
    createdAt: Date.now(),
  };

  const mockMeta: TileMeta = {
    title: 'Test Tile',
    icon: 'test',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays both last request and last successful data times in stale tooltip', () => {
    const lastRequestTime = '2024-01-15T10:30:00Z';
    const lastSuccessfulDataTime = '2024-01-15T09:00:00Z'; // Actual last successful data timestamp

    const mockData: TileDataType = {
      lastUpdated: lastSuccessfulDataTime,
    };

    render(
      <GenericTile
        tile={mockTile}
        meta={mockMeta}
        status={TileStatus.Stale}
        lastUpdate={lastRequestTime}
        lastSuccessfulDataUpdate={lastSuccessfulDataTime}
        data={mockData}
      >
        <div>Test Content</div>
      </GenericTile>,
      { wrapper },
    );

    // Find the last request tooltip trigger element
    const tooltipTrigger = document.querySelector('[data-tooltip-id*="tile-last-request-tooltip"]');

    expect(tooltipTrigger).toBeTruthy();

    // Check that the tooltip HTML attribute contains both timestamps
    const tooltipHtml = tooltipTrigger?.getAttribute('data-tooltip-html');
    expect(tooltipHtml).toBeTruthy();
    expect(tooltipHtml).toContain('tile.lastRequest');
    expect(tooltipHtml).toContain('tile.lastData');
    expect(tooltipHtml).toContain('2024');
    expect(tooltipHtml).toContain('<br />');
    // Should show different times: request at 10:30, data at 09:00
    expect(tooltipHtml).toContain('10:30');
    expect(tooltipHtml).toContain('09:00');
  });

  it('displays "never" when lastSuccessfulDataUpdate is missing in stale tooltip', () => {
    const lastRequestTime = '2024-01-15T10:30:00Z';

    const mockData: TileDataType = {
      // lastUpdated is missing, but stale means we have data
    };

    render(
      <GenericTile
        tile={mockTile}
        meta={mockMeta}
        status={TileStatus.Stale}
        lastUpdate={lastRequestTime}
        lastSuccessfulDataUpdate={undefined} // No successful data timestamp available
        data={mockData}
      >
        <div>Test Content</div>
      </GenericTile>,
      { wrapper },
    );

    const tooltipTrigger = document.querySelector('[data-tooltip-id*="tile-last-request-tooltip"]');
    expect(tooltipTrigger).toBeTruthy();

    const tooltipHtml = tooltipTrigger?.getAttribute('data-tooltip-html');
    expect(tooltipHtml).toBeTruthy();
    expect(tooltipHtml).toContain('tile.lastRequest');
    expect(tooltipHtml).toContain('tile.lastData');
    // Should contain "never" when lastSuccessfulDataUpdate is not available
    expect(tooltipHtml).toContain('tile.never');
  });

  it('displays simple tooltip content for success status', () => {
    render(
      <GenericTile
        tile={mockTile}
        meta={mockMeta}
        status={TileStatus.Success}
        lastUpdate="2024-01-15T10:30:00Z"
        lastSuccessfulDataUpdate="2024-01-15T10:30:00Z"
        data={{ lastUpdated: '2024-01-15T10:30:00Z' }}
      >
        <div>Test Content</div>
      </GenericTile>,
      { wrapper },
    );

    const tooltipTrigger = document.querySelector('[data-tooltip-id*="tile-last-request-tooltip"]');
    expect(tooltipTrigger).toBeTruthy();

    // Should use data-tooltip-content, not data-tooltip-html
    const tooltipContent = tooltipTrigger?.getAttribute('data-tooltip-content');
    expect(tooltipContent).toBeTruthy();
    expect(tooltipContent).toContain('2024');

    const tooltipHtml = tooltipTrigger?.getAttribute('data-tooltip-html');
    expect(tooltipHtml).toBeNull();
  });

  it('displays simple tooltip for error status (only last request)', () => {
    const lastRequestTime = '2024-01-15T10:30:00Z';

    render(
      <GenericTile
        tile={mockTile}
        meta={mockMeta}
        status={TileStatus.Error}
        lastUpdate={lastRequestTime}
        lastSuccessfulDataUpdate={undefined}
        data={null}
      >
        <div>Test Content</div>
      </GenericTile>,
      { wrapper },
    );

    const tooltipTrigger = document.querySelector('[data-tooltip-id*="tile-last-request-tooltip"]');
    expect(tooltipTrigger).toBeTruthy();

    // Should use data-tooltip-content, not data-tooltip-html (simple like success)
    const tooltipContent = tooltipTrigger?.getAttribute('data-tooltip-content');
    expect(tooltipContent).toBeTruthy();
    expect(tooltipContent).toContain('2024');
    // Should NOT contain "never" - error tiles made a request!
    expect(tooltipContent).not.toContain('never');

    const tooltipHtml = tooltipTrigger?.getAttribute('data-tooltip-html');
    expect(tooltipHtml).toBeNull();
  });

  it('displays actual last successful data time when available in stale tooltip', () => {
    const lastRequestTime = '2024-01-15T10:30:00Z';
    const lastSuccessfulDataTime = '2024-01-15T09:00:00Z'; // Actual last successful data timestamp

    const mockData: TileDataType = {
      lastUpdated: lastSuccessfulDataTime,
    };

    render(
      <GenericTile
        tile={mockTile}
        meta={mockMeta}
        status={TileStatus.Stale}
        lastUpdate={lastRequestTime}
        lastSuccessfulDataUpdate={lastSuccessfulDataTime}
        data={mockData}
      >
        <div>Test Content</div>
      </GenericTile>,
      { wrapper },
    );

    const tooltipTrigger = document.querySelector('[data-tooltip-id*="tile-last-request-tooltip"]');
    expect(tooltipTrigger).toBeTruthy();

    const tooltipHtml = tooltipTrigger?.getAttribute('data-tooltip-html');
    expect(tooltipHtml).toBeTruthy();
    expect(tooltipHtml).toContain('tile.lastRequest');
    expect(tooltipHtml).toContain('tile.lastData');
    // Should show the actual successful data timestamp, not "never"
    expect(tooltipHtml).not.toContain('tile.never');
    // Should contain formatted date (e.g., "January 15, 2024")
    expect(tooltipHtml).toContain('January');
    expect(tooltipHtml).toContain('2024');
    // Should show different times for request (10:30) and data (09:00)
    expect(tooltipHtml).toContain('10:30');
    expect(tooltipHtml).toContain('09:00');
  });
});
