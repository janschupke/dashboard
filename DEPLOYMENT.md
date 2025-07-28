# Deployment Guide

This guide explains how to deploy the Dashboard application to Vercel with automatic API proxying.

## Overview

The application uses a dual-proxy system to handle CORS issues:

1. **Local Development**: Vite proxy configuration
2. **Production (Vercel)**: Serverless functions as API proxies

## Prerequisites

- Node.js 18+
- Vercel account
- GitHub repository (or other Git provider)

## Local Development

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The development server uses Vite's proxy configuration in `vite.config.ts` to forward API requests to external services without CORS issues.

### Available APIs (Local)

All API requests are automatically proxied through `/api/*` endpoints:

- `/api/coingecko/*` → CoinGecko API
- `/api/tradingeconomics/*` → TradingEconomics API
- `/api/yahoo-finance/*` → Yahoo Finance API
- `/api/fred/*` → FRED API
- `/api/emmi/*` → EMMI API
- `/api/ecb/*` → ECB API
- `/api/openweathermap/*` → OpenWeatherMap API
- And more...

## Production Deployment (Vercel)

### Automatic Deployment

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Deploy**: Push to your main branch - Vercel will automatically deploy
3. **API Proxies**: The serverless functions in `api/` directory handle all API requests

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Environment Variables

Set these in your Vercel project settings:

```bash
# API keys for enhanced functionality (handled by proxy functions)
OPENWEATHERMAP_API_KEY=your_openweathermap_key
ALPHA_VANTAGE_API_KEY=your_alphavantage_key
FRED_API_KEY=your_fred_api_key
TIMEZONEDB_API_KEY=your_timezonedb_key
```

**Note**: API keys are now handled exclusively by the proxy functions and are never exposed to the frontend. The frontend is completely agnostic of API keys.

### Serverless Functions

The `api/` directory contains serverless functions that act as CORS proxies:

```typescript
// Example: api/coingecko.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = `https://api.coingecko.com${req.url?.replace(/^\/api\/coingecko/, '')}`;
  const apiRes = await fetch(url, {
    method: req.method,
    headers: { ...req.headers, host: undefined },
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  });
  const data = await apiRes.arrayBuffer();
  res.status(apiRes.status);
  apiRes.headers.forEach((value, key) => res.setHeader(key, value));
  res.send(Buffer.from(data));
}
```

## API Proxy System

### How It Works

1. **Frontend Request**: `/api/coingecko/api/v3/coins/markets`
2. **Serverless Function**: Forwards to `https://api.coingecko.com/api/v3/coins/markets`
3. **Response**: Returns data with proper CORS headers

### Benefits

- **No CORS Errors**: All external API calls go through your domain
- **Automatic Deployment**: Works with Vercel's automatic deployment
- **No Backend Required**: Pure frontend application with serverless functions
- **Scalable**: Vercel handles serverless function scaling automatically

## Testing

### Local Testing

```bash
# Run all tests
npm run test:run

# Run tests with UI
npm run test:ui

# Run linter
npm run lint

# Type checking
npm run type-check
```

### API Proxy Tests

Tests for API proxy functions are located in `api/__tests__/`:

```bash
# Run API proxy tests
npm run test:run api/__tests__/
```

## Troubleshooting

### CORS Errors Still Appearing

1. **Check URL**: Ensure your tile is using `/api/` URLs
2. **Verify Proxy**: Check that the corresponding serverless function exists
3. **Deployment**: Ensure the latest code is deployed to Vercel
4. **Logs**: Check Vercel function logs for errors

### API Rate Limiting

Some APIs have rate limits that apply to the proxy:

- **CoinGecko**: 50 calls/minute for free tier
- **Yahoo Finance**: No strict limits but may throttle
- **FRED**: 120 calls/minute for free tier

### Vercel Function Limits

- **Execution Time**: 10 seconds maximum
- **Memory**: 1024 MB maximum
- **Payload Size**: 4.5 MB maximum

## Monitoring

### Vercel Analytics

- **Function Calls**: Monitor API proxy usage
- **Performance**: Track response times
- **Errors**: Monitor function failures

### Custom Monitoring

Add logging to serverless functions:

```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`Proxying request to: ${req.url}`);
  // ... rest of function
}
```

## Security Considerations

- **API Keys**: Store sensitive keys as environment variables
- **Rate Limiting**: Monitor and respect API rate limits
- **Error Handling**: Don't expose internal errors to clients
- **Validation**: Validate all incoming requests

## Performance Optimization

- **Caching**: Implement caching in serverless functions
- **CDN**: Vercel automatically serves static assets via CDN
- **Compression**: Automatic gzip compression
- **Edge Functions**: Consider using Edge Functions for better performance

## Support

For issues with:

- **Vercel Deployment**: Check Vercel documentation
- **API Proxies**: See `api/README.md`
- **Application Code**: Check the main `README.md`
