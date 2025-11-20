# Seat Selection Frontend

A high-performance, accessible seat selection application built with React and TypeScript. This application allows users to browse and select seats from a venue map with support for zoom, pan, keyboard navigation, and dark mode.

## Project Overview

This seat selection system provides an interactive venue map where users can select up to 8 seats across different pricing tiers. The application emphasizes accessibility (WCAG 2.1 AA compliant), performance (60 FPS with 15,000+ seats), and user experience with features like keyboard navigation, theme persistence, and responsive design.

### Key Features

- ✅ **Interactive Seat Map**: Click or tap to select seats with visual feedback
- ✅ **Zoom & Pan**: Pinch-to-zoom on mobile, mouse wheel on desktop, with smooth panning
- ✅ **Keyboard Navigation**: Full keyboard support with arrow keys, Enter/Space to select
- ✅ **8-Seat Limit**: Enforced maximum selection with clear user feedback
- ✅ **Selection Persistence**: Selections saved to localStorage and persist across sessions
- ✅ **Dark Mode**: Theme toggle with preference persistence
- ✅ **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- ✅ **Responsive Design**: Works on mobile (375px), tablet (768px), and desktop (1920px+)
- ✅ **Performance Optimized**: Handles 15,000+ seats at 60 FPS
- ✅ **Adjacent Seats**: Find and select N adjacent available seats automatically
- ✅ **Real-time Summary**: Live pricing and seat details as you select

## Architecture

### Component Structure

The application follows a **component-based architecture** with clear separation of concerns:

```
src/
├── components/          # React UI components
│   ├── SeatMap.tsx     # Main seat visualization with zoom/pan
│   ├── SelectionSummary.tsx  # Selected seats list and pricing
│   ├── SeatDetails.tsx # Focused seat information
│   ├── Legend.tsx      # Color legend for seat statuses
│   ├── ThemeToggle.tsx # Dark/light mode switcher
│   └── ErrorBoundary.tsx  # Error handling wrapper
├── hooks/              # Custom React hooks
│   ├── useSelection.ts # Seat selection state management
│   ├── useVenue.ts     # Venue data fetching and caching
│   └── useTheme.ts     # Theme state and persistence
├── utils/              # Pure utility functions
│   ├── adjacentSeats.ts  # Adjacent seat finding algorithm
│   └── storage.ts      # localStorage abstraction
├── types.ts            # TypeScript type definitions
└── App.tsx             # Root component and layout
```

### State Management Approach

**No external state management library** (Redux, MobX, Zustand) is used. Instead, we leverage:

1. **React Hooks**: `useState`, `useEffect`, `useCallback`, `useMemo` for local state
2. **Custom Hooks**: Encapsulate complex state logic (selection, venue, theme)
3. **Context API**: Used only for theme (minimal global state)
4. **localStorage**: Persist selections and theme preference

**Justification**: For this application's scope, external state management adds unnecessary complexity. Custom hooks provide excellent encapsulation and testability while keeping the bundle size minimal.

### Performance Optimizations

The application is optimized to handle **15,000+ seats at 60 FPS**:

1. **Viewport Culling** (disabled for scrolling): Only render visible seats when dataset is large
2. **React.memo**: Prevent unnecessary re-renders of SeatMap component
3. **useMemo**: Cache expensive calculations (seat maps, spatial grids)
4. **useCallback**: Stable function references to prevent child re-renders
5. **O(1) Seat Lookup**: Map-based seat lookup instead of array.find()
6. **Throttled Events**: Mouse move events throttled to 60 FPS
7. **Spatial Grid**: Pre-computed grid for O(1) keyboard navigation
8. **Transform-based Zoom**: CSS transforms for hardware-accelerated zoom/pan

## Library Choices

### Core Dependencies

#### React 18.2.0
**Why chosen**: 
- Industry standard for UI development
- Concurrent rendering features for better performance
- Excellent TypeScript support
- Large ecosystem and community

**Features used**:
- Functional components with hooks
- `useMemo` and `useCallback` for performance
- `useEffect` for side effects (data fetching, localStorage)
- Context API for theme management

#### TypeScript 5.2.2
**Why chosen**:
- Catch bugs at compile time, not runtime
- Excellent IDE support with autocomplete
- Self-documenting code with type definitions

**Benefits for this project**:
- Type-safe seat selection logic
- Prevents common bugs (undefined seats, wrong IDs)
- Clear API contracts between components
- Better developer experience

