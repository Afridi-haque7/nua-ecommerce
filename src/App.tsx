import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CartProvider } from '@/stores/CartContext';
import { ToastProvider } from '@/stores/ToastContext';
import { Navbar } from '@/components/Navbar/Navbar';
import { CartDrawer } from '@/components/CartDrawer/CartDrawer';
import { ToastViewport } from '@/components/Toast/ToastViewport';

/** Reset scroll to the top whenever the path (not the query) changes. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** App shell: global providers, persistent chrome, and the routed outlet. */
export function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <ScrollToTop />
        <Navbar />
        <main>
          <Outlet />
        </main>
        <CartDrawer />
        <ToastViewport />
      </CartProvider>
    </ToastProvider>
  );
}
