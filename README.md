# Nua Store

A small, fast storefront built as a production-quality mini e-commerce app:
browse a catalogue, open a product, pick a colour/size variant, and manage a
cart that persists across refreshes.

**Live demo:** [Nua Ecommerce](https://nua-ecommerce-gules.vercel.app/) &nbsp;·&nbsp; built with React 18 +
TypeScript + Vite + SCSS modules.

> The product catalogue comes from the [Fake Store API](https://fakestoreapi.com).
> That API has no brand, sale, colour, size or stock data, so the app **synthesises
> those deterministically from each product id** — see [DECISIONS.md](./DECISIONS.md),
> which is the best place to start reading.

---

## Getting started

Requires **Node 18+** (developed on Node 22).

```bash
npm install
npm run dev        # → http://localhost:5173
```

| Script            | What it does                                            |
| ----------------- | ------------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                               |
| `npm run build`   | Typecheck (`tsc --noEmit`) + production build            |
| `npm run preview` | Serve the built app from `dist/`                        |
| `npm run test`    | Run the Vitest unit/component suite                     |
| `npm run lint`    | ESLint                                                   |
| `npm run perf`    | unlighthouse scan of all routes (needs `preview` running) |

`npm run dev` works out of the box on a fresh clone, and `npm run build`
completes without errors.

---

## What's implemented

**Product listing (`/`)** — responsive grid (4 cols desktop → 2 cols mobile),
each card shows image, brand, name and price (with sale price crossed out).
A **Quick add** button adds the first in-stock variant straight from the card;
image and name link to the detail page. Loading shows skeletons; a fetch
failure shows a retry panel.

**Product detail (`/product/:id`)** — large image with clickable thumbnail
views, brand, title, sale-aware price, **colour swatches** and **size buttons**
that render `in stock / low stock / sold out` states, a quantity picker, and an
**Add to cart** button that disables for sold-out variants. The selected
variant lives in the URL (`?color=…&size=…`) so the page is deep-linkable.

**Navbar + cart drawer** — a cart icon with a live item-count badge opens a
right-side drawer (overlay, focus-trap, `Esc` to close, body-scroll lock). The
drawer lists each line with thumbnail, name, variant, unit price and an inline
quantity stepper / remove control, and a bill summary (subtotal, shipping,
total). **Cart state persists in `localStorage`** and survives a refresh.
Checkout isn't wired to a payment provider, so the button closes the drawer and
raises a toast explaining it's a demo (`ToastContext` + `ToastViewport`, an
accessible `aria-live` notification stack).

**Add to cart is wired to a mock async endpoint** (`src/api/cart.ts`) with
latency and a simulated ~15% random failure, so the button exercises real
loading / success / error states.

---

## Project structure

```
src/
  api/          # Fake Store fetch + mock async add-to-cart
  components/   # focused UI components, each with a co-located .module.scss
  data/         # merchandising config + deterministic variant generator
  hooks/        # useLocalStorage, useProducts, useProduct, useAddToCart
  pages/        # ProductListing, ProductDetail, NotFound (+ skeletons)
  router/       # React Router route table
  stores/       # CartContext (global state) + pure cartMath
  styles/       # SCSS tokens, mixins, reset, globals
  types/        # shared domain types
tests/          # Vitest unit + component tests
docs/           # Lighthouse report + screenshot
```

## State management

The only global state is the cart, so it uses the **Context API** (`src/stores/
CartContext.tsx`) plus a generic `useLocalStorage` hook — no external store
needed. The cart *logic* (merging, clamping, totals) is extracted into a pure
`cartMath.ts`, which keeps the context thin and the rules unit-testable without
React. Rationale is expanded in [DECISIONS.md](./DECISIONS.md).

## Styling

SCSS modules only — no Tailwind, no CSS-in-JS. Design tokens (colour, spacing,
type scale, radii, breakpoints) and mixins live in `src/styles/abstracts` and
are injected into every module via Vite, so components reference `$color-accent`,
`@include below('mobile')`, etc. without per-file imports.

## Testing

29 tests across the variant generator, cart math, and the variant selector UI —
covering the bonus cases explicitly: **sold-out state**, **disabled CTA**
(deep-linked sold-out variant), and **quantity cap**.

```bash
npm run test
```

## Performance

Measured two ways against the production build; screenshots and score JSON in
[`docs/`](./docs).

**Lighthouse** (desktop preset, home page):

| Performance | Accessibility | Best Practices | SEO |
| :---------: | :-----------: | :------------: | :-: |
|     95      |      100      |      100       | 100 |

FCP 0.3s · LCP 1.5s · TBT 0ms · **CLS 0**.

**unlighthouse** (`npm run perf`) scans every route — `/` plus a sample of
`/product/*` pages across all four categories — one route at a time so parallel
Chrome instances don't fight over the network:

| Route        | Perf  | A11y | BP  | SEO | CLS |
| ------------ | :---: | :--: | :-: | :-: | :-: |
| `/`          | 75    | 100  | 100 | 100 |  0  |
| `/product/*` | 79–81 | 100  | 100 | 100 |  0  |

Acting on the reports, in order of impact:

- **Early data fetch** (the SPA's structural cost): a client-rendered app
  normally serialises HTML → JS → API → image. An inline script in
  `index.html` now starts the catalogue/product request *in parallel with the
  bundle download* (consumed once by `src/api/products.ts`), and injects a
  `<link rel="preload">` for the LCP image the moment the JSON arrives —
  before React has even mounted.
- **Static app shell**: the same script paints a route-aware skeleton (with
  real navbar/heading text, so it counts as first contentful paint) from raw
  HTML/CSS before the bundle executes. React replaces it with its identical
  skeleton component, so the swap shifts nothing.
- **Image delivery**: product images are the API's full-size PNGs
  (300–700 KB). They're served resized + webp via the wsrv.nl image proxy
  (~30 KB for a card), with a per-image fallback to the original URL if the
  proxy errors. `preconnect` hints warm both origins.
- **Zero layout shift**: media boxes are locked squares and every loading
  skeleton (shell → React skeleton → content) mirrors the final layout
  row-for-row.
- `fetchpriority="high"` on the LCP image (detail hero, first card row);
  below-fold cards stay lazy.
- Fixed a contrast failure unlighthouse caught on product pages (the rating
  colour) that the single-page Lighthouse run never saw.
- `robots.txt`, heading order, accessible names on image links.

Why not SSR? It would collapse the chain further, but requires a Node server —
this app deploys as static files anywhere. The early-fetch + app-shell pair
recovers most of SSR's win at none of its operational cost (see DECISIONS.md).
Remaining variance in the perf score tracks the third-party image hosts, not
the app: unlighthouse simulates a slow connection (its ~1.4 s FCP floor is
connection setup, identical on every route).

## Deployment

The app is a static SPA. `vercel.json` and `public/_redirects` already configure
the catch-all rewrite so deep links (e.g. `/product/3?color=slate&size=m`) resolve.

```bash
# Vercel:  vercel --prod         (build cmd: npm run build, output: dist)
# Netlify: netlify deploy --prod --build
```

## Known trade-offs

- **Synthesised merchandising data.** Brand/sale/colour/size/stock are generated
  from the product id, not real. Deterministic, so deep links and refreshes are
  stable — but it's invented data. (DECISIONS.md, gap #1.)
- **Single API image per product.** The detail "gallery" derives framed crops of
  the one image the API provides rather than faking duplicate thumbnails.
- **Third-party image proxy.** Resized webp images come from wsrv.nl; each
  image falls back to the original API URL on error, but a full outage of both
  hosts would leave empty squares. A self-hosted resizer would remove the
  dependency.
- **Mock checkout.** There's no backend, so Checkout raises a "payment not
  integrated" toast rather than starting a real flow; the random add-to-cart
  failure is likewise illustrative.
