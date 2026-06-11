import type { Product, StockState } from '@/types';
import { getStock } from '@/data/variants';
import styles from './SizeSelector.module.scss';

interface SizeSelectorProps {
  product: Product;
  selectedColorId: string;
  selectedSizeId: string;
  onSelect: (sizeId: string) => void;
}

const STOCK_HINT: Record<StockState, string> = {
  in_stock: '',
  low_stock: 'Low stock',
  sold_out: 'Sold out',
};

export function SizeSelector({
  product,
  selectedColorId,
  selectedSizeId,
  onSelect,
}: SizeSelectorProps) {
  const selectedStock = getStock(product, selectedColorId, selectedSizeId);

  return (
    <div className={styles.block}>
      <div className={styles.label}>Size</div>
      <div className={styles.sizes} role="radiogroup" aria-label="Size">
        {product.sizes.map((size) => {
          const stock = getStock(product, selectedColorId, size.id);
          const soldOut = stock === 'sold_out';
          const isSelected = size.id === selectedSizeId;
          return (
            <button
              key={size.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${size.label}${
                STOCK_HINT[stock] ? `, ${STOCK_HINT[stock]}` : ''
              }`}
              className={styles.size}
              data-selected={isSelected}
              data-stock={stock}
              disabled={soldOut}
              onClick={() => !soldOut && onSelect(size.id)}
            >
              {size.label}
              {stock === 'low_stock' && <span className={styles.dot} />}
            </button>
          );
        })}
      </div>

      {/* Live hint for the *currently selected* variant. */}
      {STOCK_HINT[selectedStock] && (
        <p
          className={styles.hint}
          data-stock={selectedStock}
          aria-live="polite"
        >
          {selectedStock === 'low_stock'
            ? 'Low stock — only a few left'
            : 'This size is sold out'}
        </p>
      )}
    </div>
  );
}
