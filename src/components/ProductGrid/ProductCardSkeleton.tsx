import styles from './ProductCardSkeleton.module.scss';

/**
 * Placeholder card shown while the catalogue loads. Mirrors ProductCard's
 * exact layout (square media / brand / two-line title / price row / CTA) so
 * the swap from skeleton to content causes zero layout shift.
 */
export function ProductCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={`${styles.media} ${styles.shimmer}`} />
      <div className={styles.body}>
        <div className={`${styles.brand} ${styles.shimmer}`} />
        <div className={`${styles.titleLine} ${styles.shimmer}`} />
        <div className={`${styles.titleLine} ${styles.short} ${styles.shimmer}`} />
        <div className={`${styles.price} ${styles.shimmer}`} />
        <div className={`${styles.cta} ${styles.shimmer}`} />
      </div>
    </div>
  );
}
