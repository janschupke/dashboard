// API keys are now handled by the proxy functions on the server side
// This type is kept for backward compatibility but should not be used
export type ApiKeyConfig = Record<string, never>;

export function getApiKeys(): ApiKeyConfig {
  // API keys are now handled by the proxy functions
  // The frontend should be agnostic of API keys
  return {};
}
