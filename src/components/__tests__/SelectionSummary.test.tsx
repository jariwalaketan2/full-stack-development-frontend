import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SelectionSummary } from '../SelectionSummary';
import { Seat, Venue } from '../../types';

describe('SelectionSummary', () => {
  const createMockSeat = (id: string, priceTier: number): Seat => ({
    id,
    col: 1,
    x: 100,
    y: 100,
    priceTier,
    status: 'available',
    sectionId: 'section-1',
    sectionLabel: 'Premium - $200',
    rowIndex: 1,
  });

  const mockVenue: Venue = {
    venueId: 'test-venue',
    name: 'Test Arena',
    map: { width: 1000, height: 1000 },
    sections: [
      {
        id: 'section-1',
        label: 'Premium - $200',
        transform: { x: 0, y: 0, scale: 1 },
        rows: [
          {
            index: 1,
            seats: [createMockSeat('seat-1', 1)],
          },
        ],
      },
    ],
  };

  const mockOnAdjacentSeatsFound = vi.fn();

  describe('Empty State', () => {
    it('should show empty state when no seats selected', () => {
      render(<SelectionSummary selectedSeats={[]} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('No seats selected')).toBeInTheDocument();
    });

    it('should show 0/8 count when no seats selected', () => {
      render(<SelectionSummary selectedSeats={[]} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText(/\(0\/8\)/)).toBeInTheDocument();
    });

    it('should not show summary list when empty', () => {
      render(<SelectionSummary selectedSeats={[]} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('should not show total when empty', () => {
      render(<SelectionSummary selectedSeats={[]} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.queryByText(/Total:/)).not.toBeInTheDocument();
    });
  });

  describe('Seat Count Display', () => {
    it('should show correct count for 1 seat', () => {
      const seats = [createMockSeat('seat-1', 1)];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText(/\(1\/8\)/)).toBeInTheDocument();
    });

    it('should show correct count for multiple seats', () => {
      const seats = [
        createMockSeat('seat-1', 1),
        createMockSeat('seat-2', 1),
        createMockSeat('seat-3', 1),
      ];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText(/\(3\/8\)/)).toBeInTheDocument();
    });

    it('should show correct count at maximum (8 seats)', () => {
      const seats = Array.from({ length: 8 }, (_, i) => createMockSeat(`seat-${i + 1}`, 1));
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText(/\(8\/8\)/)).toBeInTheDocument();
    });
  });

  describe('Selected Seats List', () => {
    it('should display list of selected seats', () => {
      const seats = [
        createMockSeat('S1-R1-1', 1),
        createMockSeat('S1-R1-2', 1),
      ];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      
      expect(screen.getByText('S1-R1-1')).toBeInTheDocument();
      expect(screen.getByText('S1-R1-2')).toBeInTheDocument();
    });

    it('should display seat IDs correctly', () => {
      const seats = [createMockSeat('Premium-R1-L5', 1)];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('Premium-R1-L5')).toBeInTheDocument();
    });

    it('should render list items for each seat', () => {
      const seats = [
        createMockSeat('seat-1', 1),
        createMockSeat('seat-2', 1),
        createMockSeat('seat-3', 1),
      ];
      const { container } = render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(3);
    });
  });

  describe('Price Display', () => {
    it('should display price for tier 1 seats ($200)', () => {
      const seats = [createMockSeat('seat-1', 1)];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('$200')).toBeInTheDocument();
    });

    it('should display price for tier 2 seats ($170)', () => {
      const seats = [createMockSeat('seat-1', 2)];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('$170')).toBeInTheDocument();
    });

    it('should display price for tier 3 seats ($100)', () => {
      const seats = [createMockSeat('seat-1', 3)];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('$100')).toBeInTheDocument();
    });

    it('should display price for tier 4 seats ($50)', () => {
      const seats = [createMockSeat('seat-1', 4)];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('$50')).toBeInTheDocument();
    });

    it('should display prices for multiple seats with different tiers', () => {
      const seats = [
        createMockSeat('seat-1', 1),
        createMockSeat('seat-2', 3),
      ];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('$200')).toBeInTheDocument();
      expect(screen.getByText('$100')).toBeInTheDocument();
    });
  });

  describe('Subtotal Calculation', () => {
    it('should calculate correct subtotal for single seat', () => {
      const seats = [createMockSeat('seat-1', 1)];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('Total: $200')).toBeInTheDocument();
    });

    it('should calculate correct subtotal for multiple same-tier seats', () => {
      const seats = [
        createMockSeat('seat-1', 1),
        createMockSeat('seat-2', 1),
        createMockSeat('seat-3', 1),
      ];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('Total: $600')).toBeInTheDocument();
    });

    it('should calculate correct subtotal for mixed-tier seats', () => {
      const seats = [
        createMockSeat('seat-1', 1),
        createMockSeat('seat-2', 2),
        createMockSeat('seat-3', 3),
        createMockSeat('seat-4', 4),
      ];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('Total: $520')).toBeInTheDocument();
    });

    it('should calculate correct subtotal for 8 seats', () => {
      const seats = Array.from({ length: 8 }, (_, i) => createMockSeat(`seat-${i + 1}`, 3));
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('Total: $800')).toBeInTheDocument();
    });

    it('should handle tier 2 seats correctly', () => {
      const seats = [
        createMockSeat('seat-1', 2),
        createMockSeat('seat-2', 2),
      ];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('Total: $340')).toBeInTheDocument();
    });

    it('should handle tier 4 seats correctly', () => {
      const seats = [
        createMockSeat('seat-1', 4),
        createMockSeat('seat-2', 4),
        createMockSeat('seat-3', 4),
      ];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('Total: $150')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render with summary class', () => {
      const { container } = render(<SelectionSummary selectedSeats={[]} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(container.querySelector('.summary')).toBeInTheDocument();
    });

    it('should render heading', () => {
      render(<SelectionSummary selectedSeats={[]} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should render summary-list class when seats selected', () => {
      const seats = [createMockSeat('seat-1', 1)];
      const { container } = render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(container.querySelector('.summary-list')).toBeInTheDocument();
    });

    it('should render summary-total class when seats selected', () => {
      const seats = [createMockSeat('seat-1', 1)];
      const { container } = render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(container.querySelector('.summary-total')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid price tier gracefully', () => {
      const seats = [createMockSeat('seat-1', 99 as any)];
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('Total: $0')).toBeInTheDocument();
    });

    it('should handle large number of seats', () => {
      const seats = Array.from({ length: 100 }, (_, i) => createMockSeat(`seat-${i + 1}`, 1));
      render(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText(/\(100\/8\)/)).toBeInTheDocument();
    });

    it('should update when seats prop changes', () => {
      const { rerender } = render(<SelectionSummary selectedSeats={[]} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.getByText('No seats selected')).toBeInTheDocument();

      const seats = [createMockSeat('seat-1', 1)];
      rerender(<SelectionSummary selectedSeats={seats} venue={mockVenue} onAdjacentSeatsFound={mockOnAdjacentSeatsFound} />);
      expect(screen.queryByText('No seats selected')).not.toBeInTheDocument();
      expect(screen.getByText('seat-1')).toBeInTheDocument();
    });
  });
});
