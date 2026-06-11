const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/** Format a number as USD, e.g. 109.95 → "$109.95". */
export function formatPrice(value: number): string {
  return currency.format(value);
}

/** Percentage saved between a list and sale price, rounded, e.g. 25 (%). */
export function discountPercent(listPrice: number, salePrice: number): number {
  if (listPrice <= 0) return 0;
  return Math.round((1 - salePrice / listPrice) * 100);
}
