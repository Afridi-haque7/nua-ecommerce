import type { Product } from '@/types';
import { getStock } from '@/data/variants';
import styles from './ColorSwatches.module.scss';

interface ColorSwatchesProps {
  product: Product;
  selectedColorId: string;
  onSelect: (colorId: string) => void;
}

export function ColorSwatches({
  product,
  selectedColorId,
  onSelect,
}: ColorSwatchesProps) {
  const selected = product.colors.find((c) => c.id === selectedColorId);

  return (
    <div className={styles.block}>
      <div className={styles.label}>
        Colour
        {selected && <span className={styles.selectedName}>{selected.name}</span>}
      </div>
      <div className={styles.swatches} role="radiogroup" aria-label="Colour">
        {product.colors.map((color) => {
          // A colour is "out" only when every size in it is sold out.
          const colorSoldOut = product.sizes.every(
            (s) => getStock(product, color.id, s.id) === 'sold_out',
          );
          const isSelected = color.id === selectedColorId;
          return (
            <button
              key={color.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${color.name}${colorSoldOut ? ', sold out' : ''}`}
              className={styles.swatch}
              data-selected={isSelected}
              data-soldout={colorSoldOut}
              onClick={() => onSelect(color.id)}
            >
              <span
                className={styles.fill}
                style={{ backgroundColor: color.hex }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
