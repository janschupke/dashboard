import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<App />);
    // You may need to add data-testid="app-root" to your App root element for this to work
    expect(getByTestId('app-root')).toBeInTheDocument();
  });
});
