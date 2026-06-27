import styles from './TagChips.module.css';
import { ISSUE_TAGS } from '../../constants/categories.js';

export default function TagChips({ selected, onToggle }) {
  return (
    <div className={styles.grid}>
      {ISSUE_TAGS.map((tag) => (
        <button
          key={tag}
          type="button"
          className={selected.has(tag) ? `${styles.chip} ${styles.selected}` : styles.chip}
          onClick={() => onToggle(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
