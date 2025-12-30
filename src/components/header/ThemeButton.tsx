import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';

import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export interface ThemeButtonProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  disabled?: boolean;
}

export const ThemeButton: React.FC<ThemeButtonProps> = ({ theme, onToggle, disabled = false }) => {
  const { t } = useTranslation();
  return (
    <>
      <Button
        variant="icon"
        onClick={onToggle}
        disabled={disabled}
        aria-label={t('header.toggleTheme')}
        data-tooltip-id="theme-button-tooltip"
        data-tooltip-content={t('header.toggleTheme')}
        data-testid="theme-button"
      >
        {theme === 'dark' ? <Icon name="sun" size="md" /> : <Icon name="moon" size="md" />}
      </Button>
      <Tooltip id="theme-button-tooltip" />
    </>
  );
};
