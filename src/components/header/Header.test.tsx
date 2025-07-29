import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AuthProvider } from '../../contexts/AuthContext';
import { MockToastProvider } from '../../test/mocks/componentMocks';
import { LogProvider } from '../api-log/LogContext';

import { Header } from './Header';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <LogProvider>
        <MockToastProvider>{ui}</MockToastProvider>
      </LogProvider>
    </AuthProvider>,
  );
}

describe('Header', () => {
  const mockToggleLogView = vi.fn();
  const mockToggleTheme = vi.fn();
  const mockToggleCollapse = vi.fn();
  const mockRefreshAllTiles = vi.fn();

  beforeEach(() => {
    mockToggleLogView.mockClear();
    mockToggleTheme.mockClear();
    mockToggleCollapse.mockClear();
    mockRefreshAllTiles.mockClear();
  });

  it('renders header with all buttons', () => {
    renderWithProviders(
      <Header
        isLogViewOpen={false}
        toggleLogView={mockToggleLogView}
        toggleTheme={mockToggleTheme}
        theme="light"
        toggleCollapse={mockToggleCollapse}
        tilesCount={5}
        refreshAllTiles={mockRefreshAllTiles}
        isRefreshing={false}
      />,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('5 tiles')).toBeInTheDocument();
    expect(screen.getByTestId('collapse-button')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    expect(screen.getByTestId('theme-button')).toBeInTheDocument();
  });

  it('renders refresh button when refreshAllTiles is provided', () => {
    renderWithProviders(
      <Header
        isLogViewOpen={false}
        toggleLogView={mockToggleLogView}
        toggleTheme={mockToggleTheme}
        theme="light"
        toggleCollapse={mockToggleCollapse}
        tilesCount={3}
        refreshAllTiles={mockRefreshAllTiles}
        isRefreshing={false}
      />,
    );

    const refreshButton = screen.getByTestId('refresh-button');
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toHaveAttribute('aria-label', 'Refresh all tiles');
    expect(refreshButton).toHaveAttribute('title', 'Refresh all tiles (R)');
  });

  it('calls refreshAllTiles when refresh button is clicked', () => {
    renderWithProviders(
      <Header
        isLogViewOpen={false}
        toggleLogView={mockToggleLogView}
        toggleTheme={mockToggleTheme}
        theme="light"
        toggleCollapse={mockToggleCollapse}
        tilesCount={3}
        refreshAllTiles={mockRefreshAllTiles}
        isRefreshing={false}
      />,
    );

    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);

    expect(mockRefreshAllTiles).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when refreshing', () => {
    renderWithProviders(
      <Header
        isLogViewOpen={false}
        toggleLogView={mockToggleLogView}
        toggleTheme={mockToggleTheme}
        theme="light"
        toggleCollapse={mockToggleCollapse}
        tilesCount={3}
        refreshAllTiles={mockRefreshAllTiles}
        isRefreshing={true}
      />,
    );

    const refreshButton = screen.getByTestId('refresh-button');
    expect(refreshButton).toBeDisabled();
    expect(refreshButton).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('calls toggleCollapse when collapse button is clicked', () => {
    renderWithProviders(
      <Header
        isLogViewOpen={false}
        toggleLogView={mockToggleLogView}
        toggleTheme={mockToggleTheme}
        theme="light"
        toggleCollapse={mockToggleCollapse}
        tilesCount={3}
        refreshAllTiles={mockRefreshAllTiles}
        isRefreshing={false}
      />,
    );

    const collapseButton = screen.getByTestId('collapse-button');
    fireEvent.click(collapseButton);

    expect(mockToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it('calls toggleTheme when theme button is clicked', () => {
    renderWithProviders(
      <Header
        isLogViewOpen={false}
        toggleLogView={mockToggleLogView}
        toggleTheme={mockToggleTheme}
        theme="light"
        toggleCollapse={mockToggleCollapse}
        tilesCount={3}
        refreshAllTiles={mockRefreshAllTiles}
        isRefreshing={false}
      />,
    );

    const themeButton = screen.getByTestId('theme-button');
    fireEvent.click(themeButton);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('shows correct theme icon based on theme prop', () => {
    const { rerender } = renderWithProviders(
      <Header
        isLogViewOpen={false}
        toggleLogView={mockToggleLogView}
        toggleTheme={mockToggleTheme}
        theme="light"
        toggleCollapse={mockToggleCollapse}
        tilesCount={3}
        refreshAllTiles={mockRefreshAllTiles}
        isRefreshing={false}
      />,
    );

    // Light theme should show moon icon
    const themeButton = screen.getByTestId('theme-button');
    expect(themeButton).toHaveTextContent('🌙');

    // Rerender with dark theme
    rerender(
      <AuthProvider>
        <LogProvider>
          <MockToastProvider>
            <Header
              isLogViewOpen={false}
              toggleLogView={mockToggleLogView}
              toggleTheme={mockToggleTheme}
              theme="dark"
              toggleCollapse={mockToggleCollapse}
              tilesCount={3}
              refreshAllTiles={mockRefreshAllTiles}
              isRefreshing={false}
            />
          </MockToastProvider>
        </LogProvider>
      </AuthProvider>,
    );

    // Dark theme should show sun icon
    expect(themeButton).toHaveTextContent('☀');
  });

  it('handles missing refreshAllTiles gracefully', () => {
    renderWithProviders(
      <Header
        isLogViewOpen={false}
        toggleLogView={mockToggleLogView}
        toggleTheme={mockToggleTheme}
        theme="light"
        toggleCollapse={mockToggleCollapse}
        tilesCount={3}
        isRefreshing={false}
      />,
    );

    const refreshButton = screen.getByTestId('refresh-button');
    expect(refreshButton).toBeInTheDocument();

    // Should not throw when clicked without refreshAllTiles
    fireEvent.click(refreshButton);
  });
});
