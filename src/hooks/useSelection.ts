import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Seat, StorageError } from '../types';

const STORAGE_KEY = 'selectedSeats';

const safeGetFromStorage = (key: string): Seat[] | null => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    
    // Validate that parsed data is an array
    if (!Array.isArray(parsed)) {
      throw new StorageError('Invalid data format: expected array');
    }

    return parsed;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Failed to read from localStorage:', error);
    }
    
    // Clean up corrupted data
    try {
      localStorage.removeItem(key);
    } catch (removeError) {
      // Silently fail if we can't remove
    }
    
    return null;
  }
};

const safeSetToStorage = (key: string, value: Seat[]): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      if (import.meta.env.DEV) {
        console.warn('⚠️ localStorage quota exceeded. Clearing old data...');
      }
      
      // Try to clear and retry
      try {
        localStorage.removeItem(key);
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        if (import.meta.env.DEV) {
          console.error('❌ Failed to save to localStorage after clearing:', retryError);
        }
        return false;
      }
    }
    
    if (import.meta.env.DEV) {
      console.error('❌ Failed to save to localStorage:', error);
    }
    return false;
  }
};

const safeRemoveFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Failed to remove from localStorage:', error);
    }
  }
};

export const useSelection = () => {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const isClearing = useRef(false);

  useEffect(() => {
    const saved = safeGetFromStorage(STORAGE_KEY);
    if (saved) {
      setSelectedSeats(saved);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Only save to localStorage after initial load and not during clear
    if (isInitialized && !isClearing.current) {
      safeSetToStorage(STORAGE_KEY, selectedSeats);
    }
    // Reset clearing flag after effect runs
    if (isClearing.current) {
      isClearing.current = false;
    }
  }, [selectedSeats, isInitialized]);

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

  const clearSelection = useCallback(() => {
    isClearing.current = true;
    setSelectedSeats([]);
    safeRemoveFromStorage(STORAGE_KEY);
  }, []);

  const selectedIds = useMemo(() => new Set(selectedSeats.map(s => s.id)), [selectedSeats]);
  const isSelected = useCallback((seatId: string) => selectedIds.has(seatId), [selectedIds]);

  return { selectedSeats, toggleSeat, isSelected, clearSelection };
};