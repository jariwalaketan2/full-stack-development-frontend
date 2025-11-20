import { describe, it, expect } from 'vitest';
import { findAdjacentSeats, findAdjacentSeatsWithPreferences, getAdjacentSeatsStats } from '../seatFinder';
import { Venue, Seat } from '../../types';

// Helper to create a test seat
const createSeat = (id: string, col: number, status: Seat['status'], priceTier: number = 1): Seat => ({
  id,
  col,
  x: col * 20,
  y: 100,
  priceTier,
  status,
  sectionId: 'test-section',
  sectionLabel: 'Test Section',
  rowIndex: 1,
});

// Helper to create a test venue
const createVenue = (sections: any[]): Venue => ({
  venueId: 'test-venue',
  name: 'Test Venue',
  map: { width: 800, height: 600 },
  sections,
});

describe('findAdjacentSeats', () => {
  it('should find 2 consecutive available seats', () => {
    const venue = createVenue([
      {
        id: 'section-1',
        label: 'Section 1',
        transform: { x: 0, y: 0, scale: 1 },
        rows: [
          {
            index: 1,
            seats: [
              createSeat('S1-R1-1', 1, 'available'),
              createSeat('S1-R1-2', 2, 'available'),
              createSeat('S1-R1-3', 3, 'sold'),
            ],
          },
        ],
      },
    ]);

    const result = findAdjacentSeats(venue, 2);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
    expect(result![0].col).toBe(1);
    expect(result![1].col).toBe(2);
  });

  it('should return null when no adjacent seats available', () => {
    const venue = createVenue([
      {
        id: 'section-1',
        label: 'Section 1',
        transform: { x: 0, y: 0, scale: 1 },
        rows: [
          {
            index: 1,
            seats: [
              createSeat('S1-R1-1', 1, 'available'),
              createSeat('S1-R1-2', 2, 'sold'),
              createSeat('S1-R1-3', 3, 'available'),
            ],
          },
        ],
      },
    ]);

    const result = findAdjacentSeats(venue, 2);
    expect(result).toBeNull();
  });

  it('should find best match based on price tier', () => {
    const venue = createVenue([
      {
        id: 'section-1',
        label: 'Section 1',
        transform: { x: 0, y: 0, scale: 1 },
        rows: [
          {
            index: 1,
            seats: [
              createSeat('S1-R1-1', 1, 'available', 3), // Higher price tier
              createSeat('S1-R1-2', 2, 'available', 3),
            ],
          },
          {
            index: 2,
            seats: [
              createSeat('S1-R2-1', 1, 'available', 1), // Lower price tier (better)
              createSeat('S1-R2-2', 2, 'available', 1),
            ],
          },
        ],
      },
    ]);

    const result = findAdjacentSeats(venue, 2);
    expect(result).not.toBeNull();
    expect(result![0].priceTier).toBe(1); // Should return lower price tier
  });

  it('should validate seats are truly consecutive by col number', () => {
    const venue = createVenue([
      {
        id: 'section-1',
        label: 'Section 1',
        transform: { x: 0, y: 0, scale: 1 },
        rows: [
          {
            index: 1,
            seats: [
              createSeat('S1-R1-1', 1, 'available'),
              createSeat('S1-R1-3', 3, 'available'), // Gap in col numbers
              createSeat('S1-R1-4', 4, 'available'),
            ],
          },
        ],
      },
    ]);

    const result = findAdjacentSeats(venue, 2);
    expect(result).not.toBeNull();
    expect(result![0].col).toBe(3); // Should find 3-4, not 1-3
    expect(result![1].col).toBe(4);
  });

  it('should find 4 consecutive seats', () => {
    const venue = createVenue([
      {
        id: 'section-1',
        label: 'Section 1',
        transform: { x: 0, y: 0, scale: 1 },
        rows: [
          {
            index: 1,
            seats: [
              createSeat('S1-R1-1', 1, 'available'),
              createSeat('S1-R1-2', 2, 'available'),
              createSeat('S1-R1-3', 3, 'available'),
              createSeat('S1-R1-4', 4, 'available'),
              createSeat('S1-R1-5', 5, 'sold'),
            ],
          },
        ],
      },
    ]);

    const result = findAdjacentSeats(venue, 4);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(4);
    expect(result![0].col).toBe(1);
    expect(result![3].col).toBe(4);
  });

  it('should throw error for invalid count', () => {
    const venue = createVenue([]);
    expect(() => findAdjacentSeats(venue, 1)).toThrow();
    expect(() => findAdjacentSeats(venue, 9)).toThrow();
  });

  it('should skip rows with insufficient seats', () => {
    const venue = createVenue([
      {
        id: 'section-1',
        label: 'Section 1',
        transform: { x: 0, y: 0, scale: 1 },
        rows: [
          {
            index: 1,
            seats: [createSeat('S1-R1-1', 1, 'available')], // Only 1 seat
          },
          {
            index: 2,
            seats: [
              createSeat('S1-R2-1', 1, 'available'),
              createSeat('S1-R2-2', 2, 'available'),
            ],
          },
        ],
      },
    ]);

    const result = findAdjacentSeats(venue, 2);
    expect(result).not.toBeNull();
    expect(result![0].id).toBe('S1-R2-1');
  });
});

