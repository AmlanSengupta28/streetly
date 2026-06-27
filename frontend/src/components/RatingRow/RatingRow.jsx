import styles from './RatingRow.module.css';
import { LEVEL_LABELS } from '../../constants/categories.js';

function fillClassFor(tickLevel, selectedLevel) {
  if (tickLevel > selectedLevel) return styles.tick;
  if (selectedLevel <= 2) return `${styles.tick} ${styles.filledLow}`;
  if (selectedLevel === 3) return `${styles.tick} ${styles.filledMid}`;
  return `${styles.tick} ${styles.filledHigh}`;
}

/**
 * One category's 5-point rating control. Plain-word labels
 * (Bad/Poor/OK/Good/Great) rather than abstract stars, per the
 * "name things by what people recognize" writing guidance — a
 * resident scanning quickly should know what "3" means without
 * thinking about it.
 */
export default function RatingRow({ category, value, onChange }) {
  return (
    <div className={styles.row}>
      <div className={styles.head}>
        <span className={styles.label}>{category.label}</span>
        <span className={styles.value}>{value ? LEVEL_LABELS[value] : 'Not rated'}</span>
      </div>
      <div className={styles.ticks}>
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            aria-label={LEVEL_LABELS[level]}
            className={fillClassFor(level, value || 0)}
            onClick={() => onChange(category.key, level)}
          />
        ))}
      </div>
    </div>
  );
}
