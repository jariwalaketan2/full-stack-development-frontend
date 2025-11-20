import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeContext, useThemeProvider } from '../hooks/useTheme';
import { Venue, Seat } from '../types';

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    const themeValue = useThemeProvider();
    return <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Mock venue data for testing
export const mockVenue: Venue = {
  venueId: 'test-venue',
  name: 'Test Arena',
  map: {
    width: 800,
    height: 600,
  },
  sections: [
    {
      id: 'section-1',
      label: 'Premium - $200',
      transform: { x: 0, y: 0, scale: 1 },
      rows: [
        {
          index: 1,
          seats: [
            {
              id: 'S1-R1-1',
              col: 1,
              x: 100,
              y: 100,
              priceTier: 1,
              status: 'available',
              sectionId: 'section-1',
              sectionLabel: 'Premium - $200',
              rowIndex: 1,
            },
            {
              id: 'S1-R1-2',
              col: 2,
              x: 120,
              y: 100,
              priceTier: 1,
              status: 'available',
              sectionId: 'section-1',
              sectionLabel: 'Premium - $200',
              rowIndex: 1,
            },
            {
              id: 'S1-R1-3',
              col: 3,
              x: 140,
              y: 100,
              priceTier: 1,
              status: 'reserved',
              sectionId: 'section-1',
              sectionLabel: 'Premium - $200',
              rowIndex: 1,
            },
          ],
        },
        {
          index: 2,
          seats: [
            {
              id: 'S1-R2-1',
              col: 1,
              x: 100,
              y: 120,
              priceTier: 1,
              status: 'sold',
              sectionId: 'section-1',
              sectionLabel: 'Premium - $200',
              rowIndex: 2,
            },
            {
              id: 'S1-R2-2',
              col: 2,
              x: 120,
              y: 120,
              priceTier: 1,
              status: 'held',
              sectionId: 'section-1',
              sectionLabel: 'Premium - $200',
              rowIndex: 2,
            },
          ],
        },
      ],
    },
    {
      id: 'section-2',
      label: 'Standard - $100',
      transform: { x: 0, y: 200, scale: 1 },
      rows: [
        {
          index: 1,
          seats: [
            {
              id: 'S2-R1-1',
              col: 1,
              x: 100,
              y: 300,
              priceTier: 3,
              status: 'available',
              sectionId: 'section-2',
              sectionLabel: 'Standard - $100',
              rowIndex: 1,
            },
            {
              id: 'S2-R1-2',
              col: 2,
              x: 120,
              y: 300,
              priceTier: 3,
              status: 'available',
              sectionId: 'section-2',
              sectionLabel: 'Standard - $100',
              rowIndex: 1,
            },
          ],
        },
      ],
    },
  ],
};

// Mock seats for testing
export const mockSeats: Seat[] = [
  {
    id: 'seat-1',
    col: 1,
    x: 100,
    y: 100,
    priceTier: 1,
    status: 'available',
    sectionId: 'section-1',
    sectionLabel: 'Premium - $200',
    rowIndex: 1,
  },
  {
    id: 'seat-2',
    col: 2,
    x: 120,
    y: 100,
    priceTier: 1,
    status: 'available',
    sectionId: 'section-1',
    sectionLabel: 'Premium - $200',
    rowIndex: 1,
  },
  {
    id: 'seat-3',
    col: 3,
    x: 140,
    y: 100,
    priceTier: 2,
    status: 'reserved',
    sectionId: 'section-1',
    sectionLabel: 'Premium - $200',
    rowIndex: 1,
  },
  {
    id: 'seat-4',
    col: 4,
    x: 160,
    y: 100,
    priceTier: 2,
    status: 'sold',
    sectionId: 'section-1',
    sectionLabel: 'Premium - $200',
    rowIndex: 1,
  },
  {
    id: 'seat-5',
    col: 5,
    x: 180,
    y: 100,
    priceTier: 3,
    status: 'held',
    sectionId: 'section-1',
    sectionLabel: 'Premium - $200',
    rowIndex: 1,
  },
];

// Helper to create multiple available seats for testing selection limit
export function createMockSeats(count: number): Seat[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `seat-${i + 1}`,
    col: i + 1,
    x: 100 + i * 20,
    y: 100,
    priceTier: 1,
    status: 'available' as const,
    sectionId: 'section-1',
    sectionLabel: 'Premium - $200',
    rowIndex: 1,
  }));
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
