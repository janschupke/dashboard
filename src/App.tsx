import { useEffect } from 'react';

import { LogProvider } from './components/api-log/LogContext';
import { Overlay } from './components/overlay/Overlay';
import { setupGlobalErrorHandling } from './services/apiErrorInterceptor';

function App() {
  useEffect(() => {
    // Set up global error handling to prevent console errors
    setupGlobalErrorHandling();
  }, []);

  return (
    <LogProvider>
      <div data-testid="app-root">
        <Overlay />
      </div>
    </LogProvider>
  );
}

export default App;
