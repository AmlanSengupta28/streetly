import { useEffect, useState } from 'react';
import styles from './SearchBar.module.css';

/**
 * Debounced text search over existing reports — area name, tag, or
 * comment. This filters what's already in the database; it does not
 * look up new places (see LocationSearch for that).
 */
export default function SearchBar({ placeholder = 'Search by street, sector or issue…', onSearch, onClear }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!value.trim()) {
      onClear();
      return;
    }
    const id = setTimeout(() => onSearch(value.trim()), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={styles.wrap}>
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button type="button" className={styles.clearBtn} onClick={() => setValue('')}>
          Clear
        </button>
      )}
    </div>
  );
}
