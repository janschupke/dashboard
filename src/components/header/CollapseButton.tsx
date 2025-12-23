import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export interface CollapseButtonProps {
  onToggle: () => void;
  disabled?: boolean;
}

export const CollapseButton: React.FC<CollapseButtonProps> = ({ onToggle, disabled = false }) => (
  <Button
    variant="icon"
    onClick={onToggle}
    disabled={disabled}
    aria-label="Toggle sidebar"
    data-testid="collapse-button"
  >
    <Icon name="menu" size="md" />
  </Button>
);
