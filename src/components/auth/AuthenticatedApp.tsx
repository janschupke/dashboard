import React from 'react';

import { LogProvider } from '../api-log/LogContext';
import { Overlay } from '../overlay/Overlay';

function AuthenticatedApp(): React.ReactNode {
  return (
    <LogProvider>
      <div data-testid="app-root">
        <Overlay />
      </div>
    </LogProvider>
  );
}

export { AuthenticatedApp };
