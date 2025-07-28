import { Icon } from '../ui/Icon';

export interface CollapseButtonProps {
  onToggle: () => void;
  disabled?: boolean;
}

export const CollapseButton: React.FC<CollapseButtonProps> = ({ onToggle, disabled = false }) => (
  <button
    onClick={onToggle}
    disabled={disabled}
    className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
    aria-label="Toggle sidebar"
    data-testid="collapse-button"
  >
    <Icon name="menu" size="md" />
  </button>
);
