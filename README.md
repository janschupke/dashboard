# Dashboard

A modern, extensible dashboard application built with React 19, TypeScript, and Vite. Dashboard displays real-time market, financial, and weather data in an interactive, accessible, and highly customizable interface.

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite with optimized bundling
- **Styling**: Tailwind CSS with custom theme system
- **Testing**: Vitest with React Testing Library
- **State Management**: React hooks and context API
- **Data Fetching**: Centralized API/data manager with error handling
- **Persistence**: Centralized storage manager for all local storage
- **Charts**: Recharts library for data visualization
- **Deployment**: Vercel-ready configuration

## Features

- **Real-time Market Data**: Track cryptocurrency, precious metals, ETFs, interest rates, and weather in real time.
- **Interactive Dashboard**: Drag-and-drop, resizable tile layout with responsive design.
- **Unified Data Flow**: All tiles use a single, type-safe data layer for both API and scraping-based data sources, with robust error handling and caching.
- **Generic, App-Agnostic Dragboard**: The Dragboard framework provides a reusable, implementation-agnostic system for draggable and resizable dashboard layouts. All drag/resize logic is encapsulated and exposed via a clean API/context. No app-specific or persistence logic is present in Dragboard.
- **Generic Tile System**: Tiles are defined generically, with a base tile component and a registry/factory for specific implementations. Each tile implementation (e.g., Cryptocurrency, Weather, ETF) provides its own data fetching and display logic, while the base tile handles layout, status, and error display.
- **Centralized Data Fetching**: All API calls and data fetching are handled by a centralized dataFetcher service, which manages retries, caching, and error handling. API endpoints are proxied via serverless functions to avoid CORS issues.
- **Centralized Local Storage**: All local storage access and persistence (dashboard layout, tile configs, sidebar state, logs) is managed by a single storageManager service, ensuring consistency and easy migration/versioning.
- **Smart Data Management**: Local storage caching, background refresh, and storage cleanup for offline support and performance.
- **Accessibility**: WCAG 2.1 AA compliance, full keyboard navigation, ARIA labels, and focus management.
- **Error Handling**: Comprehensive error boundaries, centralized error logging, and a user-accessible API log view.
- **Theme Support**: Light and dark themes with custom Tailwind configuration.
- **Performance**: Optimized components, memoization, code splitting, and lazy loading.
- **Sidebar State Persistence**: Sidebar saves active tiles and collapse state to local storage, restores preferences, and displays total tile count.

## Module Responsibilities

### Dragboard (src/components/dragboard/)

- Provides a generic, app-agnostic framework for draggable and resizable dashboard layouts.
- Exposes context and API for managing tile arrangement, sizing, and user interactions.
- Contains no persistence or app-specific logic; all state is managed externally and passed in via props/context.

### Tile System (src/components/tile/ and src/components/tile-implementations/)

- **GenericTile**: Base tile component for layout, status, and error display.
- **TileFactoryRegistry**: Maps tile types to their implementations and metadata.
- **Tile Implementations**: Each use case (e.g., Cryptocurrency, Weather, ETF, Time, etc.) provides its own tile component, meta, and types. These fetch and display data using the centralized dataFetcher and are registered in the factory.
- **TileDataContext/Provider**: Manages per-tile loading/error/cached state.

### Data Fetching (src/services/dataFetcher.ts)

- Centralized manager for all API/data endpoint calls.
- Handles retries, timeouts, caching, and background refresh.
- Integrates with storageManager for local caching.
- Supports both API and scraping-based data retrieval via `fetchAndMap` and the new `fetchAndParse` method.
- Uses a `dataParser` registry for scraping-based tiles, ensuring type-safe, testable, and unified data flow.
- All tile implementations use this service for data population.

### Local Storage (src/services/storageManager.ts)

- Single point of access for all local storage operations (dashboard layout, tile configs, sidebar state, logs).
- Handles versioning, migration, and error handling.
- Exposes context and hooks for use throughout the app.

### API Proxy (api/)

- Serverless functions acting as CORS proxies for all external APIs.
- Ensures reliable, CORS-free data fetching in both development and production.

### Overlay/Dashboard (src/components/overlay/)

- Integrates Dragboard, tile system, sidebar, and header.
- Manages dashboard state, tile list, and layout persistence via storageManager.
- Handles theme switching, error boundaries, and API log view.

### Sidebar (src/components/sidebar/)

- Displays available tiles, manages tile addition/removal, and persists sidebar state.

### UI Components (src/components/ui/)

- Reusable, theme-aware UI primitives (Button, Icon, Toast, etc.).

### Contexts & Hooks (src/contexts/, src/hooks/)

- Theme, dashboard, and other shared state/context providers and custom hooks.

### Testing (src/test/)

- Test setup, mocks, and test utilities.
- Individual unit tests are co-located with the files they're testing. Never in **test** folder

## Project Structure

```
src/
├── components/
│   ├── dragboard/              # Generic drag-and-drop/resizing framework (app-agnostic)
│   ├── tile/                   # Generic tile system, registry, and base components
│   ├── tile-implementations/   # Specific tile implementations (cryptocurrency, weather, etc.)
│   ├── overlay/                # Dashboard integration, header, sidebar, error boundaries
│   ├── sidebar/                # Sidebar and related components
│   ├── ui/                     # Reusable UI primitives
├── contexts/                   # React contexts (theme, dashboard, etc.)
├── hooks/                      # Custom React hooks
├── services/                   # Centralized dataFetcher, storageManager, error handling
├── theme/                      # Theme tokens and types
├── types/                      # TypeScript type definitions
├── test/                       # Test setup, mocks, and utilities
```

## API Integration

The application uses a comprehensive API proxy system to handle CORS issues and ensure reliable data fetching. See [api/README.md](api/README.md) for details.

## Accessibility, Performance, Testing, and Deployment

(Sections unchanged; see above for details.)

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test:run     # Run tests with coverage
npm run test:ui      # Run tests with UI

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

# Installation

1. Clone the repository and install dependencies:

   ```sh
   git clone ...
   cd dashboard
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your API keys:

   ```sh
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **(Development only)**: Create `.env.local` for Vite client-side API keys:

   ```sh
   npm run env
   ```

   This script will create or update `.env.local` with all keys from `.env`, prefixed with `VITE_`. This ensures Vite can access the necessary keys on localhost only. Do not commit `.env.local` to version control.

4. Start the development server:

   ```sh
   npm run dev
   ```

5. For production, only `.env` is required. API keys are never exposed to the client in production.
