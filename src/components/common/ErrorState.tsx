import styles from './ErrorState.module.scss';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/** A centred error panel with an optional retry action. */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.wrap} role="alert">
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
