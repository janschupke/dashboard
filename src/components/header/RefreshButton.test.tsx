import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { RefreshButton } from './RefreshButton';

describe('RefreshButton', () => {
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    mockOnRefresh.mockClear();
  });

  it('renders refresh button with correct attributes', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} isRefreshing={false} />);

    const button = screen.getByTestId('refresh-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'header.refreshAll');
    expect(button).toHaveAttribute('title', 'header.refreshShortcut');
  });

  it('calls onRefresh when clicked', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} isRefreshing={false} />);

    const button = screen.getByTestId('refresh-button');
    fireEvent.click(button);

    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows loading icon and is disabled when refreshing', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} isRefreshing={true} />);

    const button = screen.getByTestId('refresh-button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');

    // Check that loading icon is shown
    expect(button).toHaveTextContent('⏳');
  });

  it('shows refresh icon when not refreshing', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} isRefreshing={false} />);

    const button = screen.getByTestId('refresh-button');
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveClass('opacity-50', 'cursor-not-allowed');

    // Check that refresh icon is shown
    expect(button).toHaveTextContent('↻');
  });

  it('is disabled when disabled prop is true', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} isRefreshing={false} disabled={true} />);

    const button = screen.getByTestId('refresh-button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('does not call onRefresh when disabled', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} isRefreshing={false} disabled={true} />);

    const button = screen.getByTestId('refresh-button');
    fireEvent.click(button);

    expect(mockOnRefresh).not.toHaveBeenCalled();
  });

  it('does not call onRefresh when refreshing', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} isRefreshing={true} />);

    const button = screen.getByTestId('refresh-button');
    fireEvent.click(button);

    expect(mockOnRefresh).not.toHaveBeenCalled();
  });
});
