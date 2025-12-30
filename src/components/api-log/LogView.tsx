import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';

import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';

import {
  type APILogEntry,
  APILogLevel,
  type APILogLevelType,
} from '../../services/storageManager.ts';
import { fromUnixTimestampMs } from '../../utils/luxonUtils';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon.tsx';

import { useLogContext } from './useLogContext.ts';

interface LogViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogView: React.FC<LogViewProps> = ({ isOpen, onClose }) => {
  const { logs, removeLog } = useLogContext();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Prevent background scroll when log is open
  useEffect(() => {
    if (isOpen) {
      // Find the parent main element and prevent its scrolling
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.style.overflow = 'hidden';
        // Prevent wheel events on main, but only if they're not from the log view
        const preventWheel = (e: WheelEvent) => {
          // Check if the event is coming from within the log view
          const logViewElement = document.querySelector('[data-log-view]');
          if (logViewElement?.contains(e.target as Node)) {
            // Allow scrolling within log view
            return;
          }
          // Prevent scrolling on main element
          e.preventDefault();
          e.stopPropagation();
        };
        const preventTouch = (e: TouchEvent) => {
          // Check if the event is coming from within the log view
          const logViewElement = document.querySelector('[data-log-view]');
          if (logViewElement?.contains(e.target as Node)) {
            // Allow scrolling within log view
            return;
          }
          // Prevent scrolling on main element
          e.preventDefault();
          e.stopPropagation();
        };
        mainElement.addEventListener('wheel', preventWheel, { passive: false, capture: true });
        mainElement.addEventListener('touchmove', preventTouch, { passive: false, capture: true });

        return () => {
          mainElement.style.overflow = '';
          mainElement.removeEventListener('wheel', preventWheel, { capture: true });
          mainElement.removeEventListener('touchmove', preventTouch, { capture: true });
        };
      }
      return undefined;
    } else {
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.style.overflow = '';
      }
      return undefined;
    }
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

  // Format timestamp as readable string using Luxon
  const formatTimestamp = useCallback((timestamp: number) => {
    return fromUnixTimestampMs(timestamp).toLocaleString();
  }, []);

  // Return Tailwind color classes based on log level
  const getLevelColor = useCallback((level: APILogLevelType) => {
    return level === APILogLevel.ERROR
      ? 'bg-status-error/20 text-status-error'
      : 'bg-status-warning/20 text-status-warning';
  }, []);

  // Return icon name based on log level
  const getLevelIcon = useCallback((level: APILogLevelType) => {
    return level === APILogLevel.ERROR ? 'exclamation-triangle' : 'exclamation-circle';
  }, []);

