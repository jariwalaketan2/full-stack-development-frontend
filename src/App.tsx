import { useState } from 'react';
import { useVenue } from './hooks/useVenue';
import { useSelection } from './hooks/useSelection';
import { SeatMap } from './components/SeatMap';
import { SelectionSummary } from './components/SelectionSummary';
import { Legend } from './components/Legend';
import { SeatDetails } from './components/SeatDetails';
import { ThemeToggle } from './components/ThemeToggle';
import { ErrorMessage } from './components/ErrorMessage';
import { Toast } from './components/Toast';
import { Seat } from './types';
import './App.css';

function App() {
  const { venue, loading, error, retry } = useVenue();
  const { selectedSeats, toggleSeat, isSelected, clearSelection } = useSelection();
  const [focusedSeat, setFocusedSeat] = useState<Seat | null>(null);

  const handleAdjacentSeatsFound = (seats: Seat[]) => {
    clearSelection();

    seats.forEach(seat => {
      toggleSeat(seat);
    });

    // Focus on first seat
    if (seats.length > 0) {
      setFocusedSeat(seats[0]);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <Toast />
        <header className="header">
          <div className="skeleton" style={{
            width: '200px',
            height: '24px',
            borderRadius: '4px',
          }} />
          <div className="loading-spinner" style={{
            width: '32px',
            height: '32px',
            borderWidth: '3px',
          }} />
        </header>
        <div className="container">
          <div className="map-container">
            <div style={{
              width: '100%',
              height: '600px',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Skeleton seats pattern */}
              <div className="skeleton" style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.3,
              }} />
              <div className="loading-spinner" />
            </div>
          </div>
          <div className="sidebar">
            {/* Legend skeleton */}
            <div className="legend">
              <div className="skeleton" style={{
                width: '80px',
                height: '20px',
                marginBottom: '16px',
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="skeleton" style={{
                      width: '20px',
                      height: '20px',
                    }} />
                    <div className="skeleton" style={{
                      flex: 1,
                      height: '14px',
                    }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Seat details skeleton */}
            <div className="seat-details">
              <div className="skeleton" style={{
                width: '100px',
                height: '20px',
                marginBottom: '16px',
              }} />
              <div className="skeleton" style={{
                padding: '20px',
                borderRadius: '6px',
                textAlign: 'center',
                height: '80px',
              }} />
            </div>

            {/* Summary skeleton */}
            <div className="summary">
              <div className="skeleton" style={{
                width: '140px',
                height: '20px',
                marginBottom: '16px',
              }} />
              <div className="skeleton" style={{
                padding: '20px',
                borderRadius: '6px',
                height: '60px',
              }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="app">
        <Toast />
        <header className="header">
          <h1>Seat Selection</h1>
          <ThemeToggle />
        </header>
        <div style={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <ErrorMessage
              title="Failed to Load Venue"
              message={error}
              onRetry={retry}
              retryLabel="Retry Loading"
              type="error"
            />
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: 'var(--bg-primary)',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
            }}>
              <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Troubleshooting Tips:
              </strong>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li>Check your internet connection</li>
                <li>Make sure the venue.json file exists in the public folder</li>
                <li>Try refreshing the page</li>
                <li>Clear your browser cache</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No venue data (shouldn't happen if error handling works correctly)
  if (!venue) {
    return (
      <div className="app">
        <Toast />
        <header className="header">
          <h1>Seat Selection</h1>
          <ThemeToggle />
        </header>
        <div style={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <ErrorMessage
            title="No Venue Data"
            message="Venue data is not available. Please try reloading the page."
            onRetry={retry}
            retryLabel="Reload"
            type="warning"
          />
        </div>
      </div>
    );
  }

  // Success state - render the app
  return (
    <div className="app">
      <header className="header">
        <h1>{venue.name}</h1>
        <ThemeToggle />
      </header>
      <div className="container">
        <div className="map-container">
          <SeatMap
            venue={venue}
            onSeatClick={toggleSeat}
            onSeatFocus={setFocusedSeat}
            isSelected={isSelected}
            clearSelection={clearSelection}
          />
        </div>
        <div className="sidebar">
          <Legend />
          <SeatDetails seat={focusedSeat} isSelected={focusedSeat ? isSelected(focusedSeat.id) : false} />
          <SelectionSummary
            selectedSeats={selectedSeats}
            venue={venue}
            onAdjacentSeatsFound={handleAdjacentSeatsFound}
          />
        </div>
      </div>
    </div>
  );
}

export default App;