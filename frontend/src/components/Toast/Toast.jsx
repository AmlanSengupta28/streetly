import styles from './Toast.module.css';

export default function Toast({ message }) {
  return (
    <div className={message ? `${styles.toast} ${styles.show}` : styles.toast}>
      {message}
    </div>
  );
}
