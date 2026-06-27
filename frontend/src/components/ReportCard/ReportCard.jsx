import styles from './ReportCard.module.css';
import ScorePlate from '../ScorePlate/ScorePlate.jsx';
import { scoreColor } from '../../utils/score.js';
import { relativeTime } from '../../utils/time.js';

export default function ReportCard({ report, distanceKm, onSelect }) {
  return (
    <div
      className={styles.card}
      style={{ '--card-color': scoreColor(report.score) }}
      onClick={() => onSelect(report.id)}
    >
      <div className={styles.top}>
        <div>
          <p className={styles.area}>{report.areaLabel}</p>
          <span className={styles.meta}>
            {distanceKm != null ? `${distanceKm.toFixed(1)} km away` : relativeTime(report.createdAt)}
          </span>
        </div>
        <ScorePlate score={report.score} />
      </div>
      {report.tags?.length > 0 && (
        <div className={styles.tags}>
          {report.tags.slice(0, 3).map((t) => (
            <span key={t} className={styles.tagPill}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
