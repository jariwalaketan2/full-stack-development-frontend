# Seat Selection Frontend

## Architecture

This React application uses a component-based architecture with custom hooks for state management. The seat selection logic is separated into `useSelection` and `useVenue` hooks, promoting reusability and testability. The theme system leverages React Context and CSS custom properties for efficient dark/light mode switching with WCAG 2.1 AA compliant contrast ratios. Components are kept minimal and focused on single responsibilities, with the main trade-off being slightly more files for better maintainability.

The application uses Vite for fast development and building, TypeScript for type safety, and follows React best practices with functional components and hooks. State is managed locally where possible, avoiding unnecessary complexity from external state management libraries. The venue data is loaded from a static JSON file, making it easy to modify seating layouts without code changes.

## Development

Run `pnpm dev` to start the development server. The application will be available at `http://localhost:5173`. 
`pnpm lint` to check code quality. 
