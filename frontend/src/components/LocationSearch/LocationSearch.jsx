import { useState } from 'react';
import styles from './LocationSearch.module.css';

/**
 * Geocoding search — turns typed text into coordinates and re-centers
 * the map there. Distinct from SearchBar: this looks up *places*
 * (via OpenStreetMap's free Nominatim service), not existing reports.
 * Scoped to "near Gurgaon" via a viewbox bias so "Sector 14" doesn't
 * resolve to a Sector 14 somewhere else in the world.
 */
export default function LocationSearch({ onLocate }) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    if (!value.trim()) return;
    setStatus('Searching…');
    try {
      const params = new URLSearchParams({
        format: 'json',
        q: value.trim(),
        viewbox: '76.9,28.55,77.15,28.35', // rough Gurgaon bounding box
        bounded: '0', // bias toward the box, don't hard-exclude results outside it
        limit: '1',
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      const results = await res.json();
      if (!results.length) {
        setStatus('No match found. Try a more specific name.');
        return;
      }
      const { lat, lon, display_name } = results[0];
      onLocate(parseFloat(lat), parseFloat(lon), display_name);
      setStatus('');
    } catch {
      setStatus('Search failed. Check your connection and try again.');
    }
  }

  return (
    <>
      <form className={styles.wrap} onSubmit={handleSearch}>
        <input
          type="text"
          className={styles.input}
          placeholder="Search a place, e.g. Sector 49"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className={styles.btn}>Go</button>
      </form>
      {status && <p className={styles.status}>{status}</p>}
    </>
  );
}
