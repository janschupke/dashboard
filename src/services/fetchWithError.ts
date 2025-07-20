export async function fetchWithError(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw Object.assign(new Error(`HTTP ${response.status}: ${response.statusText}`), {
      status: response.status,
    });
  }
  return response;
}