  // Define columns
  const columns = useMemo<ColumnDef<APILogEntry>[]>(
    () => [
      {
        accessorKey: 'level',
        header: 'Level',
        cell: ({ row }) => {
          const level = row.original.level;
          return (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getLevelColor(level)}`}
            >
              <Icon name={getLevelIcon(level)} className="w-3 h-3" />
              {level}
            </span>
          );
        },
      },
      {
        accessorKey: 'timestamp',
        header: 'Time',
        cell: ({ row }) => {
          return (
            <span className="text-sm text-primary">{formatTimestamp(row.original.timestamp)}</span>
          );
        },
      },
      {
        accessorKey: 'apiCall',
        header: 'API Call',
        cell: ({ row }) => {
          return (
            <span
              className="text-sm text-primary font-mono"
              data-testid={`log-row-${row.original.id}`}
            >
              {row.original.apiCall}
            </span>
          );
        },
      },
      {
        id: 'httpCode',
        header: 'HTTP Code',
        cell: ({ row }) => {
          const httpStatus =
            row.original.details?.['status'] ?? row.original.details?.['httpStatus'] ?? '';
          return (
            <span className="text-sm text-primary">
              {httpStatus ? httpStatus : <span className="text-tertiary">—</span>}
            </span>
          );
        },
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => {
          return <span className="text-sm text-primary">{row.original.reason}</span>;
        },
      },
      {
        id: 'details',
        header: 'Details',
        cell: ({ row }) => {
          const hasDetails = !!row.original.details;
          const isExpanded = expandedIds.has(row.original.id);
          return (
            <span className="text-sm text-primary">
              {hasDetails ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(row.original.id)) {
                        next.delete(row.original.id);
                      } else {
                        next.add(row.original.id);
                      }
                      return next;
                    });
                  }}
                  className="underline text-interactive-primary hover:text-interactive-hover text-xs"
                  aria-expanded={isExpanded}
                  aria-controls={`log-details-${row.original.id}`}
                >
                  {isExpanded ? 'Hide' : 'Show'}
                </button>
              ) : (
                <span className="text-tertiary">—</span>
              )}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          return (
            <div className="flex justify-end">
              <Button
                variant="icon"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeLog(row.original.id);
                }}
                className="hover:text-status-error hover:bg-status-error/10"
                aria-label={`Remove log entry for ${row.original.apiCall}`}
                data-log-remove
              >
                <Icon name="trash" className="w-4 h-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [expandedIds, removeLog, formatTimestamp, getLevelColor, getLevelIcon],
  );

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowId: (row) => row.id,
    getRowCanExpand: (row) => !!row.original.details,
    state: {
      expanded: Object.fromEntries(Array.from(expandedIds).map((id) => [id, true])),
    },
    onExpandedChange: (updater) => {
      if (typeof updater === 'function') {
        const currentExpanded = Object.fromEntries(Array.from(expandedIds).map((id) => [id, true]));
        const newExpanded = updater(currentExpanded);
        setExpandedIds(
          new Set(
            Object.keys(newExpanded).filter((key) => (newExpanded as Record<string, boolean>)[key]),
          ),
        );
      } else {
        setExpandedIds(
          new Set(Object.keys(updater).filter((key) => (updater as Record<string, boolean>)[key])),
        );
      }
    },
  });

  if (!isOpen) return null;

  // Position exactly over the tile grid area (absolute, not fixed)
  return (
    <div
      data-log-view
      className="absolute inset-0 z-40 flex flex-col bg-surface-primary overflow-hidden"
      onWheel={(e) => {
        // Prevent scroll propagation to parent
        e.stopPropagation();
      }}
      onTouchMove={(e) => {
        // Prevent touch scroll propagation to parent
        e.stopPropagation();
      }}
    >
      {/* Header - solid background */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-theme-secondary bg-surface-primary z-10">
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
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto scrollbar-hide relative"
            onWheel={(e) => {
              // Always stop propagation to prevent parent scrolling
              e.stopPropagation();

              const target = e.currentTarget;
              const { scrollTop, scrollHeight, clientHeight } = target;
              const isAtTop = scrollTop === 0;
              const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 1;

              // If at boundaries and trying to scroll further, prevent default
              if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                e.preventDefault();
              }
            }}
            onTouchMove={(e) => {
              // Prevent touch scroll propagation
              e.stopPropagation();
            }}
          >
            <table className="w-full">
              <thead className="bg-surface-secondary sticky top-0 z-10">
                <tr>
                  {table.getHeaderGroups().map((headerGroup) =>
                    headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody className="bg-surface-primary divide-y divide-theme-secondary/50">
                {table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr
                      className={`hover:bg-surface-secondary/60 transition-colors duration-150 cursor-pointer ${
                        expandedIds.has(row.original.id) ? 'bg-surface-secondary' : ''
                      }`}
                      onClick={() => {
                        setExpandedIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(row.original.id)) {
                            next.delete(row.original.id);
                          } else {
                            next.add(row.original.id);
                          }
                          return next;
                        });
                      }}
                      aria-expanded={expandedIds.has(row.original.id)}
                      tabIndex={0}
                      onKeyDown={(e: React.KeyboardEvent<HTMLTableRowElement>) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setExpandedIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(row.original.id)) {
                              next.delete(row.original.id);
                            } else {
                              next.add(row.original.id);
                            }
                            return next;
                          });
                        }
                      }}
                      style={{ outline: 'none' }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {row.original.details && expandedIds.has(row.original.id) && (
                      <tr id={`log-details-${row.original.id}`}>
                        <td
                          colSpan={table.getAllColumns().length}
                          className="px-4 pb-4 pt-0 text-xs text-secondary bg-surface-secondary"
                        >
                          <pre className="whitespace-pre-wrap break-all">
                            {JSON.stringify(row.original.details, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
