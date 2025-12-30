/* eslint-disable react-refresh/only-export-components */
import React from 'react';

import { useTranslation } from 'react-i18next';

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

  static getDerivedStateFromError(error: Error): TileErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(): void {
    // Optionally log error
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}

function ErrorDisplay({ error }: { error: Error | null }): React.ReactNode {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-full text-error-600 p-4 text-center">
      <div>
        <p className="font-semibold">{t('errors.tileError')}</p>
        <p className="text-xs mt-1">{error?.message ?? t('errors.unknown')}</p>
      </div>
    </div>
  );
}
