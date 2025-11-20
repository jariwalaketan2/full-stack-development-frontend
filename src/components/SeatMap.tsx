import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Venue, Seat } from '../types';

interface SeatMapProps {
  venue: Venue;
  onSeatClick: (seat: Seat) => void;
  onSeatFocus: (seat: Seat) => void;
  isSelected: (seatId: string) => boolean;
  clearSelection: () => void;
}

const COLORS = {
  selected: '#4CAF50',
  available: '#2196F3',
  reserved: '#FF9800',
  sold: '#F44336',
  held: '#9C27B0',
};

// Price tier mapping for accessibility labels
const PRICE_TIERS: Record<number, string> = {
  1: '$200',
  2: '$150',
  3: '$100',
  4: '$75',
};

export const SeatMap: React.FC<SeatMapProps> = React.memo(({ venue, onSeatClick, onSeatFocus, isSelected, clearSelection }) => {
  const [focusedSeatIndex, setFocusedSeatIndex] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const lastMouseMoveTime = useRef(0);
  const { allSeats, seatMap, seatGrid, sortedYCoords } = useMemo(() => {
    const seats = venue.sections.flatMap(s => s.rows.flatMap(r => r.seats));
    
    const map = new Map<string, { seat: Seat; index: number }>();
    seats.forEach((seat, index) => map.set(seat.id, { seat, index }));
    
    const grid = new Map<number, Seat[]>();
    seats.forEach(seat => {
      const row = grid.get(seat.y) || [];
      row.push(seat);
      grid.set(seat.y, row);
    });
    grid.forEach(row => row.sort((a, b) => a.x - b.x));
    
    const coords = Array.from(grid.keys()).sort((a, b) => a - b);
    
    return { allSeats: seats, seatMap: map, seatGrid: grid, sortedYCoords: coords };
  }, [venue]);

  const visibleSeats = useMemo(() => allSeats, [allSeats]);

  // Update focused seat info when focus changes
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
    
    const seatData = seatMap.get(seatId);
    if (seatData) {
      onSeatClick(seatData.seat);
      onSeatFocus(seatData.seat);
      setFocusedSeatIndex(seatData.index);
    }
  }, [seatMap, onSeatClick, onSeatFocus]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const now = Date.now();
    if (now - lastMouseMoveTime.current < 16) return;
    lastMouseMoveTime.current = now;
    
    const target = e.target as SVGRectElement;
    if (target.tagName !== 'rect') return;
    const seatId = target.getAttribute('data-id');
    if (!seatId) return;
    
    const seatData = seatMap.get(seatId);
    if (seatData) {
      setFocusedSeatIndex(seatData.index);
      onSeatFocus(seatData.seat);
    }
  }, [seatMap, onSeatFocus]);

  const findNearestSeat = useCallback((currentSeat: Seat, direction: 'up' | 'down' | 'left' | 'right'): number => {
    const currentY = currentSeat.y;
    const currentX = currentSeat.x;
    const currentRow = seatGrid.get(currentY) || [];

    switch (direction) {
      case 'left': {
        const currentIndex = currentRow.findIndex(s => s.id === currentSeat.id);
        if (currentIndex > 0) {
          const prevSeat = currentRow[currentIndex - 1];
          return seatMap.get(prevSeat.id)?.index ?? focusedSeatIndex;
        }
        if (currentRow.length > 0) {
          const lastSeat = currentRow[currentRow.length - 1];
          return seatMap.get(lastSeat.id)?.index ?? focusedSeatIndex;
        }
        break;
      }
      
      case 'right': {
        const currentIndex = currentRow.findIndex(s => s.id === currentSeat.id);
        if (currentIndex < currentRow.length - 1) {
          const nextSeat = currentRow[currentIndex + 1];
          return seatMap.get(nextSeat.id)?.index ?? focusedSeatIndex;
        }
        if (currentRow.length > 0) {
          const firstSeat = currentRow[0];
          return seatMap.get(firstSeat.id)?.index ?? focusedSeatIndex;
        }
        break;
      }
      
      case 'up': {
        const currentYIndex = sortedYCoords.indexOf(currentY);
        if (currentYIndex > 0) {
          const prevY = sortedYCoords[currentYIndex - 1];
          const prevRow = seatGrid.get(prevY) || [];
          const closestSeat = prevRow.reduce((closest, seat) => 
            Math.abs(seat.x - currentX) < Math.abs(closest.x - currentX) ? seat : closest
          );
          return seatMap.get(closestSeat.id)?.index ?? focusedSeatIndex;
        }
        if (sortedYCoords.length > 0) {
          const lastY = sortedYCoords[sortedYCoords.length - 1];
          const lastRow = seatGrid.get(lastY) || [];
          const closestSeat = lastRow.reduce((closest, seat) => 
            Math.abs(seat.x - currentX) < Math.abs(closest.x - currentX) ? seat : closest
          );
          return seatMap.get(closestSeat.id)?.index ?? focusedSeatIndex;
        }
        break;
      }
      
      case 'down': {
        const currentYIndex = sortedYCoords.indexOf(currentY);
        if (currentYIndex < sortedYCoords.length - 1) {
          const nextY = sortedYCoords[currentYIndex + 1];
          const nextRow = seatGrid.get(nextY) || [];
          const closestSeat = nextRow.reduce((closest, seat) => 
            Math.abs(seat.x - currentX) < Math.abs(closest.x - currentX) ? seat : closest
          );
          return seatMap.get(closestSeat.id)?.index ?? focusedSeatIndex;
        }
        if (sortedYCoords.length > 0) {
          const firstY = sortedYCoords[0];
          const firstRow = seatGrid.get(firstY) || [];
          const closestSeat = firstRow.reduce((closest, seat) => 
            Math.abs(seat.x - currentX) < Math.abs(closest.x - currentX) ? seat : closest
          );
          return seatMap.get(closestSeat.id)?.index ?? focusedSeatIndex;
        }
        break;
      }
    }

    return focusedSeatIndex;
  }, [seatGrid, sortedYCoords, focusedSeatIndex, seatMap]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentSeat = allSeats[focusedSeatIndex];
    if (!currentSeat) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        // Select or deselect the focused seat
        e.preventDefault();
        if (currentSeat.status === 'available') {
          onSeatClick(currentSeat);
        }
        break;

      case 's':
      case 'S':
        // Quick select shortcut (S key)
        e.preventDefault();
        if (currentSeat.status === 'available') {
          onSeatClick(currentSeat);
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        setFocusedSeatIndex(findNearestSeat(currentSeat, 'left'));
        break;

      case 'ArrowRight':
        e.preventDefault();
        setFocusedSeatIndex(findNearestSeat(currentSeat, 'right'));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedSeatIndex(findNearestSeat(currentSeat, 'up'));
        break;

      case 'ArrowDown':
        e.preventDefault();
        setFocusedSeatIndex(findNearestSeat(currentSeat, 'down'));
        break;

      case 'Escape':
        e.preventDefault();
        clearSelection();
        break;

      case 'Home':
        e.preventDefault();
        setFocusedSeatIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setFocusedSeatIndex(allSeats.length - 1);
        break;
    }
  }, [allSeats, focusedSeatIndex, onSeatClick, findNearestSeat, clearSelection]);

  const getAriaLabel = useCallback((seat: Seat): string => {
    const section = seat.sectionLabel || 'Unknown Section';
    const row = seat.rowIndex !== undefined ? `Row ${seat.rowIndex}` : '';
    const seatNum = seat.id.split('-').pop() || seat.id;
    const price = PRICE_TIERS[seat.priceTier] || 'Price unavailable';
    const status = seat.status === 'available' ? 'Available' : 
                   seat.status === 'reserved' ? 'Reserved' : 
                   seat.status === 'sold' ? 'Sold' : 'Held';
    const selected = isSelected(seat.id) ? ', Currently selected' : '';
    
    return `${section}, ${row}, Seat ${seatNum}, ${price}, ${status}${selected}`;
  }, [isSelected]);

  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const keyboardWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (keyboardWrapperRef.current) {
      keyboardWrapperRef.current.focus();
    }
  }, []);

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={0.4} // Start zoomed out to see all sections
        minScale={0.2}
        maxScale={5}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: true }}
        panning={{ 
          velocityDisabled: true,
          excluded: ['rect'] // Don't pan when clicking on seats
        }}
        disablePadding={false}
        disabled={false}
        limitToBounds={false}
      >
        {({ zoomIn, zoomOut, resetTransform, instance }) => (
          <>
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
              }}
              contentStyle={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center'
              }}
            >
              <div
                ref={keyboardWrapperRef}
                onKeyDown={handleKeyDown}
                onClick={(e) => {
                  // Ensure wrapper is focused when clicking anywhere on the map
                  if (keyboardWrapperRef.current && e.target !== keyboardWrapperRef.current) {
                    keyboardWrapperRef.current.focus();
                  }
                }}
                tabIndex={0}
                role="application"
                aria-label="Seat selection map. Use arrow keys to navigate, Enter, Space, or S key to select seats, Escape to clear selection. Pinch to zoom on mobile."
                style={{ 
                  outline: 'none', 
                  width: '100%', 
                  height: '100%',
                  cursor: 'default'
                }}
              >
                <svg
                  ref={svgRef}
                  width={venue.map.width}
                  height={venue.map.height}
                  style={{ display: 'block', outline: 'none' }}
                  onClick={handleClick}
                  onMouseMove={handleMouseMove}
                >
                {/* OPTIMIZATION: Only render visible seats for large datasets */}
                {visibleSeats.map((seat) => {
                  const seatData = seatMap.get(seat.id);
                  if (!seatData) return null;
                  
                  const color = isSelected(seat.id) ? COLORS.selected : COLORS[seat.status] || '#757575';
                  const isFocused = seatData.index === focusedSeatIndex;
                  const isAvailable = seat.status === 'available';
                  
                  return (
                    <g key={seat.id}>
                      <rect
                        data-id={seat.id}
                        x={seat.x - 6}
                        y={seat.y - 8}
                        width="12"
                        height="14"
                        rx="2"
                        fill={color}
                        stroke={isSelected(seat.id) ? '#000' : 'none'}
                        strokeWidth="1"
                        style={{ 
                          cursor: isAvailable ? 'pointer' : 'default', 
                          pointerEvents: 'all'
                        }}
                        role="button"
                        tabIndex={-1}
                        aria-label={getAriaLabel(seat)}
                        aria-selected={isSelected(seat.id)}
                        aria-disabled={!isAvailable}
                      />
                      {isFocused && (
                        <rect
                          x={seat.x - 8}
                          y={seat.y - 10}
                          width="16"
                          height="18"
                          rx="3"
                          fill="none"
                          stroke="#FFD700"
                          strokeWidth="3"
                          className="keyboard-focus-indicator"
                          pointerEvents="none"
                        />
                      )}
                    </g>
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
                      pointerEvents="none"
                    >
                      {section.label}
                    </text>
                  );
                })}
              </svg>
              </div>
            </TransformComponent>

            {/* Zoom Controls */}
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                zIndex: 10,
              }}
            >
              <button
                onClick={() => zoomIn()}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px var(--shadow)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--accent)', e.currentTarget.style.color = 'white')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'var(--bg-primary)', e.currentTarget.style.color = 'var(--text-primary)')}
                aria-label="Zoom in"
                title="Zoom in"
              >
                +
              </button>
              <button
                onClick={() => zoomOut()}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px var(--shadow)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--accent)', e.currentTarget.style.color = 'white')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'var(--bg-primary)', e.currentTarget.style.color = 'var(--text-primary)')}
                aria-label="Zoom out"
                title="Zoom out"
              >
                −
              </button>
              <button
                onClick={() => resetTransform()}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px var(--shadow)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--accent)', e.currentTarget.style.color = 'white')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'var(--bg-primary)', e.currentTarget.style.color = 'var(--text-primary)')}
                aria-label="Reset zoom"
                title="Reset zoom"
              >
                ⟲
              </button>
              <div
                style={{
                  width: '44px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px var(--shadow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-live="polite"
                aria-label={`Current zoom: ${Math.round((instance?.transformState.scale || 1) * 100)}%`}
              >
                {Math.round((instance?.transformState.scale || 1) * 100)}%
              </div>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo optimization
  // Only re-render if these props actually changed
  return (
    prevProps.venue === nextProps.venue &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.onSeatClick === nextProps.onSeatClick &&
    prevProps.onSeatFocus === nextProps.onSeatFocus &&
    prevProps.clearSelection === nextProps.clearSelection
  );
});

SeatMap.displayName = 'SeatMap';
