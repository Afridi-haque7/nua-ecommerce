import { useToast, type ToastVariant } from '@/stores/ToastContext';
import { CheckIcon, CloseIcon } from '@/components/common/Icons';
import styles from './ToastViewport.module.scss';

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === 'success') return <CheckIcon width={18} height={18} />;
  if (variant === 'error') return <CloseIcon width={18} height={18} />;
  // Info — a simple "i" glyph keeps the icon set tiny.
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 11v5M12 8h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Fixed-position stack of toasts. Mount once, near the app root. */
export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className={styles.viewport} role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={styles.toast}
          data-variant={toast.variant}
          // Errors interrupt; info/success announce politely.
          role={toast.variant === 'error' ? 'alert' : 'status'}
          aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
        >
          <span className={styles.icon}>
            <ToastIcon variant={toast.variant} />
          </span>
          <div className={styles.body}>
            {toast.title && <p className={styles.title}>{toast.title}</p>}
            <p className={styles.message}>{toast.message}</p>
          </div>
          <button
            type="button"
            className={styles.dismiss}
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
