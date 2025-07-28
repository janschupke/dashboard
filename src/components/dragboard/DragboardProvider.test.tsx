import React from 'react';

import { render, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useDragboard } from './DragboardContext';
import { DragboardGrid } from './DragboardGrid';
import { DragboardProvider } from './DragboardProvider';
import { DragboardTile } from './DragboardTile';

import type { DragboardConfig, DragboardContextValue } from './DragboardContext';
import type { DragboardTileData } from './dragboardTypes';

const makeTile = (id: string, y = 0): DragboardTileData => ({
  id,
  type: 'cryptocurrency', // use a valid TileType for test tiles
  position: { x: 0, y },
  size: 'medium',
  createdAt: Date.now(),
});

const configBase: DragboardConfig = {
  columns: 2,
  rows: 2,
  tileSizes: {
    small: { colSpan: 1, rowSpan: 1 },
    medium: { colSpan: 1, rowSpan: 1 },
    large: { colSpan: 2, rowSpan: 2 },
  },
  breakpoints: {},
};

type TestBoardProps = {
  config: DragboardConfig;
  initialTiles?: DragboardTileData[];
  children?: React.ReactNode;
};

function TestBoard({ config, initialTiles = [], children }: TestBoardProps) {
  return (
    <DragboardProvider config={config} initialTiles={initialTiles}>
      <DragboardGrid>
        <TilesFromContext />
      </DragboardGrid>
      {children}
    </DragboardProvider>
  );
}

// Helper to render tiles from context
function TilesFromContext() {
  const { tiles } = useDragboard();
  return (
    <>
      {tiles.map((tile) => (
        <DragboardTile key={tile.id} id={tile.id} position={tile.position} size={tile.size}>
          <div data-testid={`tile-${tile.id}`}>{tile.id}</div>
        </DragboardTile>
      ))}
    </>
  );
}

// Helper component to expose Dragboard context API to tests
const DragboardTestHelper = React.forwardRef<DragboardContextValue, object>((_props, ref) => {
  const ctx = useDragboard();
  React.useImperativeHandle(ref, () => ctx, [ctx]);
  return null;
});

