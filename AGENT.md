# Agent Guidelines

## Project Overview

This is a React-based dashboard application that displays various data tiles including cryptocurrency prices, weather information, precious metals, and more. The project uses TypeScript, Vite, and follows a modular architecture.

## Key Architecture Principles

### Data Fetching

- All data fetching must go through the `DataFetcher` class
- API error logging must be handled through `StorageManager`
- Rate limit errors should be caught in the dataFetcher layer rather than in mappers
- Transform calls should be wrapped in try/catch
- API hooks should not include custom data fetching or error logging logic or other extraneous code
- API calls should use defined proxies instead of hardcoded URLs
- API hooks should build URLs using the existing `buildUrl` function and follow existing implementation patterns rather than hardcoding URLs directly

### Tile Implementation

- Each tile should use the `useTileData` hook for data fetching
- Tiles should define their refresh intervals in the `REFRESH_INTERVALS` constants
- Tiles should use `GenericTile` as a wrapper component
- Tile content should be separated into individual components
- All tiles should handle loading, error, and success states consistently

### Error Handling

- Use the centralized error handling through `StorageManager`
- Log API errors with appropriate context
- Handle network errors gracefully
- Provide user-friendly error messages

### Type Safety

- Use TypeScript interfaces for all data structures
- Define proper types for API responses
- Use generic types where appropriate
- Maintain strict type checking

### Code Organization

- Keep components small and focused
- Use proper separation of concerns
- Follow the established file structure
- Use consistent naming conventions

## Implementation Guidelines

### Adding New Tiles

1. Create the tile implementation in `src/components/tile-implementations/`
2. Define the tile data types
3. Create the API hook using the established pattern
4. Add the tile to the tile factory registry
5. Define refresh intervals in constants
6. Add proper error handling

### API Integration

1. Define the API endpoint in `apiEndpoints.ts`
2. Create the API hook following the established pattern
3. Use `DataFetcher` for all data fetching
4. Handle errors through `StorageManager`
5. Use proper TypeScript types

### Testing

- Write unit tests for all components
- Test error scenarios
- Mock external API calls
- Test data transformation logic

## Common Patterns

### Tile Component Structure

```tsx
export const YourTile = ({ tile, meta, ...rest }) => {
  const { getYourData } = useYourApi();
  const params = useMemo(
    () => ({
      /* params */
    }),
    [],
  );
  const refreshConfig = useMemo(
    () => ({
      refreshInterval: REFRESH_INTERVALS.TILES.YOUR_TILE,
      enableAutoRefresh: true,
      refreshOnFocus: true,
    }),
    [],
  );

  const { data, status, lastUpdated, manualRefresh, isLoading } = useTileData(
    getYourData,
    tile.id,
    params,
    refreshConfig,
  );

  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated?.toISOString()}
      data={data}
      onManualRefresh={manualRefresh}
      isLoading={isLoading}
      {...rest}
    >
      <YourTileContent data={data} />
    </GenericTile>
  );
};
```

### API Hook Pattern

```tsx
export function useYourApi() {
  const { dataFetcher } = useDataServices();
  const getYourData = useCallback(
    async (tileId: string, params: YourParams): Promise<TileConfig<YourTileData>> => {
      const url = buildApiUrl<YourParams>(YOUR_ENDPOINT, params);
      return dataFetcher.fetchAndMap(
        async () => {
          const response = await fetchWithError(url);
          const data = await response.json();
          return { data, status: response.status };
        },
        tileId,
        TileType.YOUR_TILE,
        { apiCall: TileApiCallTitle.YOUR_API },
        url,
      );
    },
    [dataFetcher],
  );
  return { getYourData };
}
```

## Best Practices

### Performance

- Use React.memo for expensive components
- Implement proper cleanup in useEffect hooks
- Use useMemo and useCallback appropriately
- Avoid unnecessary re-renders

### Accessibility

- Provide proper ARIA labels
- Ensure keyboard navigation works
- Use semantic HTML elements
- Test with screen readers

### Security

- Never expose API keys in client-side code
- Validate all user inputs
- Use HTTPS for all API calls
- Implement proper CORS handling

### Maintainability

- Write clear, self-documenting code
- Use consistent naming conventions
- Add proper comments for complex logic
- Keep functions small and focused

## Error Scenarios to Handle

### Network Errors

- Connection timeouts
- Rate limiting
- Server errors (5xx)
- Client errors (4xx)

### Data Validation

- Invalid API responses
- Missing required fields
- Type mismatches
- Malformed data

### User Experience

- Loading states
- Error states with retry options
- Stale data indicators
- Graceful degradation

## Testing Strategy

### Unit Tests

- Test individual components
- Mock external dependencies
- Test error scenarios
- Verify data transformation

### Integration Tests

- Test API integration
- Test data flow between components
- Test user interactions
- Test error handling

### End-to-End Tests

- Test complete user workflows
- Test real API responses
- Test performance under load
- Test accessibility features

## Deployment Considerations

### Environment Variables

- Configure API keys properly
- Set up different environments
- Handle sensitive data securely
- Use proper environment validation

### Performance Optimization

- Implement code splitting
- Optimize bundle size
- Use proper caching strategies
- Monitor performance metrics

### Monitoring

- Set up error tracking
- Monitor API usage
- Track user interactions
- Monitor performance metrics
