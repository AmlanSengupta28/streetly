import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './DetailModal.module.css';
import ScorePlate from '../ScorePlate/ScorePlate.jsx';
import { CATEGORIES, LEVEL_LABELS } from '../../constants/categories.js';
import { scoreColor } from '../../utils/score.js';
import { relativeTime } from '../../utils/time.js';
import { api } from '../../api/client.js';

function miniPin(score) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${scoreColor(score)};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)">${score}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function DetailModal({ reportId, onClose, showToast, showMiniMap = false }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getReport(reportId)
      .then((data) => { if (!cancelled) setReport(data); })
      .catch(() => { if (!cancelled) setReport(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reportId]);

  async function handleFlag() {
    try {
      await api.flagReport(reportId);
      showToast('Thanks — this report has been flagged for review.');
      onClose();
    } catch {
      showToast('Could not flag this report. Try again.');
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        <button className={styles.closeBtn} onClick={onClose}>Close</button>

        {loading && <p>Loading…</p>}
        {!loading && !report && <p>Could not load this report.</p>}

        {!loading && report && (
          <>
            {report.photoUrl && <img className={styles.photo} src={report.photoUrl} alt="Reported location" />}
            <ScorePlate score={report.score} />
            <p className={styles.area} style={{ marginTop: 10 }}>{report.areaLabel}</p>
            {showMiniMap && !report.photoUrl && <div className={styles.miniMap}>
              <MapContainer
                center={[report.lat, report.lng]}
                zoom={16}
                style={{ width: '100%', height: '100%' }}
                dragging={false}
                scrollWheelZoom={false}
                touchZoom={false}
                doubleClickZoom={false}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
                <Marker position={[report.lat, report.lng]} icon={miniPin(report.score)} />
              </MapContainer>
            </div>}
            <p className={styles.meta}>
              {report.lat.toFixed(5)}, {report.lng.toFixed(5)} · {relativeTime(report.createdAt)}
            </p>

            {CATEGORIES.map((cat) => {
              const level = report.ratings[cat.key];
              if (!level) return null;
              return (
                <div key={cat.key} className={styles.ratingRow}>
                  <span className={styles.ratingLabel}>{cat.label}</span>
                  <div className={styles.bar}>
                    <div
                      className={styles.fill}
                      style={{ width: `${level * 20}%`, background: scoreColor(level * 20) }}
                    />
                  </div>
                  <span>{LEVEL_LABELS[level]}</span>
                </div>
              );
            })}

            {report.tags?.length > 0 && (
              <div className={styles.tags}>
                {report.tags.map((t) => <span key={t} className={styles.tagPill}>{t}</span>)}
              </div>
            )}

            {report.comment && <p className={styles.comment}>{report.comment}</p>}

            <button className={styles.flagBtn} onClick={handleFlag}>Flag this report</button>
          </>
        )}
      </div>
    </div>
  );
}
