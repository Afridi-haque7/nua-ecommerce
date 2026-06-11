import { Link } from 'react-router-dom';
import type { CartItem } from '@/types';
import { useCart } from '@/stores/CartContext';
import { formatPrice } from '@/utils/format';
import { QuantityPicker } from '@/components/QuantityPicker/QuantityPicker';
import { ProductImage } from '@/components/common/ProductImage';
import { TrashIcon } from '@/components/common/Icons';
import styles from './CartLineItem.module.scss';

interface CartLineItemProps {
  item: CartItem;
  /** Closes the drawer when the user follows the product link. */
  onNavigate: () => void;
}

export function CartLineItem({ item, onNavigate }: CartLineItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <li className={styles.item}>
      <Link
        to={`/product/${item.productId}?color=${item.colorId}&size=${item.sizeId}`}
        className={styles.thumb}
        onClick={onNavigate}
      >
        <ProductImage src={item.image} size={160} alt={item.title} loading="lazy" />
      </Link>

      <div className={styles.details}>
        <div className={styles.top}>
          <div className={styles.titleWrap}>
            <Link
              to={`/product/${item.productId}?color=${item.colorId}&size=${item.sizeId}`}
              className={styles.title}
              onClick={onNavigate}
            >
              {item.title}
            </Link>
            <p className={styles.variant}>
              {item.colorName} · {item.sizeLabel}
            </p>
          </div>
          <button
            type="button"
            className={styles.remove}
            onClick={() => removeItem(item.key)}
            aria-label={`Remove ${item.title} from cart`}
          >
            <TrashIcon width={18} height={18} />
          </button>
        </div>

        <div className={styles.bottom}>
          <QuantityPicker
            value={item.quantity}
            onChange={(q) => updateQuantity(item.key, q)}
            size="sm"
            label={`Quantity for ${item.title}`}
          />
          <div className={styles.prices}>
            <span className={styles.lineTotal}>{formatPrice(lineTotal)}</span>
            {item.quantity > 1 && (
              <span className={styles.unit}>
                {formatPrice(item.unitPrice)} each
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
