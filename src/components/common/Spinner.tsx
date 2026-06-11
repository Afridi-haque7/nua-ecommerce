import styles from './Spinner.module.scss';

interface SpinnerProps {
  /** Accessible label; also drives reduced-clutter when inline. */
  label?: string;
  size?: number;
}

/** A small accessible loading spinner. */
export function Spinner({ label = 'Loading', size = 20 }: SpinnerProps) {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    />
  );
}
