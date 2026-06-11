# Decisions

## The three gaps in the spec

**1. The Fake Store API has none of the data the spec asks me to display.**
A product from `fakestoreapi.com` is just `{ id, title, price, description, category,
image, rating }` — no brand, sale price, colours, sizes, or stock. But the brief
requires all of them. I chose to **synthesise that merchandising data deterministically
from the product id** (`src/data/variants.ts`) rather than hard-code a parallel fixture
file. A seeded PRNG keyed on the id picks the brand, sale, colour set, size set and a
per-`colour/size` stock matrix. Determinism is the whole point: a deep-linked variant URL
or a refresh must always resolve to the same state, which a `Math.random()` approach would
break.

**2. How is the selected variant represented in the URL?**
Path (`/product/3/slate/xs`) or query (`/product/3?color=slate&size=xs`). I went with
**query params**. Colour and size are orthogonal filters on one resource, not a deeper
resource, so they read more naturally as query state, and the route stays a single clean
`product/:id`. The page canonicalises the URL on load — invalid or missing params fall back
to the first *buyable* variant and `replace()` the URL — so every link is shareable in its
exact state.

**3. What is a cart line, and what does "Quick add" add?**
The same shirt in two sizes should be two lines, so the cart is **keyed by
`productId/colour/size`**; adding the same variant merges quantity (capped at 10). "Quick add"
on a card has no variant UI, so it adds the **first in-stock variant**, and the card disables
itself when the product is entirely sold out.

## The architectural call I could have gone either way on

Runtime synthesis (above) vs. **a committed static `products.enriched.json`**. A static file
is debuggable, reviewable in a diff, and lets a designer tweak one product. I picked runtime
synthesis because the catalogue is fetched live and ids aren't stable forever — a fixture
would silently drift out of sync with the API, and 20 hand-authored stock matrices is busywork.
The cost is that the variant data is "invisible" until you read the generator; I mitigated that
by keeping all of it in one small, pure, unit-tested module.

**State management:** Context API, not Redux/Zustand. The only global state is the cart (one
array) plus drawer visibility. Context + a `useLocalStorage` hook covers it with zero deps; the
cart *math* lives in a pure `cartMath.ts` so it's testable without React. A library would be
ceremony here.

## With more time

- A real toast system instead of the button's transient success/error label.
- The unlighthouse scan pushed me to proxy the API's 300–700 KB PNGs through wsrv.nl
  (resized webp, ~10% of the bytes, with a fallback to the original URL). With more time
  I'd add `srcset` widths per breakpoint and self-host the resizer instead of depending
  on a third party.
- The remaining LCP cost is the SPA request chain (HTML → JS → API → image); SSR or
  build-time prerendering of the listing would collapse it.
- Persist the cart through a tiny schema-versioned migration rather than a bare `v1` key.
- Component tests for the drawer focus-trap; right now that's verified by hand.
