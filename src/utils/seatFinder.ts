import { Venue, Seat, Section, Row } from '../types';

export interface AdjacentSeatsResult {
  seats: Seat[];
  section: Section;
  row: Row;
  score: number; // Lower is better (based on price tier)
}

export function findAdjacentSeats(
  venue: Venue,
  count: number
): Seat[] | null {
  if (count < 2 || count > 8) {
    throw new Error('Count must be between 2 and 8');
  }

  const results: AdjacentSeatsResult[] = [];

  // Iterate through all sections and rows
  for (const section of venue.sections) {
    for (const row of section.rows) {
      // Skip rows with fewer seats than needed
      if (row.seats.length < count) continue;

      // Find consecutive available seats in this row
      const consecutiveSeats = findConsecutiveInRow(row.seats, count);
      
      if (consecutiveSeats.length > 0) {
        // Calculate score (average price tier - lower is better)
        const avgPriceTier = consecutiveSeats.reduce((sum, seat) => sum + seat.priceTier, 0) / count;
        
        results.push({
          seats: consecutiveSeats,
          section,
          row,
          score: avgPriceTier,
        });
      }
    }
  }

  // Return best match (lowest score = best price)
  if (results.length === 0) return null;
  
  results.sort((a, b) => a.score - b.score);
  return results[0].seats;
}

function findConsecutiveInRow(seats: Seat[], count: number): Seat[] {
  // Sort seats by column number to ensure correct order
  const sortedSeats = [...seats].sort((a, b) => a.col - b.col);
  
  for (let i = 0; i <= sortedSeats.length - count; i++) {
    const candidate = sortedSeats.slice(i, i + count);
    
    // Check if all seats are available
    const allAvailable = candidate.every(seat => seat.status === 'available');
    if (!allAvailable) continue;
    
    // Check if seats are truly consecutive (col numbers differ by 1)
    const isConsecutive = candidate.every((seat, idx) => {
      if (idx === 0) return true;
      return seat.col === candidate[idx - 1].col + 1;
    });
    
    if (isConsecutive) {
      return candidate;
    }
  }
  
  return [];
}

export interface FindAdjacentOptions {
  preferredSection?: string;
  preferredPriceTier?: number;
  preferCenter?: boolean; // Prefer center seats over aisle
}

export function findAdjacentSeatsWithPreferences(
  venue: Venue,
  count: number,
  options: FindAdjacentOptions = {}
): Seat[] | null {
  if (count < 2 || count > 8) {
    throw new Error('Count must be between 2 and 8');
  }

  const results: AdjacentSeatsResult[] = [];

  // Iterate through all sections and rows
  for (const section of venue.sections) {
    // Skip if preferred section specified and this isn't it
    if (options.preferredSection && section.id !== options.preferredSection) {
      continue;
    }

    for (const row of section.rows) {
      if (row.seats.length < count) continue;

      const consecutiveSeats = findConsecutiveInRow(row.seats, count);
      
      if (consecutiveSeats.length > 0) {
        let score = consecutiveSeats.reduce((sum, seat) => sum + seat.priceTier, 0) / count;
        
        // Bonus for preferred price tier
        if (options.preferredPriceTier) {
          const avgTier = score;
          const tierDiff = Math.abs(avgTier - options.preferredPriceTier);
          score += tierDiff * 0.5; // Penalty for being far from preferred tier
        }
        
        // Bonus for center seats
        if (options.preferCenter) {
          const firstSeat = consecutiveSeats[0];
          const lastSeat = consecutiveSeats[consecutiveSeats.length - 1];
          const rowCenter = row.seats.length / 2;
          const groupCenter = (firstSeat.col + lastSeat.col) / 2;
          const distanceFromCenter = Math.abs(groupCenter - rowCenter);
          score += distanceFromCenter * 0.1; // Penalty for being far from center
        }
        
        results.push({
          seats: consecutiveSeats,
          section,
          row,
          score,
        });
      }
    }
  }

  if (results.length === 0) return null;
  
  results.sort((a, b) => a.score - b.score);
  return results[0].seats;
}

/**
 * Get statistics about available adjacent seats
 * Useful for showing suggestions when exact match not found
 */
export function getAdjacentSeatsStats(venue: Venue): {
  maxConsecutive: number;
  availableGroups: Map<number, number>; // count -> number of groups
} {
  const availableGroups = new Map<number, number>();
  let maxConsecutive = 0;

  for (const section of venue.sections) {
    for (const row of section.rows) {
      // Find all consecutive groups in this row
      const sortedSeats = [...row.seats].sort((a, b) => a.col - b.col);
      let currentGroup: Seat[] = [];
      
      for (let i = 0; i < sortedSeats.length; i++) {
        const seat = sortedSeats[i];
        
        if (seat.status === 'available') {
          // Check if consecutive with previous
          if (currentGroup.length === 0 || seat.col === currentGroup[currentGroup.length - 1].col + 1) {
            currentGroup.push(seat);
          } else {
            // Start new group
            if (currentGroup.length >= 2) {
              const count = currentGroup.length;
              availableGroups.set(count, (availableGroups.get(count) || 0) + 1);
              maxConsecutive = Math.max(maxConsecutive, count);
            }
            currentGroup = [seat];
          }
        } else {
          // End current group
          if (currentGroup.length >= 2) {
            const count = currentGroup.length;
            availableGroups.set(count, (availableGroups.get(count) || 0) + 1);
            maxConsecutive = Math.max(maxConsecutive, count);
          }
          currentGroup = [];
        }
      }
      
      // Handle last group
      if (currentGroup.length >= 2) {
        const count = currentGroup.length;
        availableGroups.set(count, (availableGroups.get(count) || 0) + 1);
        maxConsecutive = Math.max(maxConsecutive, count);
      }
    }
  }

  return { maxConsecutive, availableGroups };
}
