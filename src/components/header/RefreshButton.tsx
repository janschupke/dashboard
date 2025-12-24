import { useTranslation } from 'react-i18next';

import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  isRefreshing: boolean;
  disabled?: boolean;
}

// TODO: Animated icon is small and ugly
export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  isRefreshing,
  disabled = false,
}) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="icon"
      onClick={() => void onRefresh()}
      disabled={disabled || isRefreshing}
      aria-label={t('header.refreshAll')}
      title={t('header.refreshShortcut')}
      data-testid="refresh-button"
    >
      <Icon name={isRefreshing ? 'hourglass' : 'refresh'} size="md" />
    </Button>
  );
};
