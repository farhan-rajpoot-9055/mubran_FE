import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import CartDrawer from './CartDrawer.jsx';
import { ErrorBoundary } from '../../components/common/ErrorBoundary.jsx';
import { useEffect } from 'react';

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    document.body.classList.remove('admin-body');
  }, []);

  return (
    <ErrorBoundary>
      <div className="page-enter" key={location.pathname}>
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
      <CartDrawer />
    </ErrorBoundary>
  );
}

export default Layout;