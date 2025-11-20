export interface Seat {
  id: string;
  col: number;
  x: number;
  y: number;
  priceTier: number;
  status: "available" | "reserved" | "sold" | "held";
  // Added for keyboard navigation and accessibility
  sectionId: string;
  sectionLabel: string;
  rowIndex: number;
}

export interface Row {
  index: number;
  seats: Seat[];
}

export interface Section {
  id: string;
  label: string;
  transform: { x: number; y: number; scale: number };
  rows: Row[];
}

export interface Venue {
  venueId: string;
  name: string;
  map: { width: number; height: number };
  sections: Section[];
}
// Error types for better error handling
export class VenueLoadError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'VenueLoadError';
  }
}

export class StorageError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
