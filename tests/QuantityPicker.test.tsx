import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuantityPicker } from '@/components/QuantityPicker/QuantityPicker';
import { MAX_QTY_PER_ITEM } from '@/data/constants';

describe('QuantityPicker', () => {
  it('disables decrement at the minimum', () => {
    render(<QuantityPicker value={1} onChange={() => {}} />);
    expect(screen.getByLabelText(/decrease quantity/i)).toBeDisabled();
    expect(screen.getByLabelText(/increase quantity/i)).toBeEnabled();
  });

  it('disables increment at the per-item cap', () => {
    render(<QuantityPicker value={MAX_QTY_PER_ITEM} onChange={() => {}} />);
    expect(screen.getByLabelText(/increase quantity/i)).toBeDisabled();
  });

  it('steps the value up and down', async () => {
    const onChange = vi.fn();
    render(<QuantityPicker value={5} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText(/increase quantity/i));
    expect(onChange).toHaveBeenCalledWith(6);
    await userEvent.click(screen.getByLabelText(/decrease quantity/i));
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
