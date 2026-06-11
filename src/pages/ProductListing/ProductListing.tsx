import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/ProductGrid/ProductGrid';
import { ErrorState } from '@/components/common/ErrorState';
import styles from './ProductListing.module.scss';

export function ProductListing() {
  const { products, loading, error, reload } = useProducts();

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Everything in the shop</h1>
        <p className={styles.subtitle}>
          {loading
            ? 'Loading the latest…'
            : `${products.length} products, ready to ship.`}
        </p>
      </header>

      {error ? (
        <ErrorState
          title="We couldn't load the shop"
          message={error}
          onRetry={reload}
        />
      ) : (
        <ProductGrid products={products} loading={loading} />
      )}
    </div>
  );
}
