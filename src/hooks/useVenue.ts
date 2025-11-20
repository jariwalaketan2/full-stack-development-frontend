import { useState, useEffect } from 'react';
import { Venue } from '../types';

export const useVenue = () => {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/venue.json')
      .then(res => res.json())
      .then(data => {
        setVenue(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { venue, loading };
};