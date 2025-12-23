import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export interface ThemeButtonProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  disabled?: boolean;
}

export const ThemeButton: React.FC<ThemeButtonProps> = ({ theme, onToggle, disabled = false }) => (
  <Button
    variant="icon"
    onClick={onToggle}
    disabled={disabled}
    aria-label="Toggle theme"
    data-testid="theme-button"
  >
    {theme === 'dark' ? <Icon name="sun" size="md" /> : <Icon name="moon" size="md" />}
  </Button>
);
