import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { TestProviders } from './TestProviders';

import type { RenderOptions } from '@testing-library/react';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

const customRender = (ui: React.ReactElement, options?: CustomRenderOptions) => {
  const Wrapper = options?.wrapper || TestProviders;
  return render(ui, { wrapper: Wrapper, ...options });
};

export { customRender as render, screen, fireEvent };
export type { RenderOptions };
