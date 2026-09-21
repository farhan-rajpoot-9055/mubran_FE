import { Fragment, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2, MessageCircle, ChevronDown } from 'lucide-react';
import api from '../../api/apiClient.js';
import { useToast } from '../../context/ToastContext.jsx';
import { OrderStatusBadge } from './components/Badges.jsx';
import { ConfirmDialog } from './components/ConfirmDialog.jsx';
import { PaginationBar } from './components/PaginationBar.jsx';
import { waLink } from '../../utils/whatsapp.js';
import { formatPrice } from '../../utils/format.js';

const STATUSES = ['pending', 'in_review', 'confirmed', 'fulfilled', 'cancelled'];

export default function AdminOrdersPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings/public').then((res) => setSettings(res.data)).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const search = new URLSearchParams({ page: String(page), sort: '-createdAt' });
    if (status) search.set('status', status);
    if (q) search.set('q', q);
    api
      .get(`/admin/orders?${search.toString()}`)
      .then((res) => {
        setItems(res.data);
        setPagination(res.pagination);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, q, page]);

  useEffect(() => load(), [load]);

  const setOrderStatus = async (o, next) => {
    if (next === o.status) return;
    try {
      const res = await api.patch(`/admin/orders/${o._id}`, { status: next });
      setItems((list) => list.map((it) => (it._id === o._id ? res.data : it)));
      toast.success(`Order marked ${next.replace('_', ' ')}`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await api.del(`/admin/orders/${toDelete._id}`);
      toast.success('Order deleted');
      setToDelete(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id) => setExpanded((m) => ({ ...m, [id]: !m[id] }));

  return (
    <div className="panel">
      <div className="panel__head" style={{ gap: '0.8rem' }}>
        <h2 className="panel__title">Orders ({pagination?.total ?? '…'})</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ maxWidth: 240 }}>
            <Search size={15} className="search-box__icon" />
            <input
              className="input"
              type="search"
              placeholder="Search order #, phone, name…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              aria-label="Search orders"
            />
          </div>
          <select className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status filter">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="page-state"><div className="spinner" /></div>
        ) : error ? (
          <div className="page-state">
            <p className="page-state__text">{error}</p>
            <button type="button" className="btn btn--outline btn--sm" onClick={load}>Retry</button>
          </div>
        ) : items.length === 0 ? (
          <div className="page-state">
            <h3>No orders</h3>
            <p className="page-state__text">Orders placed through the website's WhatsApp button will appear here.</p>
          </div>
        ) : (
          <table className="admin-table admin-table--orders">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => {
                const open = !!expanded[o._id];
                const waPhone = o.phone || o.phoneRaw;
                return (
                  <Fragment key={o._id}>
                    <tr key={o._id} className="order-row">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong>{o.orderNumber}</strong>
                          <button type="button" className="mini-btn" aria-label={open ? 'Collapse details' : 'Expand details'} onClick={() => toggle(o._id)}>
                            <ChevronDown size={15} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                          </button>
                        </div>
                        <div className="table-product__sku">{o.source === 'admin' ? 'Recorded manually' : o.source === 'whatsapp' ? 'Via website WhatsApp' : o.source}</div>
                      </td>
                      <td>{o.customerName}</td>
                      <td>
                        {waPhone ? (
                          <a
                            href={waLink(waPhone, `Assalam-o-Alaikum ${o.customerName}, this is about your order ${o.orderNumber}.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}
                          >
                            <MessageCircle size={13} /> {waPhone}
                          </a>
                        ) : '—'}
                      </td>
                      <td>{o.items?.length ?? 0} pcs</td>
                      <td>
                        {o.currency === 'USD' ? '$' : ''}
                        {formatPrice(o.subtotal, o.currency || 'PKR')}
                      </td>
                      <td>
                        <select
                          className="select"
                          value={o.status}
                          onChange={(e) => setOrderStatus(o, e.target.value)}
                          aria-label="Change order status"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td>{new Date(o.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="mini-btn mini-btn--danger" title="Delete order" aria-label="Delete order" onClick={() => setToDelete(o)}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr key={`${o._id}-items`} className="order-detail-row">
                        <td colSpan={8}>
                          <div className="order-detail">
                            {o.notes && (
                              <p className="order-detail__notes"><strong>Notes:</strong> {o.notes}</p>
                            )}
                            {o.shippingCity && (
                              <p className="order-detail__notes"><strong>City:</strong> {o.shippingCity}</p>
                            )}
                            {o.items?.map((li) => (
                              <div key={`${o._id}-${li.sku}`} className="order-line">
                                <img
                                  src={li.image ? (li.image.startsWith('http') ? li.image : `${window.location.origin}${li.image}`) : ''}
                                  alt=""
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                                <div style={{ flex: 1 }}>
                                  <Link to={`/admin/products?q=${encodeURIComponent(li.name)}`} style={{ fontWeight: 600 }}>
                                    {li.name}
                                  </Link>
                                  <div className="table-product__sku">{li.sku} · {li.quantity} × {formatPrice(li.unitPrice, o.currency)}</div>
                                </div>
                                <div style={{ fontWeight: 700 }}>{formatPrice(li.subtotal, o.currency)}</div>
                              </div>
                            ))}
                            <div className="order-line" style={{ fontWeight: 700 }}>
                              <span>Total</span>
                              <span>{formatPrice(o.subtotal, o.currency)}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {pagination && <PaginationBar page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete order?"
        text={toDelete ? `Order ${toDelete.orderNumber} from ${toDelete.customerName} will be permanently removed.` : ''}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={busy}
      />
    </div>
  );
}