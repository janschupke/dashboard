import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ThemeButton } from './ThemeButton';

describe('ThemeButton', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it('renders theme button with correct attributes', () => {
    render(<ThemeButton theme="light" onToggle={mockOnToggle} />);

    const button = screen.getByTestId('theme-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Toggle theme');
  });

  it('calls onToggle when clicked', () => {
    render(<ThemeButton theme="light" onToggle={mockOnToggle} />);

    const button = screen.getByTestId('theme-button');
    fireEvent.click(button);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('shows moon icon when theme is light', () => {
    render(<ThemeButton theme="light" onToggle={mockOnToggle} />);

    const button = screen.getByTestId('theme-button');
    expect(button).toHaveTextContent('🌙');
  });

  it('shows sun icon when theme is dark', () => {
    render(<ThemeButton theme="dark" onToggle={mockOnToggle} />);

    const button = screen.getByTestId('theme-button');
    expect(button).toHaveTextContent('☀');
  });

  it('is disabled when disabled prop is true', () => {
    render(<ThemeButton theme="light" onToggle={mockOnToggle} disabled={true} />);

    const button = screen.getByTestId('theme-button');
    expect(button).toBeDisabled();
  });

  it('does not call onToggle when disabled', () => {
    render(<ThemeButton theme="light" onToggle={mockOnToggle} disabled={true} />);

    const button = screen.getByTestId('theme-button');
    fireEvent.click(button);

    expect(mockOnToggle).not.toHaveBeenCalled();
  });
});