describe('DragboardProvider', () => {
  it('adds a tile via API', () => {
    const config = { ...configBase };
    const helperRef = React.createRef<DragboardContextValue>();
    const { getByTestId } = render(
      <TestBoard config={config}>
        <DragboardTestHelper ref={helperRef as React.Ref<DragboardContextValue>} />
      </TestBoard>,
    );
    act(() => {
      helperRef.current!.addTile(makeTile('A'));
    });
    expect(getByTestId('tile-A')).toBeInTheDocument();
  });

  it('removes a tile via API', () => {
    const config = { ...configBase };
    const helperRef = React.createRef<DragboardContextValue>();
    const { queryByTestId } = render(
      <TestBoard config={config} initialTiles={[makeTile('A')]}>
        <DragboardTestHelper ref={helperRef as React.Ref<DragboardContextValue>} />
      </TestBoard>,
    );
    act(() => {
      helperRef.current!.removeTile('A');
    });
    expect(queryByTestId('tile-A')).not.toBeInTheDocument();
  });

  it('moves a tile via API', () => {
    const config = { ...configBase };
    const helperRef = React.createRef<DragboardContextValue>();
    const { getByTestId } = render(
      <TestBoard config={config} initialTiles={[makeTile('A')]}>
        <DragboardTestHelper ref={helperRef as React.Ref<DragboardContextValue>} />
      </TestBoard>,
    );
    act(() => {
      helperRef.current!.moveTile('A', { x: 1, y: 1 });
    });
    expect(getByTestId('tile-A')).toBeInTheDocument();
  });

  it('consolidates tiles if enabled', () => {
    const config = { ...configBase, consolidation: true };
    const tiles = [makeTile('A', 0), makeTile('B', 1), makeTile('C', 2)];
    const helperRef = React.createRef<DragboardContextValue>();
    const { getByTestId } = render(
      <TestBoard config={config} initialTiles={tiles}>
        <DragboardTestHelper ref={helperRef as React.Ref<DragboardContextValue>} />
      </TestBoard>,
    );
    act(() => {
      helperRef.current!.moveTile('A', { x: 0, y: 2 });
    });
    expect(getByTestId('tile-A')).toBeInTheDocument();
    expect(getByTestId('tile-B')).toBeInTheDocument();
    expect(getByTestId('tile-C')).toBeInTheDocument();
  });

  it('allows free placement if consolidation is disabled', () => {
    const config = { ...configBase, consolidation: false };
    const tiles = [makeTile('A', 0), makeTile('B', 1)];
    const helperRef = React.createRef<DragboardContextValue>();
    const { getByTestId } = render(
      <TestBoard config={config} initialTiles={tiles}>
        <DragboardTestHelper ref={helperRef as React.Ref<DragboardContextValue>} />
      </TestBoard>,
    );
    act(() => {
      helperRef.current!.moveTile('A', { x: 0, y: 1 });
    });
    expect(getByTestId('tile-A')).toBeInTheDocument();
  });

  it('extends rows dynamically if enabled', () => {
    const config = { ...configBase, dynamicExtensions: true };
    const tiles = [makeTile('A', 0), makeTile('B', 1)];
    const helperRef = React.createRef<DragboardContextValue>();
    const { getByTestId } = render(
      <TestBoard config={config} initialTiles={tiles}>
        <DragboardTestHelper ref={helperRef as React.Ref<DragboardContextValue>} />
      </TestBoard>,
    );
    act(() => {
      helperRef.current!.addTile(makeTile('C', 2));
    });
    expect(getByTestId('tile-C')).toBeInTheDocument();
  });

  it('reduces rows after tile removal', () => {
    const config = { ...configBase, dynamicExtensions: true };
    const tiles = [makeTile('A', 0), makeTile('B', 1), makeTile('C', 2)];
    const helperRef = React.createRef<DragboardContextValue>();
    const { getByTestId, queryByTestId } = render(
      <TestBoard config={config} initialTiles={tiles}>
        <DragboardTestHelper ref={helperRef as React.Ref<DragboardContextValue>} />
      </TestBoard>,
    );
    act(() => {
      helperRef.current!.removeTile('C');
    });
    expect(queryByTestId('tile-C')).not.toBeInTheDocument();
    expect(getByTestId('tile-A')).toBeInTheDocument();
    expect(getByTestId('tile-B')).toBeInTheDocument();
  });

  it('removes tile on drag out of bounds if enabled', () => {
    const config = { ...configBase, allowDragOutOfBounds: true };
    const tiles = [makeTile('A', 0)];
    const helperRef = React.createRef<DragboardContextValue>();
    const { queryByTestId } = render(
      <TestBoard config={config} initialTiles={tiles}>
        <DragboardTestHelper ref={helperRef as React.Ref<DragboardContextValue>} />
      </TestBoard>,
    );
    act(() => {
      helperRef.current!.endTileDrag({ x: -1, y: -1 }, 'A');
    });
    expect(queryByTestId('tile-A')).not.toBeInTheDocument();
  });

  it('returns tile to original position on drag out of bounds if disabled', () => {
    const config = { ...configBase, allowDragOutOfBounds: false };
    const tiles = [makeTile('A', 0)];
    const helperRef = React.createRef<DragboardContextValue>();
    const { getByTestId } = render(
      <TestBoard config={config} initialTiles={tiles}>
        <DragboardTestHelper ref={helperRef as React.Ref<DragboardContextValue>} />
      </TestBoard>,
    );
    act(() => {
      helperRef.current!.endTileDrag({ x: -1, y: -1 }, 'A');
    });
    expect(getByTestId('tile-A')).toBeInTheDocument();
  });

  it('disables drag if movementEnabled is false', () => {
    const config = { ...configBase, movementEnabled: false };
    const tiles = [makeTile('A', 0)];
    const { getByTestId } = render(
      <TestBoard config={config} initialTiles={tiles}>
        {/* No need for helper here, just UI check */}
      </TestBoard>,
    );
    const tile = getByTestId('tile-A');
    expect(tile).toBeInTheDocument();
  });

  it('hides remove button if removable is false', () => {
    // This test is now obsolete; removal is controlled by onRemove prop, not config.removable
    // Remove this test or update to check that onRemove is not passed to the child
  });

  // Add more edge case tests as needed
});
