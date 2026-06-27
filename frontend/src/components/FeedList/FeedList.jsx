import { useState } from 'react';
import styles from './FeedList.module.css';
import ReportCard from '../ReportCard/ReportCard.jsx';
import SearchBar from '../SearchBar/SearchBar.jsx';
import { haversineKm } from '../../utils/distance.js';

export default function FeedList({ reports, onSelect, onRequestNearby, onSearch, onClearSearch, showToast }) {
  const [sortMode, setSortMode] = useState('newest');
  const [userLocation, setUserLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  function handleNearest() {
    if (!navigator.geolocation) {
      showToast('Location not supported on this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setSortMode('nearest');
        onRequestNearby(loc);
      },
      () => {
        showToast('Location denied. Showing newest instead.');
        setSortMode('newest');
      }
    );
  }

  function handleSearch(q) {
    setIsSearching(true);
    onSearch(q);
  }

  function handleClear() {
    setIsSearching(false);
    onClearSearch();
  }

  const sorted = [...reports].sort((a, b) => {
    if (sortMode === 'nearest' && userLocation) {
      return (
        haversineKm(userLocation.lat, userLocation.lng, a.lat, a.lng) -
        haversineKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
      );
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <>
      <SearchBar onSearch={handleSearch} onClear={handleClear} />

      {!isSearching && (
        <div className={styles.controls}>
          <button
            type="button"
            className={sortMode === 'newest' ? `${styles.btn} ${styles.btnActive}` : styles.btn}
            onClick={() => setSortMode('newest')}
          >
            Newest
          </button>
          <button
            type="button"
            className={sortMode === 'nearest' ? `${styles.btn} ${styles.btnActive}` : styles.btn}
            onClick={handleNearest}
          >
            Nearest
          </button>
        </div>
      )}

      {!sorted.length && (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>{isSearching ? 'No matches' : 'No reports yet'}</div>
          <div>
            {isSearching
              ? 'Try a different area name or tag.'
              : 'Be the first to flag something on your road.'}
          </div>
        </div>
      )}

      {sorted.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          distanceKm={
            !isSearching && sortMode === 'nearest' && userLocation
              ? haversineKm(userLocation.lat, userLocation.lng, report.lat, report.lng)
              : null
          }
          onSelect={onSelect}
        />
      ))}
    </>
  );
}
