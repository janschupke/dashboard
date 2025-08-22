import { LogProvider } from '../api-log/LogContext';
import { Overlay } from '../overlay/Overlay';

function AuthenticatedApp() {
  return (
    <LogProvider>
      <div data-testid="app-root">
        <Overlay />
      </div>
    </LogProvider>
  );
}

export { AuthenticatedApp };
