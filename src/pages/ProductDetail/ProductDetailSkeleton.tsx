import styles from './ProductDetailSkeleton.module.scss';

/** Layout-matching placeholder for the detail page while it loads. */
export function ProductDetailSkeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading product">
      <div className={styles.layout}>
        <div className={`${styles.gallery} ${styles.shimmer}`} />
        <div className={styles.info}>
          <div className={`${styles.line} ${styles.short} ${styles.shimmer}`} />
          <div className={`${styles.line} ${styles.title} ${styles.shimmer}`} />
          <div className={`${styles.line} ${styles.price} ${styles.shimmer}`} />
          <div className={styles.swatchRow}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${styles.swatch} ${styles.shimmer}`} />
            ))}
          </div>
          <div className={styles.swatchRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`${styles.size} ${styles.shimmer}`} />
            ))}
          </div>
          <div className={`${styles.line} ${styles.cta} ${styles.shimmer}`} />
        </div>
      </div>
    </div>
  );
}
