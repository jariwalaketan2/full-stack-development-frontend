import { useState, useEffect, useMemo, useCallback } from 'react';
import { Seat } from '../types';

export const useSelection = () => {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('selectedSeats');
    if (saved) {
      setSelectedSeats(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (selectedSeats.length > 0) {
      localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    }
  }, [selectedSeats]);

  const toggleSeat = useCallback((seat: Seat) => {
    if (seat.status !== 'available') return;
    
    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.id === seat.id);
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      }
      if (prev.length >= 8) return prev;
      return [...prev, seat];
    });
  }, []);

  const selectedIds = useMemo(() => new Set(selectedSeats.map(s => s.id)), [selectedSeats]);
  const isSelected = useCallback((seatId: string) => selectedIds.has(seatId), [selectedIds]);

  return { selectedSeats, toggleSeat, isSelected };
};