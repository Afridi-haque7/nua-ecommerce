// ---------------------------------------------------------------------------
// Mock "add to cart" endpoint  (bonus requirement)
// ---------------------------------------------------------------------------
// There is no real cart endpoint, so this simulates a network round-trip with
// latency and an occasional random failure. The UI wires its loading + error
// states to this promise; the actual cart mutation happens locally on success.

export class AddToCartError extends Error {
  constructor(message = 'Something went wrong adding that to your cart.') {
    super(message);
    this.name = 'AddToCartError';
  }
}

export interface AddToCartRequest {
  productId: number;
  colorId: string;
  sizeId: string;
  quantity: number;
}

const LATENCY_MS = 600;
const FAILURE_RATE = 0.15; // ~1 in 7 attempts fails, to exercise the error path

export function addToCartRequest(req: AddToCartRequest): Promise<AddToCartRequest> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < FAILURE_RATE) {
        reject(new AddToCartError());
      } else {
        resolve(req);
      }
    }, LATENCY_MS);
  });
}
