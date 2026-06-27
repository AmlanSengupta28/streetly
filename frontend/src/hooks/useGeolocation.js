import { useState, useCallback } from 'react';

/**
 * Wraps the browser Geolocation API plus a best-effort reverse
 * geocode lookup. Returns location state and a `locate()` trigger so
 * components stay in control of *when* permission is requested.
 */
export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | locating | success | denied
  const [areaGuess, setAreaGuess] = useState(null);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('denied');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(next);
        setStatus('success');
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${next.lat}&lon=${next.lng}&zoom=16`
          );
          const data = await res.json();
          if (data?.display_name) {
            setAreaGuess(data.display_name.split(',').slice(0, 3).join(',').trim());
          }
        } catch {
          // Reverse geocoding is best-effort only — manual entry still works.
        }
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { location, status, areaGuess, locate };
}
