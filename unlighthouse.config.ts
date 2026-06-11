// Config for `npx unlighthouse-ci` — scans the production build (vite preview)
// across all discovered routes. See README "Performance".
export default {
  site: 'http://localhost:4173',
  outputPath: 'docs/unlighthouse',
  // The SPA renders its product links only after the catalogue API resolves,
  // so the crawler sees an empty page — provide the routes explicitly instead.
  // /product/* pages share one template; a sample of categories is enough.
  urls: [
    '/',
    '/product/1', // men's clothing (bag)
    '/product/3', // sale item
    '/product/7', // jewellery
    '/product/12', // electronics
    '/product/18', // women's clothing
  ],
  scanner: {
    samples: 1,
    device: 'desktop',
    throttle: false,
  },
  puppeteerOptions: {
    // Use the system Chrome; the bundled Chromium download is skipped on install.
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-gpu'],
  },
  // Scan routes one at a time. Parallel Chrome instances all pull product
  // images from fakestoreapi.com at once and skew LCP badly — serialized runs
  // reflect what a single visitor actually experiences.
  puppeteerClusterOptions: {
    maxConcurrency: 1,
  },
  ci: {
    buildStatic: true,
  },
};
