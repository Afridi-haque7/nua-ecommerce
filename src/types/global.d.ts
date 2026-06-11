export {};

declare global {
  interface Window {
    /**
     * Set by the inline script in index.html: a catalogue/product request
     * started in parallel with the JS bundle download. Consumed (once) by
     * src/api/products.ts so the app doesn't refetch what's already in flight.
     */
    __nuaEarlyFetch?: {
      url: string;
      promise: Promise<unknown>;
    };
  }
}
