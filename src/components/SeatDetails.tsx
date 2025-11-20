import React from 'react';
import { Seat } from '../types';

interface SeatDetailsProps {
  seat: Seat | null;
  isSelected: boolean;
}

const PRICE_TIERS = { 1: 200, 2: 170, 3: 100, 4: 50 };

export const SeatDetails: React.FC<SeatDetailsProps> = ({ seat, isSelected }) => {
  // Format complete seat location
  const getLocationString = (seat: Seat): string => {
    const section = seat.sectionLabel || 'Unknown Section';
    const row = seat.rowIndex !== undefined ? `Row ${seat.rowIndex}` : 'Unknown Row';
    const seatNum = seat.id.split('-').pop() || seat.col;
    return `${section} - ${row} - Seat ${seatNum}`;
  };

  return (
    <div className="seat-details">
      <h3>Seat Details</h3>
      {seat ? (
        <>
          <div className="seat-info">
            <p style={{
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '12px',
              color: 'var(--accent)',
              borderBottom: '2px solid var(--border)',
              paddingBottom: '8px'
            }}>
              {getLocationString(seat)}
            </p>
            <p><strong>Section:</strong> <span>{seat.sectionLabel || 'N/A'}</span></p>
            <p><strong>Row:</strong> <span>{seat.rowIndex !== undefined ? seat.rowIndex : 'N/A'}</span></p>
            <p><strong>Seat:</strong> <span>{seat.id.split('-').pop() || seat.col}</span></p>
            <p><strong>Status:</strong> <span style={{
              textTransform: 'capitalize',
              color: seat.status === 'available' ? '#4CAF50' :
                seat.status === 'reserved' ? '#FF9800' :
                  seat.status === 'sold' ? '#F44336' : '#9C27B0'
            }}>{seat.status}</span></p>
            <p><strong>Price:</strong> <span style={{ fontSize: '16px', fontWeight: 600 }}>
              ${PRICE_TIERS[seat.priceTier as keyof typeof PRICE_TIERS]}
            </span></p>
            <p><strong>Selected:</strong> <span style={{
              color: isSelected ? '#4CAF50' : 'inherit',
              fontWeight: isSelected ? 600 : 400
            }}>{isSelected ? 'Yes' : 'No'}</span></p>
          </div>
          {seat.status === 'available' && !isSelected && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'var(--bg-secondary)',
              borderRadius: '6px',
              fontSize: '13px',
              lineHeight: '1.5',
              border: '1px solid var(--border)'
            }}>
              <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--accent)' }}>
                💡 Keyboard Selection:
              </strong>
              <div style={{ color: 'var(--text-secondary)' }}>
                • Press <kbd style={{
                  padding: '2px 6px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}>Enter</kbd> or <kbd style={{
                  padding: '2px 6px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}>Space</kbd> to select
                <br />
                • Press <kbd style={{
                  padding: '2px 6px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}>S</kbd> for quick select
                <br />
                • Use <kbd style={{
                  padding: '2px 6px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}>Arrow Keys</kbd> to navigate
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p style={{ marginBottom: '12px' }}>Hover over a seat or use arrow keys to see details</p>
          <div style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            <strong>Keyboard Navigation:</strong>
            <br />• Arrow keys to move
            <br />• Enter/Space to select
            <br />• Escape to clear all
          </div>
        </div>
      )}
    </div>
  );
};