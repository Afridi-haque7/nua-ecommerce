import { useEffect, useRef } from 'react';
import { useCart } from '@/stores/CartContext';
import { formatPrice } from '@/utils/format';
import { CloseIcon, CartIcon } from '@/components/common/Icons';
import { CartLineItem } from './CartLineItem';
import styles from './CartDrawer.module.scss';

export function CartDrawer() {
  const { items, itemCount, totals, isDrawerOpen, closeDrawer } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  // Remember what had focus so we can restore it when the drawer closes.
  const lastFocused = useRef<HTMLElement | null>(null);

  // Escape to close + lock body scroll while open.
  useEffect(() => {
    if (!isDrawerOpen) return;

    lastFocused.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer();
        return;
      }
      // Minimal focus trap: keep Tab inside the panel.
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      lastFocused.current?.focus?.();
    };
  }, [isDrawerOpen, closeDrawer]);

  return (
    <>
      <div
        className={styles.overlay}
        data-open={isDrawerOpen}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <aside
        className={styles.drawer}
        data-open={isDrawerOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!isDrawerOpen}
        // `inert` keeps the closed drawer out of the tab order entirely.
        {...(!isDrawerOpen ? { inert: '' as unknown as boolean } : {})}
      >
        <div className={styles.panel} ref={panelRef}>
          <header className={styles.header}>
            <h2 className={styles.heading}>
              Your cart
              {itemCount > 0 && (
                <span className={styles.count}>{itemCount}</span>
              )}
            </h2>
            <button
              type="button"
              ref={closeBtnRef}
              className={styles.close}
              onClick={closeDrawer}
              aria-label="Close cart"
            >
              <CloseIcon width={22} height={22} />
            </button>
          </header>

          {items.length === 0 ? (
            <div className={styles.empty}>
              <CartIcon width={40} height={40} />
              <p className={styles.emptyTitle}>Your cart is empty</p>
              <p className={styles.emptyHint}>
                Browse the store and add something you like.
              </p>
              <button
                type="button"
                className={styles.keepShopping}
                onClick={closeDrawer}
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <ul className={styles.list}>
                {items.map((item) => (
                  <CartLineItem
                    key={item.key}
                    item={item}
                    onNavigate={closeDrawer}
                  />
                ))}
              </ul>

              <footer className={styles.summary}>
                <dl className={styles.bill}>
                  <div className={styles.row}>
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(totals.subtotal)}</dd>
                  </div>
                  <div className={styles.row}>
                    <dt>Shipping</dt>
                    <dd>
                      {totals.shipping === 0
                        ? 'Free'
                        : formatPrice(totals.shipping)}
                    </dd>
                  </div>
                  <div className={`${styles.row} ${styles.grand}`}>
                    <dt>Total</dt>
                    <dd>{formatPrice(totals.grandTotal)}</dd>
                  </div>
                </dl>
                <button type="button" className={styles.checkout}>
                  Checkout
                </button>
                <p className={styles.note}>
                  Taxes calculated at checkout. This is a demo store.
                </p>
              </footer>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
