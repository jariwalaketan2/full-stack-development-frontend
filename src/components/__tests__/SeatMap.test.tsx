import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeatMap } from '../SeatMap';
import { mockVenue } from '../../test/utils';

describe('SeatMap', () => {
  const defaultProps = {
    venue: mockVenue,
    onSeatClick: vi.fn(),
    onSeatFocus: vi.fn(),
    isSelected: vi.fn(() => false),
    clearSelection: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render SVG element', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render with correct dimensions', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '800');
      expect(svg).toHaveAttribute('height', '600');
    });

    it('should render all seats from venue data', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const seats = container.querySelectorAll('rect[data-id]');
      
      // Count total seats in mockVenue
      const totalSeats = mockVenue.sections.reduce(
        (acc, section) =>
          acc + section.rows.reduce((rowAcc, row) => rowAcc + row.seats.length, 0),
        0
      );
      
      expect(seats).toHaveLength(totalSeats);
    });

    it('should render section labels', () => {
      render(<SeatMap {...defaultProps} />);
      expect(screen.getByText('Premium - $200')).toBeInTheDocument();
      expect(screen.getByText('Standard - $100')).toBeInTheDocument();
    });

    it('should render seats with correct data-id attributes', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      expect(container.querySelector('[data-id="S1-R1-1"]')).toBeInTheDocument();
      expect(container.querySelector('[data-id="S1-R1-2"]')).toBeInTheDocument();
      expect(container.querySelector('[data-id="S2-R1-1"]')).toBeInTheDocument();
    });
  });

  describe('Seat Colors', () => {
    it('should apply correct color for available seats', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const availableSeat = container.querySelector('[data-id="S1-R1-1"]');
      expect(availableSeat).toHaveAttribute('fill', '#2196F3'); // Blue
    });

    it('should apply correct color for reserved seats', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const reservedSeat = container.querySelector('[data-id="S1-R1-3"]');
      expect(reservedSeat).toHaveAttribute('fill', '#FF9800'); // Orange
    });

    it('should apply correct color for sold seats', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const soldSeat = container.querySelector('[data-id="S1-R2-1"]');
      expect(soldSeat).toHaveAttribute('fill', '#F44336'); // Red
    });

    it('should apply correct color for held seats', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const heldSeat = container.querySelector('[data-id="S1-R2-2"]');
      expect(heldSeat).toHaveAttribute('fill', '#9C27B0'); // Purple
    });

    it('should apply selected color for selected seats', () => {
      const isSelected = vi.fn((id) => id === 'S1-R1-1');
      const { container } = render(<SeatMap {...defaultProps} isSelected={isSelected} />);
      const selectedSeat = container.querySelector('[data-id="S1-R1-1"]');
      expect(selectedSeat).toHaveAttribute('fill', '#4CAF50'); // Green
    });
  });

  describe('Seat Styling', () => {
    it('should apply stroke to selected seats', () => {
      const isSelected = vi.fn((id) => id === 'S1-R1-1');
      const { container } = render(<SeatMap {...defaultProps} isSelected={isSelected} />);
      const selectedSeat = container.querySelector('[data-id="S1-R1-1"]');
      expect(selectedSeat).toHaveAttribute('stroke', '#000');
    });

    it('should apply pointer cursor to available seats', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const availableSeat = container.querySelector('[data-id="S1-R1-1"]');
      expect(availableSeat).toHaveStyle({ cursor: 'pointer' });
    });

    it('should apply default cursor to unavailable seats', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const reservedSeat = container.querySelector('[data-id="S1-R1-3"]');
      expect(reservedSeat).toHaveStyle({ cursor: 'default' });
    });
  });

  describe('Mouse Interactions', () => {
    it('should call onSeatClick when seat is clicked', async () => {
      const user = userEvent.setup();
      const onSeatClick = vi.fn();
      const { container } = render(<SeatMap {...defaultProps} onSeatClick={onSeatClick} />);
      
      const seat = container.querySelector('[data-id="S1-R1-1"]') as Element;
      await user.click(seat);

      expect(onSeatClick).toHaveBeenCalledTimes(1);
      expect(onSeatClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'S1-R1-1' })
      );
    });

    it('should call onSeatFocus when seat is clicked', async () => {
      const user = userEvent.setup();
      const onSeatFocus = vi.fn();
      const { container } = render(<SeatMap {...defaultProps} onSeatFocus={onSeatFocus} />);
      
      const seat = container.querySelector('[data-id="S1-R1-1"]') as Element;
      await user.click(seat);

      expect(onSeatFocus).toHaveBeenCalled();
    });

    it('should call onSeatFocus on mouse move over seat', async () => {
      const user = userEvent.setup();
      const onSeatFocus = vi.fn();
      const { container } = render(<SeatMap {...defaultProps} onSeatFocus={onSeatFocus} />);
      
      const seat = container.querySelector('[data-id="S1-R1-1"]') as Element;
      await user.hover(seat);

      expect(onSeatFocus).toHaveBeenCalled();
    });

    it('should not trigger click on non-seat elements', async () => {
      const user = userEvent.setup();
      const onSeatClick = vi.fn();
      const { container } = render(<SeatMap {...defaultProps} onSeatClick={onSeatClick} />);
      
      const svg = container.querySelector('svg') as Element;
      await user.click(svg);

      expect(onSeatClick).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have tabIndex={0} on SVG for keyboard focus', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const svg = container.querySelector('svg');
      // React renders tabIndex as tabindex in the DOM
      expect(svg).toHaveAttribute('tabindex', '0');
    });

    it('should have role="application" for screen readers', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('role', 'application');
    });

    it('should have descriptive aria-label', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-label');
      expect(svg?.getAttribute('aria-label')).toContain('arrow keys');
    });

    it('should call onSeatClick when Enter is pressed on focused seat', async () => {
      const user = userEvent.setup();
      const onSeatClick = vi.fn();
      const { container } = render(<SeatMap {...defaultProps} onSeatClick={onSeatClick} />);
      
      const svg = container.querySelector('svg') as Element;
      await user.click(svg);
      await user.keyboard('{Enter}');

      expect(onSeatClick).toHaveBeenCalled();
    });

    it('should call onSeatClick when Space is pressed on focused seat', async () => {
      const user = userEvent.setup();
      const onSeatClick = vi.fn();
      const { container } = render(<SeatMap {...defaultProps} onSeatClick={onSeatClick} />);
      
      const svg = container.querySelector('svg') as Element;
      await user.click(svg);
      await user.keyboard(' ');

      expect(onSeatClick).toHaveBeenCalled();
    });

    it('should call clearSelection when Escape is pressed', async () => {
      const user = userEvent.setup();
      const clearSelection = vi.fn();
      const { container } = render(<SeatMap {...defaultProps} clearSelection={clearSelection} />);
      
      const svg = container.querySelector('svg') as Element;
      await user.click(svg);
      await user.keyboard('{Escape}');

      expect(clearSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have role="button" on seats', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const seat = container.querySelector('[data-id="S1-R1-1"]');
      expect(seat).toHaveAttribute('role', 'button');
    });

    it('should have aria-label on seats', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const seat = container.querySelector('[data-id="S1-R1-1"]');
      expect(seat).toHaveAttribute('aria-label');
    });

    it('should include section in aria-label', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const seat = container.querySelector('[data-id="S1-R1-1"]');
      const ariaLabel = seat?.getAttribute('aria-label');
      expect(ariaLabel).toContain('Premium');
    });

    it('should include row in aria-label', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const seat = container.querySelector('[data-id="S1-R1-1"]');
      const ariaLabel = seat?.getAttribute('aria-label');
      expect(ariaLabel).toContain('Row');
    });

    it('should include status in aria-label', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const seat = container.querySelector('[data-id="S1-R1-1"]');
      const ariaLabel = seat?.getAttribute('aria-label');
      expect(ariaLabel).toContain('Available');
    });

    it('should have aria-selected for selected seats', () => {
      const isSelected = vi.fn((id) => id === 'S1-R1-1');
      const { container } = render(<SeatMap {...defaultProps} isSelected={isSelected} />);
      const seat = container.querySelector('[data-id="S1-R1-1"]');
      expect(seat).toHaveAttribute('aria-selected', 'true');
    });

    it('should have aria-disabled for unavailable seats', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const reservedSeat = container.querySelector('[data-id="S1-R1-3"]');
      expect(reservedSeat).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not have aria-disabled for available seats', () => {
      const { container } = render(<SeatMap {...defaultProps} />);
      const availableSeat = container.querySelector('[data-id="S1-R1-1"]');
      expect(availableSeat).toHaveAttribute('aria-disabled', 'false');
    });
  });

  describe('Focus Indicator', () => {
    it('should render focus indicator for focused seat', async () => {
      const user = userEvent.setup();
      const { container } = render(<SeatMap {...defaultProps} />);
      
      const seat = container.querySelector('[data-id="S1-R1-1"]') as Element;
      await user.hover(seat);

      const focusIndicator = container.querySelector('.keyboard-focus-indicator');
      expect(focusIndicator).toBeInTheDocument();
    });

    it('should have correct stroke color for focus indicator', async () => {
      const user = userEvent.setup();
      const { container } = render(<SeatMap {...defaultProps} />);
      
      const seat = container.querySelector('[data-id="S1-R1-1"]') as Element;
      await user.hover(seat);

      const focusIndicator = container.querySelector('.keyboard-focus-indicator');
      expect(focusIndicator).toHaveAttribute('stroke', '#FFD700');
    });
  });
});
