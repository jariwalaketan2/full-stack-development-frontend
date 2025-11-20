import React from 'react';
import { Seat } from '../types';

interface SeatDetailsProps {
  seat: Seat | null;
  isSelected: boolean;
}

const PRICE_TIERS = { 1: 200, 2: 170, 3: 100, 4: 50 };

export const SeatDetails: React.FC<SeatDetailsProps> = ({ seat, isSelected }) => (
  <div className="seat-details">
    <h3>Seat Details</h3>
    {seat ? (
      <div className="seat-info">
        <p><strong>Seat ID:</strong> <span>{seat.id}</span></p>
        <p><strong>Status:</strong> <span>{seat.status}</span></p>
        <p><strong>Price Tier:</strong> <span>{seat.priceTier}</span></p>
        <p><strong>Price:</strong> <span>${PRICE_TIERS[seat.priceTier as keyof typeof PRICE_TIERS]}</span></p>
        <p><strong>Selected:</strong> <span>{isSelected ? 'Yes' : 'No'}</span></p>
      </div>
    ) : (
      <div className="empty-state">Hover over a seat to see details</div>
    )}
  </div>
);