#### Vite 5.0.8
**Why chosen over Create React App**:
- **10-100x faster** dev server startup
- **Instant HMR** (Hot Module Replacement)
- **Smaller bundle size** with better tree-shaking
- **Native ESM** support
- **Better TypeScript integration**

**Build advantages**:
- Production builds in ~5 seconds vs ~30 seconds with CRA
- Optimized chunk splitting
- Modern browser targets by default

#### react-zoom-pan-pinch 3.7.0
**Why chosen**:
- Handles complex zoom/pan interactions
- Mobile pinch-to-zoom support
- Smooth animations with requestAnimationFrame
- Accessible (doesn't break keyboard navigation)

### Development Dependencies

- **Vitest**: Fast unit testing with Vite integration
- **Playwright**: Comprehensive E2E testing across browsers
- **ESLint**: Code quality and consistency
- **@testing-library/react**: User-centric testing utilities

### Why Minimal Dependencies?

- **No UI library** (Material-UI, Chakra): Custom CSS is lighter and more flexible
- **No state management** (Redux, MobX): React hooks are sufficient
- **No utility library** (Lodash): Modern JavaScript has most utilities built-in
- **No date library** (moment, date-fns): Not needed for this project
- **No animation library** (Framer Motion): CSS transitions are sufficient


## Incomplete Features / TODOs

- **E2E Test Integration**: Playwright tests implemented but require integration for full E2E test.
- **Real-time Seat Updates**: No WebSocket implementation for live seat availability synchronization

## How to Run

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **pnpm**


### Installation

```bash
# Clone the repository
git clone <repository-url>
cd full-stack-development-frontend

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server (http://localhost:5173)
pnpm run dev

# The app will automatically reload when you make changes
```

### Build

```bash
# Create production build
pnpm run build

# Output will be in ./dist directory
```

# Serves the built app at http://localhost:4173
```

### Linting

```bash
# Check code quality
pnpm run lint

# Auto-fix linting issues
pnpm run lint -- --fix
```

## How to Run Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm run test:ui

# Run tests with coverage report
pnpm run test:coverage
```

**Test files location**: `src/**/__tests__/*.test.ts(x)`

### E2E Tests

```bash
# Run all E2E tests (headless)
pnpm run test:e2e

# Run E2E tests in UI mode (interactive)
pnpm run test:e2e:ui

# Run E2E tests in debug mode
pnpm run test:e2e:debug

# View test report
pnpm run test:e2e:report
```

**Test files location**: `e2e/*.spec.ts`

### Test Coverage

Current coverage targets:
- **Unit tests**: >80% coverage

## Performance Notes

### Optimizations Implemented

1. **React.memo**: Prevents unnecessary SeatMap re-renders
2. **useMemo**: Caches seat map, spatial grid, and visible seats
3. **useCallback**: Stable event handlers
4. **Map-based Lookup**: O(1) seat lookup by ID
5. **Spatial Grid**: O(1) keyboard navigation
6. **Throttled Events**: Mouse move throttled to 16ms (60 FPS)
7. **CSS Transforms**: Hardware-accelerated zoom/pan
8. **Code Splitting**: Lazy load non-critical components (future)

## Project Structure

```
seat-selection-frontend/
├── public/
│   └── venue.json          # Venue data (15,000+ seats)
├── src/
│   ├── components/         # React components
│   │   ├── SeatMap.tsx    # Main seat visualization
│   │   ├── SelectionSummary.tsx
│   │   ├── SeatDetails.tsx
│   │   ├── Legend.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ErrorMessage.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useSelection.ts
│   │   ├── useVenue.ts
│   │   └── useTheme.ts
│   ├── utils/             # Utility functions
│   │   ├── adjacentSeats.ts
│   │   └── storage.ts
│   ├── types.ts           # TypeScript types
│   ├── App.tsx            # Root component
│   ├── App.css            # Global styles
│   └── main.tsx           # Entry point
├── e2e/                   # E2E tests (Playwright)
│   ├── seat-selection.spec.ts
│   ├── theme.spec.ts
│   ├── accessibility.spec.ts
│   ├── responsive.spec.ts
│   ├── error-handling.spec.ts
│   ├── performance.spec.ts
│   └── helpers.ts
├── playwright.config.ts   # E2E test configuration
├── vitest.config.ts       # Unit test configuration
├── vite.config.ts         # Build configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```
