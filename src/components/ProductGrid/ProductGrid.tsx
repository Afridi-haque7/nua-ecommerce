import type { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import styles from './ProductGrid.module.scss';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  /** How many skeletons to show while loading. */
  skeletonCount?: number;
}

export function ProductGrid({
  products,
  loading = false,
  skeletonCount = 8,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((product, i) => (
        // Eager-load the first row so the LCP image isn't lazy-loaded.
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}
