import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, FolderTree, Boxes, ShoppingBag, AlertTriangle, Star, Users, BadgeDollarSign,
} from 'lucide-react';
import api from '../../api/apiClient.js';
import { useToast } from '../../context/ToastContext.jsx';
import { OrderStatusBadge } from './components/Badges.jsx';

export default function AdminDashboardPage() {
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const currency = 'PKR';

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get('/admin/dashboard')
      .then((res) => setDash(res.data))
      .catch((e) => {
        setError(e.message);
        toast.error(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="stat-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 110 }} />
        ))}
      </div>
    );
  }

  if (error || !dash) {
    return (
      <div className="page-state">
        <h2>Dashboard unavailable</h2>
        <p className="page-state__text">{error || 'Could not load data'}</p>
        <button type="button" className="btn btn--primary" onClick={load}>Retry</button>
      </div>
    );
  }

  const t = dash.totals;

  const stats = [
    { icon: Package, cls: 'stat-card--product', label: 'Total Products', value: t.products, sub: `${t.published} published · ${t.drafts} drafts`, link: '/admin/products' },
    { icon: FolderTree, cls: 'stat-card--category', label: 'Categories', value: t.categories, sub: `${t.activeCategories} active`, link: '/admin/categories' },
    { icon: Boxes, cls: 'stat-card--stock', label: 'Total Stock (units)', value: t.totalStock, sub: `${t.lowStock} low · ${t.outOfStock} out`, link: '/admin/inventory' },
    { icon: ShoppingBag, cls: 'stat-card--order', label: 'Orders', value: t.orders, sub: `${t.pendingOrders} pending`, link: '/admin/orders' },
  ];

  return (
    <div>
      <div className="stat-grid">
        {stats.map((s) => (
          <Link to={s.link} key={s.label}>
            <div className="stat-card" style={{ height: '100%' }}>
              <div className={`stat-card__icon ${s.cls}`}>
                <s.icon size={22} />
              </div>
              <div>
                <div className="stat-card__value">{s.value}</div>
                <div className="stat-card__label">{s.label}</div>
                <div className="text-muted" style={{ fontSize: '0.74rem' }}>{s.sub}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'var(--accent)' }}>
            <Star size={22} />
          </div>
          <div>
            <div className="stat-card__value">{t.featured}</div>
            <div className="stat-card__label">Featured products</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'var(--danger)' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="stat-card__value">{t.outOfStock}</div>
            <div className="stat-card__label">Out of stock</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'var(--success)' }}>
            <BadgeDollarSign size={22} />
          </div>
          <div>
            <div className="stat-card__value">{Number(t.monthRevenue || 0).toLocaleString('en-PK')}</div>
            <div className="stat-card__label">Month order value (PKR)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'var(--primary)' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="stat-card__value">{t.customers}</div>
            <div className="stat-card__label">Customers</div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: '1.6rem' }}>
        <div className="panel__head">
          <h2 className="panel__title">Recent Orders</h2>
          <Link to="/admin/orders" className="btn btn--outline btn--sm">View all</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {dash.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-muted)', padding: '2rem' }}>
                    No orders yet — they will appear here when customers order on WhatsApp.
                  </td>
                </tr>
              )}
              {dash.recentOrders.map((o) => (
                <tr key={o._id}>
                  <td><Link to={`/admin/orders?q=${o.orderNumber}`} style={{ fontWeight: 600 }}>{o.orderNumber}</Link></td>
                  <td>{o.customerName}</td>
                  <td>{o.items?.length}</td>
                  <td>{Number(o.subtotal).toLocaleString('en-PK')} {currency}</td>
                  <td><OrderStatusBadge status={o.status} /></td>
                  <td>{new Date(o.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const UsersIconStub = () => <UsersSvg />;
const UsersSvg = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);