import styles from './ScorePlate.module.css';
import { scoreColor } from '../../utils/score.js';

/**
 * The app's signature element — a milestone-style plate showing a
 * 0-100 civic score, color-coded green/amber/red. Reused on map
 * popups, feed cards, and the detail modal so the score always
 * looks the same no matter where it appears.
 */
export default function ScorePlate({ score, size = 'md' }) {
  return (
    <div
      className={styles.plate}
      style={{ '--plate-color': scoreColor(score), fontSize: size === 'sm' ? '0.85em' : undefined }}
    >
      <span className={styles.num}>{score}</span>
      <span className={styles.den}>/100</span>
    </div>
  );
}
