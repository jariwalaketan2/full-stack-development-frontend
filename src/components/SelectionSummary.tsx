import React from 'react';
import { Seat } from '../types';

interface SelectionSummaryProps {
  selectedSeats: Seat[];
}

const PRICE_TIERS = { 1: 200, 2: 170, 3: 100, 4: 50 };

export const SelectionSummary: React.FC<SelectionSummaryProps> = ({ selectedSeats }) => {
  const subtotal = selectedSeats.reduce((sum, seat) => sum + (PRICE_TIERS[seat.priceTier as keyof typeof PRICE_TIERS] || 0), 0);

  return (
    <div className="summary">
      <h3>Selection Summary ({selectedSeats.length}/8)</h3>
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