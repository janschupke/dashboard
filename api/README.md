# API Proxy Functions

This directory contains Vercel serverless functions that act as CORS proxies for external APIs used by the dashboard tiles.

## Overview

**Development vs Production Setup:**

- **Development**: Vite proxies requests directly to external APIs for simplicity and speed
- **Production**: These serverless functions handle CORS, error handling, and response formatting

## How It Works

### Development (Vite Proxy)

- Vite forwards `/api/*` requests directly to external APIs
- No local API server needed
- Fast and simple development setup

### Production (Vercel Functions)

Each function:

- Receives requests at `/api/{service-name}/*`
- Forwards them to the corresponding external API
- Returns the response with proper CORS headers
- Preserves all query parameters and request methods

## Available APIs

| Function             | External API                   | Used By                 | Status |
| -------------------- | ------------------------------ | ----------------------- | ------ |
| `alpha-vantage.ts`   | https://www.alphavantage.co    | GDX ETF tile            | ✅     |
| `coingecko.ts`       | https://api.coingecko.com      | Cryptocurrency tile     | ✅     |
| `cwb.ts`             | https://opendata.cwb.gov.tw    | Typhoon tile            | ✅     |
| `fred.ts`            | https://api.stlouisfed.org     | Federal funds rate tile | ✅     |
| `openweathermap.ts`  | https://api.openweathermap.org | Weather tile            | ✅     |
| `precious-metals.ts` | https://api.gold-api.com       | Precious metals tile    | ✅     |
| `time.ts`            | https://timeapi.io             | Time tile (TimeAPI.io)  | ✅     |
| `uranium-html.ts`    | Placeholder (not implemented)  | Uranium tile            | ⚠️     |
| `usgs.ts`            | https://earthquake.usgs.gov    | Earthquake tile         | ✅     |

## Development vs Production

### Local Development

- Uses Vite proxy to forward requests directly to external APIs
- No local API server needed for development
- Fast and simple development setup
- All API endpoints work immediately without additional setup

### Production (Vercel)

- Uses these serverless functions
- Automatic deployment when pushed to connected repository
- Handles CORS, error handling, and response formatting
- No additional configuration needed

## Error Handling

### Development

- Direct API responses with potential CORS issues
- Browser may block requests if external API doesn't support CORS

### Production

All functions include:

- Proper error status code forwarding
- Response header preservation
- CORS headers added automatically
- Fallback to mock data in tile components if API fails

## Testing

Run tests with:

```bash
npm run test:run
```

## Adding New APIs

To add a new API proxy:

1. **Create API function**: Create `api/{service-name}.ts`
2. **Update Vite config**: Add proxy rule in `vite.config.ts`
3. **Update endpoints**: Add endpoint in `src/services/apiEndpoints.ts`
4. **Update tiles**: Use `/api/{service-name}` URLs in tile components
5. **Test**: Verify both development and production work

## Troubleshooting

### Development Issues

- **CORS errors**: External API may not support CORS - this is normal in development
- **API rate limiting**: Some APIs have rate limits that apply to direct requests
- **Network issues**: Check if external API is accessible from your network

### Production Issues

- **CORS errors**: Check that your tile is using `/api/` URLs instead of direct external URLs
- **API function errors**: Check Vercel deployment logs for serverless function errors
- **Rate limiting**: Monitor Vercel function execution limits

### Environment Variables

- API keys should be set as environment variables in Vercel
- Use `import.meta.env.VITE_*` for client-side variables
- Use `process.env.*` for serverless function variables
