import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SizeSelector } from '@/components/VariantSelector/SizeSelector';
import { makeProduct } from './fixtures';

describe('SizeSelector', () => {
  it('renders a sold-out size as a disabled button', () => {
    const product = makeProduct();
    render(
      <SizeSelector
        product={product}
        selectedColorId="red" // red/m is sold_out
        selectedSizeId="s"
        onSelect={() => {}}
      />,
    );
    // The "M" button is sold out for red.
    expect(screen.getByRole('radio', { name: /M, sold out/i })).toBeDisabled();
    // "S" is in stock and enabled.
    expect(screen.getByRole('radio', { name: /^S$/i })).toBeEnabled();
  });

  it('does not fire onSelect for a sold-out size', async () => {
    const onSelect = vi.fn();
    render(
      <SizeSelector
        product={makeProduct()}
        selectedColorId="red"
        selectedSizeId="s"
        onSelect={onSelect}
      />,
    );
    await userEvent.click(screen.getByRole('radio', { name: /M, sold out/i }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('selects an available size', async () => {
    const onSelect = vi.fn();
    render(
      <SizeSelector
        product={makeProduct()}
        selectedColorId="blue" // blue/m is in_stock, blue/s is low_stock
        selectedSizeId="m"
        onSelect={onSelect}
      />,
    );
    await userEvent.click(screen.getByRole('radio', { name: /S, low stock/i }));
    expect(onSelect).toHaveBeenCalledWith('s');
  });

  it('surfaces a low-stock hint for the selected variant', () => {
    render(
      <SizeSelector
        product={makeProduct()}
        selectedColorId="blue"
        selectedSizeId="s" // low_stock
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText(/only a few left/i)).toBeInTheDocument();
  });
});
