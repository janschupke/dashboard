import { Icon } from '../ui/Icon';

export interface ThemeButtonProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  disabled?: boolean;
}

export const ThemeButton: React.FC<ThemeButtonProps> = ({ theme, onToggle, disabled = false }) => (
  <button
    onClick={onToggle}
    disabled={disabled}
    className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
    aria-label="Toggle theme"
    data-testid="theme-button"
  >
    {theme === 'dark' ? <Icon name="sun" size="md" /> : <Icon name="moon" size="md" />}
  </button>
);
