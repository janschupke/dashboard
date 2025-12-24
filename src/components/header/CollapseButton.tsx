import { useTranslation } from 'react-i18next';

import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export interface CollapseButtonProps {
  onToggle: () => void;
  disabled?: boolean;
}

export const CollapseButton: React.FC<CollapseButtonProps> = ({ onToggle, disabled = false }) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="icon"
      onClick={onToggle}
      disabled={disabled}
      aria-label={t('header.toggleSidebar')}
      data-testid="collapse-button"
    >
      <Icon name="menu" size="md" />
    </Button>
  );
};
