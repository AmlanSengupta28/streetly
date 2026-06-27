import styles from './TabBar.module.css';

const TABS = [
  { key: 'report', label: 'Report' },
  { key: 'map', label: 'Map' },
  { key: 'feed', label: 'Explore' },
];

export default function TabBar({ active, onChange }) {
  return (
    <nav className={styles.bar}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={tab.key === active ? `${styles.tab} ${styles.active}` : styles.tab}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
