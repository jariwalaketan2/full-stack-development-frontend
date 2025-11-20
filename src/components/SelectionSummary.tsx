import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Seat, Venue } from '../types';
import { findAdjacentSeats, findAdjacentSeatsWithPreferences, getAdjacentSeatsStats } from '../utils/seatFinder';

interface SelectionSummaryProps {
  selectedSeats: Seat[];
  venue: Venue | null;
  onAdjacentSeatsFound: (seats: Seat[]) => void;
}

const PRICE_TIERS = { 1: 200, 2: 170, 3: 100, 4: 50 };

export const SelectionSummary: React.FC<SelectionSummaryProps> = ({ 
  selectedSeats, 
  venue,
  onAdjacentSeatsFound 
}) => {
  const [seatCount, setSeatCount] = useState(2);
  const [preferredSection, setPreferredSection] = useState<string>('any');
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const prevSelectedCount = useRef(selectedSeats.length);

  const subtotal = selectedSeats.reduce((sum, seat) => sum + (PRICE_TIERS[seat.priceTier as keyof typeof PRICE_TIERS] || 0), 0);

  // Show toast notifications for selection changes
  useEffect(() => {
    const currentCount = selectedSeats.length;
    const prevCount = prevSelectedCount.current;

    if (currentCount > prevCount) {
      // Seat added
      if (currentCount === 8) {
        toast.success('Selection limit reached (8/8)', {
          icon: '🎫',
          duration: 2000,
        });
      } else {
        toast.success(`Seat added (${currentCount}/8)`, {
          icon: '✓',
          duration: 1500,
        });
      }
    } else if (currentCount < prevCount && currentCount > 0) {
      // Seat removed
      toast(`Seat removed (${currentCount}/8)`, {
        icon: '↩️',
        duration: 1500,
      });
    } else if (currentCount === 0 && prevCount > 0) {
      // All cleared
      toast('Selection cleared', {
        icon: '🗑️',
        duration: 2000,
      });
    }

    prevSelectedCount.current = currentCount;
  }, [selectedSeats.length]);

  // Get unique sections from venue
  const availableSections = venue?.sections.map(s => ({
    id: s.id,
    label: s.label
  })) || [];

  const handleFindAdjacent = async () => {
    if (!venue) return;

    setSearching(true);
    setSearchMessage(null);

    // Simulate async search (gives time for UI feedback)
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Use preference if selected
      const result = preferredSection === 'any' 
        ? findAdjacentSeats(venue, seatCount)
        : findAdjacentSeatsWithPreferences(venue, seatCount, {
            preferredSection: preferredSection
          });
      
      if (result) {
        onAdjacentSeatsFound(result);
        const firstSeat = result[0];
        const message = `Found ${seatCount} seats in ${firstSeat.sectionLabel}, Row ${firstSeat.rowIndex}!`;
        
        setSearchMessage({
          type: 'success',
          text: message
        });
        
        toast.success(message, {
          icon: '🎉',
          duration: 3000,
        });
        
        // Clear message after 5 seconds
        setTimeout(() => setSearchMessage(null), 5000);
      } else {
        // Get stats to provide helpful suggestions
        const stats = getAdjacentSeatsStats(venue);
        let suggestion = `No ${seatCount} adjacent seats available.`;
        
        if (stats.maxConsecutive > 0 && stats.maxConsecutive < seatCount) {
          suggestion += ` Maximum available: ${stats.maxConsecutive} seats together.`;
        } else if (stats.maxConsecutive === 0) {
          suggestion += ' Try selecting individual seats.';
        }
        
        setSearchMessage({
          type: 'error',
          text: suggestion
        });
        
        toast.error(suggestion, {
          duration: 4000,
        });
        
        // Clear message after 7 seconds
        setTimeout(() => setSearchMessage(null), 7000);
      }
    } catch (error) {
      const errorMsg = 'Search failed. Please try again.';
      setSearchMessage({
        type: 'error',
        text: errorMsg
      });
      
      toast.error(errorMsg);
      setTimeout(() => setSearchMessage(null), 5000);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="summary">
      <h3>Selection Summary ({selectedSeats.length}/8)</h3>
      
      {/* Find Adjacent Seats Feature */}
      {venue && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          background: 'var(--bg-secondary)',
          borderRadius: '6px',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '8px',
            color: 'var(--text-primary)',
          }}>
            Find Adjacent Seats
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={seatCount}
                onChange={(e) => setSeatCount(Number(e.target.value))}
                disabled={searching}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {[2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num} seats</option>
                ))}
            </select>
            </div>
            
            <select
              value={preferredSection}
              onChange={(e) => setPreferredSection(e.target.value)}
              disabled={searching}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="any">Any Section</option>
              {availableSections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleFindAdjacent}
              disabled={searching}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '4px',
                border: 'none',
                background: searching ? 'var(--border)' : 'var(--accent)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: searching ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={(e) => !searching && (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {searching ? 'Searching...' : 'Find'}
            </button>
          </div>
          
          {searchMessage && (
            <div style={{
              padding: '8px',
              borderRadius: '4px',
              background: searchMessage.type === 'success' ? '#E8F5E9' : '#FFEBEE',
              color: searchMessage.type === 'success' ? '#2E7D32' : '#C62828',
              fontSize: '13px',
              lineHeight: '1.4',
            }}>
              {searchMessage.text}
            </div>
          )}
        </div>
      )}
      
      {selectedSeats.length === 0 ? (
        <div className="empty-state">No seats selected</div>
      ) : (
        <>
          <ul className="summary-list">
            {selectedSeats.map(seat => (
              <li key={seat.id}>
                <span>{seat.id}</span>
                <span>${PRICE_TIERS[seat.priceTier as keyof typeof PRICE_TIERS] || 0}</span>
              </li>
            ))}
          </ul>
          <div className="summary-total">
            Total: ${subtotal}
          </div>
        </>
      )}
    </div>
  );
};