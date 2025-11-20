import { useState } from 'react';
import { useVenue } from './hooks/useVenue';
import { useSelection } from './hooks/useSelection';
import { SeatMap } from './components/SeatMap';
import { SelectionSummary } from './components/SelectionSummary';
import { Legend } from './components/Legend';
import { SeatDetails } from './components/SeatDetails';
import { ThemeToggle } from './components/ThemeToggle';
import { Seat } from './types';
import './App.css';

function App() {
  const { venue, loading } = useVenue();
  const { selectedSeats, toggleSeat, isSelected } = useSelection();
  const [focusedSeat, setFocusedSeat] = useState<Seat | null>(null);

  if (loading) return <div>Loading...</div>;
  if (!venue) return <div>Failed to load venue data</div>;

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
          />
        </div>
        <div className="sidebar">
          <Legend />
          <SeatDetails seat={focusedSeat} isSelected={focusedSeat ? isSelected(focusedSeat.id) : false} />
          <SelectionSummary selectedSeats={selectedSeats} />
        </div>
      </div>
    </div>
  );
}

export default App;