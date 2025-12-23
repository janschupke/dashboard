import React, { useEffect, useCallback, useState } from 'react';

import {
  type APILogEntry,
  APILogLevel,
  type APILogLevelType,
} from '../../services/storageManager.ts';
import { fromUnixTimestampMs } from '../../utils/luxonUtils';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon.tsx';

import { useLogContext } from './useLogContext.ts';

interface LogViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogView: React.FC<LogViewProps> = ({ isOpen, onClose }) => {
  const { logs, removeLog } = useLogContext();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Prevent background scroll when log is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // Format timestamp as readable string using Luxon
  const formatTimestamp = (timestamp: number) => {
    return fromUnixTimestampMs(timestamp).toLocaleString();
  };

  // Return Tailwind color classes based on log level
  const getLevelColor = (level: APILogLevelType) => {
    return level === APILogLevel.ERROR
      ? 'bg-status-error/20 text-status-error'
      : 'bg-status-warning/20 text-status-warning';
  };

  // Return icon name based on log level
  const getLevelIcon = (level: APILogLevelType) => {
    return level === APILogLevel.ERROR ? 'exclamation-triangle' : 'exclamation-circle';
  };

  // Position exactly over the tile grid area
  return (
    <Card
      variant="elevated"
      className="absolute inset-0 z-40 flex flex-col bg-surface-primary/90 border-theme-secondary overflow-hidden"
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-theme-secondary bg-surface-primary/95 z-10">
        <div className="flex items-center gap-3">
          <Icon name="clipboard-list" className="w-6 h-6 text-secondary" />
          <h2 className="text-xl font-semibold text-primary">API Logs</h2>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-status-error/20 text-status-error rounded">
              <Icon name="exclamation-triangle" className="w-3 h-3" />
              {logs.filter((log) => log.level === 'error').length} Errors
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-status-warning/20 text-status-warning rounded">
              <Icon name="exclamation-circle" className="w-3 h-3" />
              {logs.filter((log) => log.level === 'warning').length} Warnings
            </span>
          </div>
        </div>
        <Button variant="icon" onClick={onClose} aria-label="Close log view">
          <Icon name="x" className="w-5 h-5" />
        </Button>
      </div>
      {/* Log Table Container - scrollable content area */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-tertiary flex-1">
            <Icon name="check-circle" className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No API logs</p>
            <p className="text-sm">All API calls are working correctly</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-hide relative">
            <table className="w-full">
              <thead className="bg-surface-secondary/80 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    API Call
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    HTTP Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface-primary/80 divide-y divide-theme-secondary/50">
                {logs.map((log) => (
                  <LogRow
                    key={log.id}
                    log={log}
                    onRemove={() => removeLog(log.id)}
                    formatTimestamp={formatTimestamp}
                    getLevelColor={getLevelColor}
                    getLevelIcon={getLevelIcon}
                    showDetails={expandedIds.has(log.id)}
                    onToggleDetails={() =>
                      setExpandedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(log.id)) {
                          next.delete(log.id);
                        } else {
                          next.add(log.id);
                        }
                        return next;
                      })
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};

interface LogRowProps {
  log: APILogEntry;
  onRemove: () => void;
  formatTimestamp: (timestamp: number) => string;
  getLevelColor: (level: APILogLevelType) => string;
  getLevelIcon: (level: APILogLevelType) => string;
  showDetails: boolean;
  onToggleDetails: () => void;
}

const LogRow: React.FC<LogRowProps> = ({
  log,
  onRemove,
  formatTimestamp,
  getLevelColor,
  getLevelIcon,
  showDetails,
  onToggleDetails,
}) => {
  // Extract HTTP status code from details if present
  const httpStatus = log.details?.['status'] ?? log.details?.['httpStatus'] ?? '';

  // Prevent row click from firing when clicking remove button
  const handleRowClick = (e: React.MouseEvent) => {
    // If the click is on the remove button or inside it, do nothing
    if ((e.target as HTMLElement).closest('[data-log-remove]')) return;
    onToggleDetails();
  };

  return (
    <>
      <tr
        className={`hover:bg-surface-secondary/60 transition-colors duration-150 cursor-pointer ${showDetails ? 'bg-surface-secondary' : ''}`}
        onClick={handleRowClick}
        aria-expanded={showDetails}
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent<HTMLTableRowElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleRowClick(e as unknown as React.MouseEvent<HTMLTableRowElement, MouseEvent>);
          }
        }}
        style={{ outline: 'none' }}
      >
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getLevelColor(log.level)}`}
          >
            <Icon name={getLevelIcon(log.level)} className="w-3 h-3" />
            {log.level}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-primary">{formatTimestamp(log.timestamp)}</td>
        <td className="px-4 py-3 text-sm text-primary font-mono" data-testid={`log-row-${log.id}`}>
          {log.apiCall}
        </td>
        <td className="px-4 py-3 text-sm text-primary">
          {httpStatus ? httpStatus : <span className="text-tertiary">—</span>}
        </td>
        <td className="px-4 py-3 text-sm text-primary">{log.reason}</td>
        <td className="px-4 py-3 text-sm text-primary">
          {log.details ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDetails();
              }}
              className="underline text-interactive-primary hover:text-interactive-hover text-xs"
              aria-expanded={showDetails}
              aria-controls={`log-details-${log.id}`}
            >
              {showDetails ? 'Hide' : 'Show'}
            </button>
          ) : (
            <span className="text-tertiary">—</span>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          <Button
            variant="icon"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="hover:text-status-error hover:bg-status-error/10"
            aria-label={`Remove log entry for ${log.apiCall}`}
            data-log-remove
          >
            <Icon name="trash" className="w-4 h-4" />
          </Button>
        </td>
      </tr>
      {log.details && showDetails && (
        <tr id={`log-details-${log.id}`}>
          <td colSpan={7} className="px-4 pb-4 pt-0 text-xs text-secondary bg-surface-secondary">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
};
