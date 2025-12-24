import React from 'react';

import { ERROR_MESSAGES } from '../../constants/errorMessages';

interface TileErrorBoundaryProps {
  children: React.ReactNode;
}

interface TileErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class TileErrorBoundary extends React.Component<
  TileErrorBoundaryProps,
  TileErrorBoundaryState
> {
  constructor(props: TileErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch() {
    // Optionally log error
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full text-error-600 p-4 text-center">
          <div>
            <p className="font-semibold">{ERROR_MESSAGES.TILE.TILE_ERROR}</p>
            <p className="text-xs mt-1">
              {this.state.error?.message ?? ERROR_MESSAGES.TILE.UNKNOWN_ERROR}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
