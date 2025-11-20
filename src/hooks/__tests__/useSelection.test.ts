import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSelection } from '../useSelection';
import { Seat } from '../../types';

describe('useSelection', () => {
  const mockSeat: Seat = {
    id: 'seat-1',
    col: 1,
    x: 100,
    y: 100,
    priceTier: 1,
    status: 'available',
    sectionId: 'section-1',
    sectionLabel: 'Premium - $200',
    rowIndex: 1,
  };

  const createMockSeat = (id: string, status: Seat['status'] = 'available'): Seat => ({
    ...mockSeat,
    id,
    status,
  });

  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with empty array when no localStorage data', () => {
      const { result } = renderHook(() => useSelection());
      expect(result.current.selectedSeats).toEqual([]);
    });

    it('should load saved seats from localStorage on mount', () => {
      const savedSeats = [createMockSeat('seat-1'), createMockSeat('seat-2')];
      localStorage.setItem('selectedSeats', JSON.stringify(savedSeats));

      const { result } = renderHook(() => useSelection());
      expect(result.current.selectedSeats).toHaveLength(2);
      expect(result.current.selectedSeats[0].id).toBe('seat-1');
      expect(result.current.selectedSeats[1].id).toBe('seat-2');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('selectedSeats', 'invalid-json');
      const { result } = renderHook(() => useSelection());
      expect(result.current.selectedSeats).toEqual([]);
    });
  });

  describe('Seat Selection', () => {
    it('should select an available seat', () => {
      const { result } = renderHook(() => useSelection());
      const seat = createMockSeat('seat-1');

      act(() => {
        result.current.toggleSeat(seat);
      });

      expect(result.current.selectedSeats).toHaveLength(1);
      expect(result.current.selectedSeats[0].id).toBe('seat-1');
      expect(result.current.isSelected('seat-1')).toBe(true);
    });

    it('should deselect a selected seat', () => {
      const { result } = renderHook(() => useSelection());
      const seat = createMockSeat('seat-1');

      act(() => {
        result.current.toggleSeat(seat);
      });
      expect(result.current.selectedSeats).toHaveLength(1);

      act(() => {
        result.current.toggleSeat(seat);
      });
      expect(result.current.selectedSeats).toHaveLength(0);
      expect(result.current.isSelected('seat-1')).toBe(false);
    });

    it('should select multiple available seats', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.toggleSeat(createMockSeat('seat-1'));
        result.current.toggleSeat(createMockSeat('seat-2'));
        result.current.toggleSeat(createMockSeat('seat-3'));
      });

      expect(result.current.selectedSeats).toHaveLength(3);
      expect(result.current.isSelected('seat-1')).toBe(true);
      expect(result.current.isSelected('seat-2')).toBe(true);
      expect(result.current.isSelected('seat-3')).toBe(true);
    });
  });

  describe('8-Seat Selection Limit', () => {
    it('should not allow selecting more than 8 seats', () => {
      const { result } = renderHook(() => useSelection());

      // Select 8 seats
      act(() => {
        for (let i = 1; i <= 8; i++) {
          result.current.toggleSeat(createMockSeat(`seat-${i}`));
        }
      });
      expect(result.current.selectedSeats).toHaveLength(8);

      // Try to select 9th seat
      act(() => {
        result.current.toggleSeat(createMockSeat('seat-9'));
      });
      expect(result.current.selectedSeats).toHaveLength(8);
      expect(result.current.isSelected('seat-9')).toBe(false);
    });

    it('should allow deselecting when at 8-seat limit', () => {
      const { result } = renderHook(() => useSelection());

      // Select 8 seats
      act(() => {
        for (let i = 1; i <= 8; i++) {
          result.current.toggleSeat(createMockSeat(`seat-${i}`));
        }
      });

      // Deselect one seat
      act(() => {
        result.current.toggleSeat(createMockSeat('seat-1'));
      });
      expect(result.current.selectedSeats).toHaveLength(7);
      expect(result.current.isSelected('seat-1')).toBe(false);
    });

    it('should allow selecting a new seat after deselecting from limit', () => {
      const { result } = renderHook(() => useSelection());

      // Select 8 seats
      act(() => {
        for (let i = 1; i <= 8; i++) {
          result.current.toggleSeat(createMockSeat(`seat-${i}`));
        }
      });

      // Deselect one and select a new one
      act(() => {
        result.current.toggleSeat(createMockSeat('seat-1'));
        result.current.toggleSeat(createMockSeat('seat-9'));
      });

      expect(result.current.selectedSeats).toHaveLength(8);
      expect(result.current.isSelected('seat-1')).toBe(false);
      expect(result.current.isSelected('seat-9')).toBe(true);
    });
  });

  describe('Seat Status Restrictions', () => {
    it('should not select reserved seats', () => {
      const { result } = renderHook(() => useSelection());
      const reservedSeat = createMockSeat('seat-1', 'reserved');

      act(() => {
        result.current.toggleSeat(reservedSeat);
      });

      expect(result.current.selectedSeats).toHaveLength(0);
      expect(result.current.isSelected('seat-1')).toBe(false);
    });

    it('should not select sold seats', () => {
      const { result } = renderHook(() => useSelection());
      const soldSeat = createMockSeat('seat-1', 'sold');

      act(() => {
        result.current.toggleSeat(soldSeat);
      });

      expect(result.current.selectedSeats).toHaveLength(0);
      expect(result.current.isSelected('seat-1')).toBe(false);
    });

    it('should not select held seats', () => {
      const { result } = renderHook(() => useSelection());
      const heldSeat = createMockSeat('seat-1', 'held');

      act(() => {
        result.current.toggleSeat(heldSeat);
      });

      expect(result.current.selectedSeats).toHaveLength(0);
      expect(result.current.isSelected('seat-1')).toBe(false);
    });

    it('should only select available seats from mixed status seats', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.toggleSeat(createMockSeat('seat-1', 'available'));
        result.current.toggleSeat(createMockSeat('seat-2', 'reserved'));
        result.current.toggleSeat(createMockSeat('seat-3', 'available'));
        result.current.toggleSeat(createMockSeat('seat-4', 'sold'));
      });

      expect(result.current.selectedSeats).toHaveLength(2);
      expect(result.current.isSelected('seat-1')).toBe(true);
      expect(result.current.isSelected('seat-2')).toBe(false);
      expect(result.current.isSelected('seat-3')).toBe(true);
      expect(result.current.isSelected('seat-4')).toBe(false);
    });
  });

  describe('localStorage Persistence', () => {
    it('should save selected seats to localStorage', () => {
      const { result } = renderHook(() => useSelection());
      const seat = createMockSeat('seat-1');

      act(() => {
        result.current.toggleSeat(seat);
      });

      const saved = localStorage.getItem('selectedSeats');
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('seat-1');
    });

    it('should update localStorage when seats are deselected', () => {
      const { result } = renderHook(() => useSelection());
      const seat = createMockSeat('seat-1');

      act(() => {
        result.current.toggleSeat(seat);
        result.current.toggleSeat(seat);
      });

      const saved = localStorage.getItem('selectedSeats');
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed).toHaveLength(0);
    });

    it('should persist multiple seats to localStorage', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.toggleSeat(createMockSeat('seat-1'));
        result.current.toggleSeat(createMockSeat('seat-2'));
        result.current.toggleSeat(createMockSeat('seat-3'));
      });

      const saved = localStorage.getItem('selectedSeats');
      const parsed = JSON.parse(saved!);
      expect(parsed).toHaveLength(3);
    });
  });

  describe('isSelected Function', () => {
    it('should return false for unselected seat', () => {
      const { result } = renderHook(() => useSelection());
      expect(result.current.isSelected('seat-1')).toBe(false);
    });

    it('should return true for selected seat', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.toggleSeat(createMockSeat('seat-1'));
      });

      expect(result.current.isSelected('seat-1')).toBe(true);
    });

    it('should return false after deselecting', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.toggleSeat(createMockSeat('seat-1'));
        result.current.toggleSeat(createMockSeat('seat-1'));
      });

      expect(result.current.isSelected('seat-1')).toBe(false);
    });

    it('should work correctly with multiple seats', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.toggleSeat(createMockSeat('seat-1'));
        result.current.toggleSeat(createMockSeat('seat-3'));
      });

      expect(result.current.isSelected('seat-1')).toBe(true);
      expect(result.current.isSelected('seat-2')).toBe(false);
      expect(result.current.isSelected('seat-3')).toBe(true);
    });
  });

  describe('clearSelection Function', () => {
    it('should clear all selected seats', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.toggleSeat(createMockSeat('seat-1'));
        result.current.toggleSeat(createMockSeat('seat-2'));
        result.current.toggleSeat(createMockSeat('seat-3'));
      });
      expect(result.current.selectedSeats).toHaveLength(3);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedSeats).toHaveLength(0);
    });

    it('should remove selectedSeats from localStorage', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.toggleSeat(createMockSeat('seat-1'));
      });
      expect(localStorage.getItem('selectedSeats')).toBeTruthy();

      act(() => {
        result.current.clearSelection();
      });

      expect(localStorage.getItem('selectedSeats')).toBeNull();
    });

    it('should work when no seats are selected', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedSeats).toHaveLength(0);
    });
  });
});
