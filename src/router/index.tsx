import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/App';
import { ProductListing } from '@/pages/ProductListing/ProductListing';
import { ProductDetail } from '@/pages/ProductDetail/ProductDetail';
import { NotFound } from '@/pages/NotFound/NotFound';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <ProductListing /> },
        { path: 'product/:id', element: <ProductDetail /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  {
    // Opt into v7 behaviour now to stay forward-compatible and quiet the warnings.
    future: {
      v7_relativeSplatPath: true,
    },
  },
);
