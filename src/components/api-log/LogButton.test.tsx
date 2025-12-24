import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { storageManager } from '../../services/storageManager';

import { LogButton } from './LogButton';
import { LogProvider } from './LogContext';
import { LogContext } from './LogContextDef';

function renderWithProvider(ui: React.ReactElement) {
  return render(<LogProvider>{ui}</LogProvider>);
}

describe('LogButton', () => {
  beforeEach(() => {
    storageManager.clearLogs();
  });
  afterEach(() => {
    storageManager.clearLogs();
  });

  it('renders with no bubbles when there are no logs', () => {
    renderWithProvider(<LogButton isOpen={false} onToggle={() => {}} />);
    expect(screen.getByText('log.button')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows error and warning bubbles with correct counts', () => {
    storageManager.addLog({ level: 'error', apiCall: 'A', reason: 'fail', details: {} });
    storageManager.addLog({ level: 'warning', apiCall: 'B', reason: 'warn', details: {} });
    renderWithProvider(<LogButton isOpen={false} onToggle={() => {}} />);
    expect(screen.getByTestId('log-error-bubble')).toHaveTextContent('1');
    expect(screen.getByTestId('log-warning-bubble')).toHaveTextContent('1');
  });

  it('updates bubbles when logs are added via context', () => {
    function AddLogButton() {
      const { addLog } = React.useContext(LogContext)!;
      return (
        <button
          onClick={() => addLog({ level: 'error', apiCall: 'C', reason: 'fail', details: {} })}
        >
          Add Error
        </button>
      );
    }
    renderWithProvider(
      <>
        <LogButton isOpen={false} onToggle={() => {}} />
        <AddLogButton />
      </>,
    );
    fireEvent.click(screen.getByText('Add Error'));
    expect(screen.getByTestId('log-error-bubble')).toHaveTextContent('1');
  });

  it('updates bubbles when logs are added via storageManager directly', async () => {
    renderWithProvider(<LogButton isOpen={false} onToggle={() => {}} />);
    storageManager.addLog({ level: 'error', apiCall: 'D', reason: 'fail', details: {} });
    expect(await screen.findByTestId('log-error-bubble')).toHaveTextContent('1');
  });

  it('removes bubbles when logs are cleared', async () => {
    storageManager.addLog({ level: 'error', apiCall: 'E', reason: 'fail', details: {} });
    renderWithProvider(<LogButton isOpen={false} onToggle={() => {}} />);
    expect(screen.getByTestId('log-error-bubble')).toHaveTextContent('1');
    storageManager.clearLogs();
    await screen.findByText('log.button'); // wait for update
    expect(screen.queryByTestId('log-error-bubble')).toBeNull();
  });
});
