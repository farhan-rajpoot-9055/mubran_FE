import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderTree, Boxes, ShoppingBag, Users, Settings, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { resolveImageUrl } from '../../api/apiClient.js';
import { Seo } from '../../components/common/Seo.jsx';

const NAV = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { to: '/admin/inventory', icon: Boxes, label: 'Inventory' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const TITLES = {
  '': 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  inventory: 'Inventory',
  orders: 'Orders',
  customers: 'Customers',
  settings: 'Settings',
};

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const { store } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('admin-body');
    return () => document.body.classList.remove('admin-body');
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const onLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/admin/login', { replace: true });
  };

  const segment = pathname.split('/')[2] || '';
  const title = pathname.includes('products/new')
    ? 'New Product'
    : pathname.includes('products/edit')
      ? 'Edit Product'
      : TITLES[segment] || 'Admin';

  return (
    <>
      <Seo title={`${title} – Admin`} noIndex />
      <div
        className={`admin-sidebar-backdrop ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(false)}
      />

      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <div className="admin-sidebar__brand">
          <Link to="/admin" className="brand">
            {store?.logo ? (
              <img
                className="brand__logo brand__logo--footer"
                src={resolveImageUrl(store.logo)}
                alt={`${store?.storeName || 'Ladies Suits'} logo`}
              />
            ) : (
              <>
                <span className="brand__mark" aria-hidden="true">S</span>
                <span>
                  Ladies Suits
                  <span className="brand__sub" aria-hidden="true">Admin Panel</span>
                </span>
              </>
            )}
          </Link>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-sidebar__link ${isActive ? 'is-active' : ''}`}
            >
              <item.icon size={18} /> {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__foot">
          <Link to="/" className="admin-sidebar__link">
            ← View Store
          </Link>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="icon-btn"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="admin-topbar__title">{title}</h1>

          <div className="admin-topbar__user">
            <span className="admin-topbar__avatar" aria-hidden="true">
              {(admin?.name || 'A').charAt(0)}
            </span>
            <span style={{ fontSize: '0.9rem' }}>
              <strong>{admin?.name}</strong>
              <span className="text-muted" style={{ display: 'block', fontSize: '0.78rem' }}>
                {admin?.email}
              </span>
            </span>
            <button type="button" className="mini-btn" aria-label="Sign out" onClick={onLogout} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>

          <button type="button" className="mini-btn" aria-label="Close sidebar" style={{ display: open ? 'grid' : 'none' }} onClick={() => setOpen(false)}>
            <X size={16} />
          </button>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}