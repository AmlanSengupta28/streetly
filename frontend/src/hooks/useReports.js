import { useState, useCallback } from 'react';
import { api } from '../api/client.js';

/**
 * Owns the report list + loading/error state for the Map and Feed
 * views. Kept as a plain hook (no Redux/Zustand) — the app has one
 * shared list with two ways of sorting it, which doesn't need a
 * global store yet. Reach for one if you add features that mutate
 * shared state from many unrelated components.
 */
export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listReports({ limit: 50 });
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNearby = useCallback(async (lat, lng, radiusKm = 5) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listReports({ lat, lng, radiusKm, limit: 50 });
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSearch = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listReports({ q, limit: 50 });
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addReport = useCallback((report) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  return { reports, loading, error, fetchRecent, fetchNearby, fetchSearch, addReport };
}
