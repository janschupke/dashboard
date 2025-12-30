import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { storageManager } from '../../services/storageManager';

import { LogProvider } from './LogContext';
import { LogContext } from './LogContextDef';
import { LogView } from './LogView';

function renderWithProvider(ui: React.ReactElement) {
  return render(<LogProvider>{ui}</LogProvider>);
}

describe('LogView', () => {
  beforeEach(() => {
    storageManager.clearLogs();
  });
  afterEach(() => {
    storageManager.clearLogs();
  });

  it('shows empty state when there are no logs', () => {
    renderWithProvider(<LogView isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('No API logs')).toBeInTheDocument();
  });

  it('shows log entries and correct error/warning counts', () => {
    storageManager.addLog({ level: 'error', apiCall: 'A', reason: 'fail', details: {} });
    storageManager.addLog({ level: 'warning', apiCall: 'B', reason: 'warn', details: {} });
    renderWithProvider(<LogView isOpen={true} onClose={() => {}} />);
    const logs = storageManager.getLogs();
    const log1 = logs[1];
    const log0 = logs[0];
    if (!log1 || !log0) throw new Error('Logs not found');
    expect(screen.getByTestId(`log-row-${log1.id}`)).toHaveTextContent('A');
    expect(screen.getByTestId(`log-row-${log0.id}`)).toHaveTextContent('B');
    expect(screen.getByText('1 Errors')).toBeInTheDocument();
    expect(screen.getByText('1 Warnings')).toBeInTheDocument();
  });

  it('updates log table when logs are added via context', () => {
    function AddLogButton() {
      const context = React.useContext(LogContext);
      if (!context) throw new Error('LogContext not found');
      const { addLog } = context;
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
        <LogView isOpen={true} onClose={() => {}} />
        <AddLogButton />
      </>,
    );
    fireEvent.click(screen.getByText('Add Error'));
    const logs = storageManager.getLogs();
    const firstLog = logs[0];
    if (!firstLog) throw new Error('Log not found');
    expect(screen.getByTestId(`log-row-${firstLog.id}`)).toHaveTextContent('C');
  });

  it('updates log table when logs are added via storageManager directly', async () => {
    renderWithProvider(<LogView isOpen={true} onClose={() => {}} />);
    storageManager.addLog({ level: 'error', apiCall: 'D', reason: 'fail', details: {} });
    const logs = storageManager.getLogs();
    const firstLog = logs[0];
    if (!firstLog) throw new Error('Log not found');
    expect(await screen.findByTestId(`log-row-${firstLog.id}`)).toHaveTextContent('D');
  });

  it('removes log entries when logs are cleared', async () => {
    storageManager.addLog({ level: 'error', apiCall: 'E', reason: 'fail', details: {} });
    renderWithProvider(<LogView isOpen={true} onClose={() => {}} />);
    const logs = storageManager.getLogs();
    const firstLog = logs[0];
    if (!firstLog) throw new Error('Log not found');
    expect(screen.getByTestId(`log-row-${firstLog.id}`)).toHaveTextContent('E');
    storageManager.clearLogs();
    await screen.findByText('No API logs'); // wait for update
    expect(screen.queryByTestId(`log-row-${firstLog.id}`)).toBeNull();
    expect(screen.getByText('No API logs')).toBeInTheDocument();
  });

  it('closes when onClose is called', () => {
    storageManager.addLog({ level: 'error', apiCall: 'F', reason: 'fail', details: {} });
    const onClose = vi.fn();
    renderWithProvider(<LogView isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close log view'));
    expect(onClose).toHaveBeenCalled();
  });
});
