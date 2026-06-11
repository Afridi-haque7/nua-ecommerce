import { MAX_QTY_PER_ITEM } from '@/data/constants';
import { MinusIcon, PlusIcon } from '@/components/common/Icons';
import styles from './QuantityPicker.module.scss';

interface QuantityPickerProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  /** Accessible label, e.g. the product title. */
  label?: string;
}

/** Stepper with a clamped range. Used on the detail page and in the cart. */
export function QuantityPicker({
  value,
  onChange,
  min = 1,
  max = MAX_QTY_PER_ITEM,
  size = 'md',
  label = 'Quantity',
}: QuantityPickerProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div
      className={`${styles.picker} ${styles[size]}`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={styles.step}
        onClick={() => onChange(value - 1)}
        disabled={atMin}
        aria-label="Decrease quantity"
      >
        <MinusIcon width={16} height={16} />
      </button>
      <span className={styles.value} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={styles.step}
        onClick={() => onChange(value + 1)}
        disabled={atMax}
        aria-label="Increase quantity"
        title={atMax ? `Maximum ${max} per item` : undefined}
      >
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  );
}
