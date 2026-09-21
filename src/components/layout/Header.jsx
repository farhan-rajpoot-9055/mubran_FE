import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu, X, Search, ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { resolveImageUrl } from '../../api/apiClient.js';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Header() {
  const { count, setIsOpen, wishlist } = useCart();
  const { store } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {store?.announcement && (
        <div className="announcement">{store.announcement}</div>
      )}

      <header className="header">
        <div className="container header__inner">
          <Link to="/" className="brand" aria-label="Store home">
            {store?.logo ? (
              <img
                className="brand__logo"
                src={resolveImageUrl(store.logo)}
                alt={`${store?.storeName || 'Ladies Suits'} logo`}
              />
            ) : (
              <>
                <span className="brand__mark" aria-hidden="true">S</span>
                <span>
                  {store?.storeName || 'Ladies Suits'}
                  <span className="brand__sub" aria-hidden="true">Elegance · Crafted</span>
                </span>
              </>
            )}
          </Link>

          <nav className="nav" aria-label="Main navigation">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            <Link to="/shop" className="icon-btn" aria-label="Search products">
              <Search size={20} />
            </Link>
            <Link to="/shop?wishlist=true" className="icon-btn" aria-label="Your wishlist">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="count-badge">{wishlist.length}</span>}
            </Link>
            <button
              type="button"
              className="icon-btn"
              aria-label="Open cart"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingBag size={20} />
              {count > 0 && <span className="count-badge">{count}</span>}
            </button>
            <button
              type="button"
              className="icon-btn hamburger"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-nav ${mobileOpen ? 'is-open' : ''}`}>
        <button
          type="button"
          className="mobile-nav__backdrop"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
        <div className="mobile-nav__panel">
          <button
            type="button"
            className="mobile-nav__close icon-btn"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `mobile-nav__link ${isActive ? 'is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/cart" className="mobile-nav__link">View Cart</Link>
        </div>
      </div>
    </>
  );
}

export default Header;