import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { Venue, Seat } from '../types';

interface SeatMapProps {
  venue: Venue;
  onSeatClick: (seat: Seat) => void;
  onSeatFocus: (seat: Seat) => void;
  isSelected: (seatId: string) => boolean;
}

const COLORS = {
  selected: '#4CAF50',
  available: '#2196F3',
  reserved: '#FF9800',
  sold: '#F44336',
  held: '#9C27B0',
};

export const SeatMap: React.FC<SeatMapProps> = React.memo(({ venue, onSeatClick, onSeatFocus, isSelected }) => {
  const [focusedSeatIndex, setFocusedSeatIndex] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const allSeats = useMemo(() => 
    venue.sections.flatMap(s => s.rows.flatMap(r => r.seats)),
    [venue]
  );

  useEffect(() => {
    if (allSeats[focusedSeatIndex]) {
      onSeatFocus(allSeats[focusedSeatIndex]);
    }
  }, [focusedSeatIndex, allSeats, onSeatFocus]);

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGRectElement;
    if (target.tagName !== 'rect') return;
    const seatId = target.getAttribute('data-id');
    if (!seatId) return;
    const seat = allSeats.find(s => s.id === seatId);
    if (seat) {
      onSeatClick(seat);
      onSeatFocus(seat);
    }
  }, [allSeats, onSeatClick, onSeatFocus]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGRectElement;
    if (target.tagName !== 'rect') return;
    const seatId = target.getAttribute('data-id');
    if (!seatId) return;
    const seat = allSeats.find(s => s.id === seatId);
    if (seat) {
      const seatIndex = allSeats.findIndex(s => s.id === seatId);
      setFocusedSeatIndex(seatIndex);
      onSeatFocus(seat);
    }
  }, [allSeats, onSeatFocus]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<SVGSVGElement>) => {
    const currentSeat = allSeats[focusedSeatIndex];
    if (!currentSeat) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSeatClick(currentSeat);
        break;
    }
  }, [allSeats, focusedSeatIndex, onSeatClick]);

  return (
    <svg
      ref={svgRef}
      width={venue.map.width}
      height={venue.map.height}
      style={{ display: 'block', outline: 'none' }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Seat selection map. Enter or Space to select seats."
    >
      {allSeats.map((seat, index) => {
        const color = isSelected(seat.id) ? COLORS.selected : COLORS[seat.status] || '#757575';
        const isFocused = index === focusedSeatIndex;
        return (
          <rect
            key={seat.id}
            data-id={seat.id}
            x={seat.x - 6}
            y={seat.y - 8}
            width="12"
            height="14"
            rx="2"
            fill={color}
            stroke={isSelected(seat.id) ? '#000' : isFocused ? '#fff' : 'none'}
            strokeWidth={isFocused ? '2' : '1'}
            style={{ cursor: seat.status === 'available' ? 'pointer' : 'default', pointerEvents: 'all' }}
            aria-label={`Seat ${seat.id}`}
          />
        );
      })}
      {venue.sections.map((section, idx) => {
        const yPos = 100 + idx * (25 * 20 + 80) - 30;
        return (
          <text
            key={section.id}
            x="100"
            y={yPos}
            fontSize="20"
            fontWeight="bold"
            fill="#1976d2"
          >
            {section.label}
          </text>
        );
      })}
    </svg>
  );
});

SeatMap.displayName = 'SeatMap';