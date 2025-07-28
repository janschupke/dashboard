import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CollapseButton } from './CollapseButton';

describe('CollapseButton', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it('renders collapse button with correct attributes', () => {
    render(<CollapseButton onToggle={mockOnToggle} />);

    const button = screen.getByTestId('collapse-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Toggle sidebar');
  });

  it('calls onToggle when clicked', () => {
    render(<CollapseButton onToggle={mockOnToggle} />);

    const button = screen.getByTestId('collapse-button');
    fireEvent.click(button);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('shows menu icon', () => {
    render(<CollapseButton onToggle={mockOnToggle} />);

    const button = screen.getByTestId('collapse-button');
    expect(button).toHaveTextContent('☰');
  });

  it('is disabled when disabled prop is true', () => {
    render(<CollapseButton onToggle={mockOnToggle} disabled={true} />);

    const button = screen.getByTestId('collapse-button');
    expect(button).toBeDisabled();
  });

  it('does not call onToggle when disabled', () => {
    render(<CollapseButton onToggle={mockOnToggle} disabled={true} />);

    const button = screen.getByTestId('collapse-button');
    fireEvent.click(button);

    expect(mockOnToggle).not.toHaveBeenCalled();
  });
});
