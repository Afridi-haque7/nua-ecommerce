import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { firstAvailableVariant } from '@/data/variants';
import { useAddToCart } from '@/hooks/useAddToCart';
import { Price } from '@/components/Price/Price';
import { ProductImage } from '@/components/common/ProductImage';
import { Spinner } from '@/components/common/Spinner';
import { CheckIcon } from '@/components/common/Icons';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
  /** Eager-load the image for above-the-fold cards (helps LCP). */
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { status, add } = useAddToCart();
  const available = firstAvailableVariant(product);
  const soldOut = available === null;

  const handleQuickAdd = () => {
    if (!available || status === 'loading') return;
    add(product, available.colorId, available.sizeId, 1, {
      openDrawerOnSuccess: true,
    });
  };

  return (
    <article className={styles.card}>
      <Link
        to={`/product/${product.id}`}
        className={styles.media}
        aria-label={product.title}
        tabIndex={-1}
      >
        {product.salePrice !== null && (
          // Decorative — the sale is also conveyed by the crossed-out price.
          <span className={styles.saleTag} aria-hidden="true">
            Sale
          </span>
        )}
        <ProductImage
          src={product.image}
          size={480}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          // Lowercase passes through React 18 as a real DOM attribute.
          fetchpriority={priority ? 'high' : 'auto'}
          decoding="async"
        />
      </Link>

      <div className={styles.body}>
        <p className={styles.brand}>{product.brand}</p>
        <h2 className={styles.title}>
          <Link to={`/product/${product.id}`}>{product.title}</Link>
        </h2>

        <div className={styles.priceRow}>
          <Price product={product} size="sm" />
          <span
            className={styles.rating}
            aria-label={`Rated ${product.rating.rate} out of 5`}
          >
            ★ {product.rating.rate.toFixed(1)}
          </span>
        </div>

        <button
          type="button"
          className={styles.quickAdd}
          onClick={handleQuickAdd}
          disabled={soldOut || status === 'loading'}
          data-status={status}
        >
          {soldOut ? (
            'Sold out'
          ) : status === 'loading' ? (
            <Spinner size={16} label="Adding" />
          ) : status === 'success' ? (
            <>
              <CheckIcon width={16} height={16} /> Added
            </>
          ) : status === 'error' ? (
            'Try again'
          ) : (
            'Quick add'
          )}
        </button>
      </div>
    </article>
  );
}
