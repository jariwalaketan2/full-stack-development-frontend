import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeatDetails } from '../SeatDetails';
import { Seat } from '../../types';

describe('SeatDetails', () => {
  const mockSeat: Seat = {
    id: 'S1-R1-1',
    col: 1,
    x: 100,
    y: 100,
    priceTier: 1,
    status: 'available',
    sectionId: 'section-1',
    sectionLabel: 'Premium - $200',
    rowIndex: 1,
  };

  describe('Empty State', () => {
    it('should show empty state when no seat provided', () => {
      render(<SeatDetails seat={null} isSelected={false} />);
      expect(screen.getByText(/Hover over a seat or use arrow keys/i)).toBeInTheDocument();
    });

    it('should not show seat information when seat is null', () => {
      render(<SeatDetails seat={null} isSelected={false} />);
      expect(screen.queryByText(/Seat ID:/)).not.toBeInTheDocument();
    });

    it('should render with empty-state class when no seat', () => {
      const { container } = render(<SeatDetails seat={null} isSelected={false} />);
      expect(container.querySelector('.empty-state')).toBeInTheDocument();
    });
  });

  describe('Seat Information Display', () => {
    it('should display section label', () => {
      render(<SeatDetails seat={mockSeat} isSelected={false} />);
      expect(screen.getByText('Premium - $200')).toBeInTheDocument();
    });

    it('should display row index', () => {
      const { container } = render(<SeatDetails seat={mockSeat} isSelected={false} />);
      const rowElement = container.querySelector('.seat-info p:nth-child(2) span');
      expect(rowElement).toHaveTextContent('1');
    });

    it('should display seat ID', () => {
      render(<SeatDetails seat={mockSeat} isSelected={false} />);
      expect(screen.getByText('S1-R1-1')).toBeInTheDocument();
    });

    it('should display seat status', () => {
      render(<SeatDetails seat={mockSeat} isSelected={false} />);
      expect(screen.getByText('available')).toBeInTheDocument();
    });

    it('should display price tier', () => {
      const { container } = render(<SeatDetails seat={mockSeat} isSelected={false} />);
      expect(screen.getByText(/Price Tier:/)).toBeInTheDocument();
      const priceTierElement = container.querySelector('.seat-info p:nth-child(5) span');
      expect(priceTierElement).toHaveTextContent('1');
    });

    it('should display price for tier 1', () => {
      render(<SeatDetails seat={mockSeat} isSelected={false} />);
      expect(screen.getByText('$200')).toBeInTheDocument();
    });

    it('should display price for tier 2', () => {
      const seat = { ...mockSeat, priceTier: 2 };
      render(<SeatDetails seat={seat} isSelected={false} />);
      expect(screen.getByText('$170')).toBeInTheDocument();
    });

    it('should display price for tier 3', () => {
      const seat = { ...mockSeat, priceTier: 3 };
      render(<SeatDetails seat={seat} isSelected={false} />);
      expect(screen.getByText('$100')).toBeInTheDocument();
    });

    it('should display price for tier 4', () => {
      const seat = { ...mockSeat, priceTier: 4 };
      render(<SeatDetails seat={seat} isSelected={false} />);
      expect(screen.getByText('$50')).toBeInTheDocument();
    });
  });

  describe('Selection Status', () => {
    it('should show "No" when seat is not selected', () => {
      render(<SeatDetails seat={mockSeat} isSelected={false} />);
      expect(screen.getByText('No')).toBeInTheDocument();
    });

    it('should show "Yes" when seat is selected', () => {
      render(<SeatDetails seat={mockSeat} isSelected={true} />);
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('should display Selected label', () => {
      render(<SeatDetails seat={mockSeat} isSelected={false} />);
      expect(screen.getByText(/Selected:/)).toBeInTheDocument();
    });
  });

  describe('Different Seat Statuses', () => {
    it('should display reserved status', () => {
      const seat = { ...mockSeat, status: 'reserved' as const };
      render(<SeatDetails seat={seat} isSelected={false} />);
      expect(screen.getByText('reserved')).toBeInTheDocument();
    });

    it('should display sold status', () => {
      const seat = { ...mockSeat, status: 'sold' as const };
      render(<SeatDetails seat={seat} isSelected={false} />);
      expect(screen.getByText('sold')).toBeInTheDocument();
    });

    it('should display held status', () => {
      const seat = { ...mockSeat, status: 'held' as const };
      render(<SeatDetails seat={seat} isSelected={false} />);
      expect(screen.getByText('held')).toBeInTheDocument();
    });
  });

  describe('Different Sections and Rows', () => {
    it('should display different section labels', () => {
      const seat = { ...mockSeat, sectionLabel: 'Standard - $100' };
      render(<SeatDetails seat={seat} isSelected={false} />);
      expect(screen.getByText('Standard - $100')).toBeInTheDocument();
    });

    it('should display different row indices', () => {
      const seat = { ...mockSeat, rowIndex: 5 };
      render(<SeatDetails seat={seat} isSelected={false} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should handle missing section label', () => {
      const seat = { ...mockSeat, sectionLabel: undefined as any };
      render(<SeatDetails seat={seat} isSelected={false} />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should handle missing row index', () => {
      const seat = { ...mockSeat, rowIndex: undefined as any };
      render(<SeatDetails seat={seat} isSelected={false} />);
      const { container } = render(<SeatDetails seat={seat} isSelected={false} />);
      expect(container.textContent).toContain('N/A');
    });
  });

  describe('Component Structure', () => {
    it('should render with seat-details class', () => {
      const { container } = render(<SeatDetails seat={null} isSelected={false} />);
      expect(container.querySelector('.seat-details')).toBeInTheDocument();
    });

    it('should render heading', () => {
      render(<SeatDetails seat={null} isSelected={false} />);
      expect(screen.getByRole('heading', { level: 3, name: 'Seat Details' })).toBeInTheDocument();
    });

    it('should render seat-info class when seat provided', () => {
      const { container } = render(<SeatDetails seat={mockSeat} isSelected={false} />);
      expect(container.querySelector('.seat-info')).toBeInTheDocument();
    });

    it('should render all information fields', () => {
      render(<SeatDetails seat={mockSeat} isSelected={false} />);
      expect(screen.getByText(/Section:/)).toBeInTheDocument();
      expect(screen.getByText(/Row:/)).toBeInTheDocument();
      expect(screen.getByText(/Seat ID:/)).toBeInTheDocument();
      expect(screen.getByText(/Status:/)).toBeInTheDocument();
      expect(screen.getByText(/Price Tier:/)).toBeInTheDocument();
      expect(screen.getByText(/Price:/)).toBeInTheDocument();
      expect(screen.getByText(/Selected:/)).toBeInTheDocument();
    });
  });

  describe('Dynamic Updates', () => {
    it('should update when seat changes', () => {
      const { rerender } = render(<SeatDetails seat={mockSeat} isSelected={false} />);
      expect(screen.getByText('S1-R1-1')).toBeInTheDocument();

      const newSeat = { ...mockSeat, id: 'S2-R2-2' };
      rerender(<SeatDetails seat={newSeat} isSelected={false} />);
      expect(screen.getByText('S2-R2-2')).toBeInTheDocument();
      expect(screen.queryByText('S1-R1-1')).not.toBeInTheDocument();
    });

    it('should update when selection status changes', () => {
      const { rerender } = render(<SeatDetails seat={mockSeat} isSelected={false} />);
      expect(screen.getByText('No')).toBeInTheDocument();

      rerender(<SeatDetails seat={mockSeat} isSelected={true} />);
      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.queryByText('No')).not.toBeInTheDocument();
    });

    it('should switch from seat to empty state', () => {
      const { rerender } = render(<SeatDetails seat={mockSeat} isSelected={false} />);
      expect(screen.getByText('S1-R1-1')).toBeInTheDocument();

      rerender(<SeatDetails seat={null} isSelected={false} />);
      expect(screen.queryByText('S1-R1-1')).not.toBeInTheDocument();
      expect(screen.getByText(/Hover over a seat/)).toBeInTheDocument();
    });

    it('should switch from empty state to seat', () => {
      const { rerender } = render(<SeatDetails seat={null} isSelected={false} />);
      expect(screen.getByText(/Hover over a seat/)).toBeInTheDocument();

      rerender(<SeatDetails seat={mockSeat} isSelected={false} />);
      expect(screen.queryByText(/Hover over a seat/)).not.toBeInTheDocument();
      expect(screen.getByText('S1-R1-1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle seat with all fields populated', () => {
      const completeSeat: Seat = {
        id: 'COMPLETE-SEAT',
        col: 10,
        x: 500,
        y: 300,
        priceTier: 2,
        status: 'reserved',
        sectionId: 'vip-section',
        sectionLabel: 'VIP - $500',
        rowIndex: 15,
      };
      render(<SeatDetails seat={completeSeat} isSelected={true} />);
      
      expect(screen.getByText('VIP - $500')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('COMPLETE-SEAT')).toBeInTheDocument();
      expect(screen.getByText('reserved')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('should handle very long seat IDs', () => {
      const seat = { ...mockSeat, id: 'VERY-LONG-SEAT-ID-WITH-MANY-CHARACTERS-12345' };
      render(<SeatDetails seat={seat} isSelected={false} />);
      expect(screen.getByText('VERY-LONG-SEAT-ID-WITH-MANY-CHARACTERS-12345')).toBeInTheDocument();
    });

    it('should handle very long section labels', () => {
      const seat = { ...mockSeat, sectionLabel: 'Premium VIP Executive Suite Section - $999' };
      render(<SeatDetails seat={seat} isSelected={false} />);
      expect(screen.getByText('Premium VIP Executive Suite Section - $999')).toBeInTheDocument();
    });
  });
});
