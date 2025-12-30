import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';

import { Button } from '../ui/Button';
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
  const { t } = useTranslation();

  return (
    <>
      <Button
        variant="secondary"
        onClick={onToggle}
        className={`relative ${isOpen ? 'bg-accent-muted' : ''}`}
        aria-label={t('log.aria', { errorCount, warningCount })}
        data-tooltip-id="log-button-tooltip"
        data-tooltip-content={t('log.title', { errorCount, warningCount })}
      >
        <Icon name="clipboard-list" className="w-4 h-4" />
        <span className="text-sm font-medium">{t('log.button')}</span>

        {(errorCount > 0 || warningCount > 0) && (
          <div className="flex gap-1">
            {errorCount > 0 && (
              <span
                data-testid="log-error-bubble"
                className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-theme-inverse bg-status-error rounded-full"
              >
                {errorCount}
              </span>
            )}
            {warningCount > 0 && (
              <span
                data-testid="log-warning-bubble"
                className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-theme-inverse bg-status-warning rounded-full"
              >
                {warningCount}
              </span>
            )}
          </div>
        )}
      </Button>
      <Tooltip id="log-button-tooltip" />
    </>
  );
};
