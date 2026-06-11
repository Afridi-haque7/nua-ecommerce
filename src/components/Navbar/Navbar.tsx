import { Link } from 'react-router-dom';
import { useCart } from '@/stores/CartContext';
import { CartIcon } from '@/components/common/Icons';
import styles from './Navbar.module.scss';

export function Navbar() {
  const { itemCount, openDrawer } = useCart();

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="Nua home">
          <span className={styles.mark}>◆</span>
          Nua
        </Link>

        <button
          type="button"
          className={styles.cartButton}
          onClick={openDrawer}
          aria-label={`Open cart, ${itemCount} ${
            itemCount === 1 ? 'item' : 'items'
          }`}
        >
          <CartIcon width={24} height={24} />
          {itemCount > 0 && (
            <span className={styles.badge} aria-hidden="true">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
