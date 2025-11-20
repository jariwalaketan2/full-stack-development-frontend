import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useVenue } from '../useVenue';

describe('useVenue', () => {
  const mockVenueData = {
    venueId: 'test-venue',
    name: 'Test Arena',
    map: { width: 800, height: 600 },
    sections: [
      {
        id: 'section-1',
        label: 'Premium - $200',
        transform: { x: 0, y: 0, scale: 1 },
        rows: [
          {
            index: 1,
            seats: [
              {
                id: 'S1-R1-1',
                col: 1,
                x: 100,
                y: 100,
                priceTier: 1,
                status: 'available',
              },
              {
                id: 'S1-R1-2',
                col: 2,
                x: 120,
                y: 100,
                priceTier: 1,
                status: 'reserved',
              },
            ],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should start with loading true and venue null', () => {
      vi.mocked(fetch).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useVenue());

      expect(result.current.loading).toBe(true);
      expect(result.current.venue).toBeNull();
    });
  });

  describe('Successful Data Loading', () => {
    it('should load venue data from /venue.json', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVenueData,
      } as Response);

      const { result } = renderHook(() => useVenue());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.venue).toBeTruthy();
      expect(result.current.venue?.venueId).toBe('test-venue');
      expect(result.current.venue?.name).toBe('Test Arena');
    });

    it('should call fetch with correct URL', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVenueData,
      } as Response);

      renderHook(() => useVenue());

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/venue.json');
      });
    });

    it('should set loading to false after successful fetch', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVenueData,
      } as Response);

      const { result } = renderHook(() => useVenue());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should parse JSON correctly', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVenueData,
      } as Response);

      const { result } = renderHook(() => useVenue());

      await waitFor(() => {
        expect(result.current.venue).toBeTruthy();
      });

      expect(result.current.venue?.map.width).toBe(800);
      expect(result.current.venue?.map.height).toBe(600);
      expect(result.current.venue?.sections).toHaveLength(1);
    });
  });

  describe('Seat Metadata Enrichment', () => {
    it('should enrich seats with sectionId', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVenueData,
      } as Response);

      const { result } = renderHook(() => useVenue());

      await waitFor(() => {
        expect(result.current.venue).toBeTruthy();
      });

      const seat = result.current.venue?.sections[0].rows[0].seats[0];
      expect(seat?.sectionId).toBe('section-1');
    });

    it('should enrich seats with sectionLabel', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVenueData,
      } as Response);

      const { result } = renderHook(() => useVenue());

      await waitFor(() => {
        expect(result.current.venue).toBeTruthy();
      });

      const seat = result.current.venue?.sections[0].rows[0].seats[0];
      expect(seat?.sectionLabel).toBe('Premium - $200');
    });

    it('should enrich seats with rowIndex', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVenueData,
      } as Response);

      const { result } = renderHook(() => useVenue());

      await waitFor(() => {
        expect(result.current.venue).toBeTruthy();
      });

      const seat = result.current.venue?.sections[0].rows[0].seats[0];
      expect(seat?.rowIndex).toBe(1);
    });

    it('should enrich all seats in all sections and rows', async () => {
      const multiSectionData = {
        ...mockVenueData,
        sections: [
          mockVenueData.sections[0],
          {
            id: 'section-2',
            label: 'Standard - $100',
            transform: { x: 0, y: 200, scale: 1 },
            rows: [
              {
                index: 2,
                seats: [
                  {
                    id: 'S2-R2-1',
                    col: 1,
                    x: 100,
                    y: 300,
                    priceTier: 3,
                    status: 'available',
                  },
                ],
              },
            ],
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => multiSectionData,
      } as Response);

      const { result } = renderHook(() => useVenue());

      await waitFor(() => {
        expect(result.current.venue).toBeTruthy();
      });

      const seat1 = result.current.venue?.sections[0].rows[0].seats[0];
      const seat2 = result.current.venue?.sections[1].rows[0].seats[0];

      expect(seat1?.sectionId).toBe('section-1');
      expect(seat2?.sectionId).toBe('section-2');
      expect(seat2?.sectionLabel).toBe('Standard - $100');
      expect(seat2?.rowIndex).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useVenue());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.venue).toBeNull();
    });

    it('should set loading to false on error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useVenue());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle JSON parse errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      const { result } = renderHook(() => useVenue());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.venue).toBeNull();
    });

    it('should handle 404 errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      } as Response);

      const { result } = renderHook(() => useVenue());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle empty response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      } as Response);

      const { result } = renderHook(() => useVenue());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Hook Lifecycle', () => {
    it('should only fetch once on mount', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockVenueData,
      } as Response);

      const { rerender } = renderHook(() => useVenue());

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      rerender();
      rerender();

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
