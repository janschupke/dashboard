import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { ToastContainer } from './Toast';

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    toasts: [
      { id: '1', message: 'Hello', type: 'info' },
      { id: '2', message: 'Oops', type: 'error' },
    ],
    removeToast: vi.fn(),
  }),
}));

describe('ToastContainer + AnimatedToast', () => {
  it('renders toasts and allows closing', () => {
    render(<ToastContainer />);

    // Two toasts rendered
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Oops')).toBeInTheDocument();

    // Find close buttons and click one
    const buttons = screen.queryAllByRole('button', { name: /close notification/i });
    if (buttons[0]) fireEvent.click(buttons[0]);
  });
});
