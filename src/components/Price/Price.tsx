import type { Product } from '@/types';
import { discountPercent, formatPrice } from '@/utils/format';
import styles from './Price.module.scss';

interface PriceProps {
  product: Pick<Product, 'listPrice' | 'salePrice'>;
  /** `lg` is used on the detail page, `sm` on cards. */
  size?: 'sm' | 'lg';
  showBadge?: boolean;
}

/** Renders the effective price, crossing out the list price when on sale. */
export function Price({ product, size = 'sm', showBadge = false }: PriceProps) {
  const onSale = product.salePrice !== null;
  const current = product.salePrice ?? product.listPrice;

  return (
    <div className={`${styles.price} ${styles[size]}`}>
      <span className={onSale ? styles.sale : styles.current}>
        {formatPrice(current)}
      </span>
      {onSale && (
        <>
          <span className={styles.original}>
            {formatPrice(product.listPrice)}
          </span>
          {showBadge && (
            <span className={styles.badge}>
              −{discountPercent(product.listPrice, product.salePrice!)}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
