import { Icon } from '../ui/Icon';

import { useLogContext } from './useLogContext';

interface LogButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const LogButton: React.FC<LogButtonProps> = ({ isOpen, onToggle }) => {
  const { logs } = useLogContext();
  const errorCount = logs.filter((log) => log.level === 'error').length;
  const warningCount = logs.filter((log) => log.level === 'warning').length;

  return (
    <button
      onClick={onToggle}
      className={`
        relative flex items-center gap-2 px-3 py-2 rounded-lg
        bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
        transition-colors duration-200 focus:outline-none focus:ring-2
        focus:ring-blue-500 dark:focus:ring-blue-400
        ${isOpen ? 'bg-blue-100 dark:bg-blue-900' : ''}
      `}
      aria-label={`API Logs (${errorCount} errors, ${warningCount} warnings)`}
      title={`API Logs - ${errorCount} errors, ${warningCount} warnings`}
    >
      <Icon name="clipboard-list" className="w-4 h-4" />
      <span className="text-sm font-medium">Logs</span>

      {(errorCount > 0 || warningCount > 0) && (
        <div className="flex gap-1">
          {errorCount > 0 && (
            <span
              data-testid="log-error-bubble"
              className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
            >
              {errorCount}
            </span>
          )}
          {warningCount > 0 && (
            <span
              data-testid="log-warning-bubble"
              className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-yellow-500 rounded-full"
            >
              {warningCount}
            </span>
          )}
        </div>
      )}
    </button>
  );
};
