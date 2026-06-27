import { useEffect, useState, useCallback, useRef } from 'react';
import styles from './App.module.css';
import TabBar from './components/TabBar/TabBar.jsx';
import ReportForm from './components/ReportForm/ReportForm.jsx';
import MapView from './components/MapView/MapView.jsx';
import FeedList from './components/FeedList/FeedList.jsx';
import DetailModal from './components/DetailModal/DetailModal.jsx';
import Toast from './components/Toast/Toast.jsx';
import { useReports } from './hooks/useReports.js';

export default function App() {
  const [view, setView] = useState('report');
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [flyToTarget, setFlyToTarget] = useState(null);
  const toastTimer = useRef(null);

  const { reports, fetchRecent, fetchNearby, fetchSearch, addReport } = useReports();

  useEffect(() => { fetchRecent(); }, [fetchRecent]);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(''), 2400);
  }, []);

  function handlePublished(report) {
    addReport(report);
    setView('feed');
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <button type="button" className={styles.homeBtn} onClick={() => setView('report')}>
          <svg className={styles.logoMark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <h1 className={styles.title}>Streetly</h1>
        </button>
      </header>

      <main className={styles.main}>
        {view === 'report' && (
          <ReportForm onPublished={handlePublished} showToast={showToast} />
        )}
        {view === 'map' && (
          <div className={styles.viewPad}>
            <MapView
              reports={reports}
              onSelect={setSelectedReportId}
              flyToTarget={flyToTarget}
              onSearchLocation={({ lat, lng }) => setFlyToTarget({ lat, lng })}
            />
          </div>
        )}
        {view === 'feed' && (
          <div className={styles.viewPad}>
            <FeedList
              reports={reports}
              onSelect={setSelectedReportId}
              onRequestNearby={(loc) => fetchNearby(loc.lat, loc.lng)}
              onSearch={fetchSearch}
              onClearSearch={fetchRecent}
              showToast={showToast}
            />
          </div>
        )}
      </main>

      <TabBar active={view} onChange={setView} />

      {selectedReportId && (
        <DetailModal
          reportId={selectedReportId}
          onClose={() => setSelectedReportId(null)}
          showToast={showToast}
          showMiniMap={view === 'feed'}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
