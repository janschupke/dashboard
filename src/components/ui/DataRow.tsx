import React from 'react';

import { PriceDisplay } from './PriceDisplay';

export interface DataRowProps {
  index: number;
  name: string;
  code: string;
  price: number;
  priceChange?: number;
  priceChangePercent?: number;
  currency?: string;
  showBorder?: boolean;
  className?: string;
}

export const DataRow = React.memo<DataRowProps>(
  ({
    index,
    name,
    code,
    price,
    priceChange,
    priceChangePercent,
    currency = 'USD',
    showBorder = true,
    className = '',
  }) => {
    const hasChangeData = priceChange !== undefined && priceChangePercent !== undefined;
    const isPositive = hasChangeData ? priceChange >= 0 : false;

    return (
      <div
        className={`flex items-center justify-between py-1 ${showBorder ? 'border-b border-secondary last:border-b-0' : ''} ${className}`}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <span className="text-xs text-tertiary w-4 text-right">{index}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate text-primary">{name}</div>
            <div className="text-xs text-tertiary uppercase">{code}</div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <PriceDisplay price={price} currency={currency} className="text-xs" />
          {hasChangeData && (
            <div className={`text-xs ${isPositive ? 'text-status-success' : 'text-status-error'}`}>
              {isPositive ? '+' : ''}
              {priceChange.toFixed(2)} ({isPositive ? '+' : ''}
              {priceChangePercent.toFixed(2)}%)
            </div>
          )}
        </div>
      </div>
    );
  },
);

DataRow.displayName = 'DataRow';
