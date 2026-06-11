import { Link } from 'react-router-dom';
import styles from './NotFound.module.scss';

export function NotFound() {
  return (
    <div className={styles.wrap}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.message}>
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link to="/" className={styles.cta}>
        Back to shop
      </Link>
    </div>
  );
}