describe('findAdjacentSeatsWithPreferences', () => {
  it('should prefer specific section', () => {
    const venue = createVenue([
      {
        id: 'section-1',
        label: 'Section 1',
        transform: { x: 0, y: 0, scale: 1 },
        rows: [
          {
            index: 1,
            seats: [
              createSeat('S1-R1-1', 1, 'available'),
              createSeat('S1-R1-2', 2, 'available'),
            ],
          },
        ],
      },
      {
        id: 'section-2',
        label: 'Section 2',
        transform: { x: 0, y: 0, scale: 1 },
        rows: [
          {
            index: 1,
            seats: [
              createSeat('S2-R1-1', 1, 'available'),
              createSeat('S2-R1-2', 2, 'available'),
            ],
          },
        ],
      },
    ]);

    const result = findAdjacentSeatsWithPreferences(venue, 2, {
      preferredSection: 'section-2',
    });

    expect(result).not.toBeNull();
    expect(result![0].sectionId).toBe('section-2');
  });

  it('should prefer specific price tier', () => {
    const venue = createVenue([
      {
        id: 'section-1',
        label: 'Section 1',
        transform: { x: 0, y: 0, scale: 1 },
        rows: [
          {
            index: 1,
            seats: [
              createSeat('S1-R1-1', 1, 'available', 1),
              createSeat('S1-R1-2', 2, 'available', 1),
            ],
          },
          {
            index: 2,
            seats: [
              createSeat('S1-R2-1', 1, 'available', 3),
              createSeat('S1-R2-2', 2, 'available', 3),
            ],
          },
        ],
      },
    ]);

    const result = findAdjacentSeatsWithPreferences(venue, 2, {
      preferredPriceTier: 3,
    });

    expect(result).not.toBeNull();
    expect(result![0].priceTier).toBe(3);
  });
});

describe('getAdjacentSeatsStats', () => {
  it('should calculate max consecutive seats', () => {
    const venue = createVenue([
      {
        id: 'section-1',
        label: 'Section 1',
        transform: { x: 0, y: 0, scale: 1 },
        rows: [
          {
            index: 1,
            seats: [
              createSeat('S1-R1-1', 1, 'available'),
              createSeat('S1-R1-2', 2, 'available'),
              createSeat('S1-R1-3', 3, 'available'),
              createSeat('S1-R1-4', 4, 'sold'),
            ],
          },
        ],
      },
    ]);

    const stats = getAdjacentSeatsStats(venue);
    expect(stats.maxConsecutive).toBe(3);
  });

  it('should count available groups by size', () => {
    const venue = createVenue([
      {
        id: 'section-1',
        label: 'Section 1',
        transform: { x: 0, y: 0, scale: 1 },
        rows: [
          {
            index: 1,
            seats: [
              createSeat('S1-R1-1', 1, 'available'),
              createSeat('S1-R1-2', 2, 'available'),
              createSeat('S1-R1-3', 3, 'sold'),
              createSeat('S1-R1-4', 4, 'available'),
              createSeat('S1-R1-5', 5, 'available'),
            ],
          },
        ],
      },
    ]);

    const stats = getAdjacentSeatsStats(venue);
    expect(stats.availableGroups.get(2)).toBe(2); // Two groups of 2
  });
});
