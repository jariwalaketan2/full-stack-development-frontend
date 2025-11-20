import { useState, useEffect, useCallback } from "react";
import { Venue, VenueLoadError, ValidationError } from "../types";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const validateVenueData = (data: any): void => {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid venue data: not an object');
  }
  if (!data.venueId || typeof data.venueId !== 'string') {
    throw new ValidationError('Invalid venue data: missing or invalid venueId');
  }
  if (!data.name || typeof data.name !== 'string') {
    throw new ValidationError('Invalid venue data: missing or invalid name');
  }
  if (!data.map || typeof data.map !== 'object') {
    throw new ValidationError('Invalid venue data: missing or invalid map');
  }
  if (!Array.isArray(data.sections)) {
    throw new ValidationError('Invalid venue data: sections must be an array');
  }
};

export const useVenue = () => {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadVenue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/venue.json");
      
      if (!response.ok) {
        throw new VenueLoadError(
          `Failed to load venue data: ${response.status} ${response.statusText}`
        );
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new VenueLoadError(
          'Failed to parse venue data: Invalid JSON format',
          parseError as Error
        );
      }

      // Validate data structure
      try {
        validateVenueData(data);
      } catch (validationError) {
        throw new VenueLoadError(
          (validationError as ValidationError).message,
          validationError as Error
        );
      }

      // Enrich seats with section and row metadata for accessibility
      const enrichedData: Venue = {
        ...data,
        sections: data.sections.map((section: any) => ({
          ...section,
          rows: section.rows.map((row: any) => ({
            ...row,
            seats: row.seats.map((seat: any) => ({
              ...seat,
              sectionId: section.id,
              sectionLabel: section.label,
              rowIndex: row.index,
            })),
          })),
        })),
      };

      setVenue(enrichedData);
      setLoading(false);
      setRetryCount(0);

      if (import.meta.env.DEV) {
        console.log('✅ Venue data loaded successfully:', enrichedData.name);
      }
    } catch (err) {
      const errorMessage = err instanceof VenueLoadError 
        ? err.message 
        : 'An unexpected error occurred while loading venue data';

      setError(errorMessage);
      setLoading(false);

      // Log error in development
      if (import.meta.env.DEV) {
        console.error('❌ Venue load error:', err);
      }

      // Auto-retry with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        if (import.meta.env.DEV) {
          console.log(`🔄 Retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        }
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, delay);
      }
    }
  }, [retryCount]);

  useEffect(() => {
    loadVenue();
  }, [loadVenue]);

  const retry = useCallback(() => {
    setRetryCount(0);
    loadVenue();
  }, [loadVenue]);

  return { venue, loading, error, retry };
};
