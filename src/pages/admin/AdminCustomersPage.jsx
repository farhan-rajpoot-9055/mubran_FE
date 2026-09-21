import { useEffect, useState, useCallback } from 'react';
import { Trash2, MessageCircle } from 'lucide-react';
import api from '../../api/apiClient.js';
import { useToast } from '../../context/ToastContext.jsx';
import { ConfirmDialog } from './components/ConfirmDialog.jsx';
import { PaginationBar } from './components/PaginationBar.jsx';
import { waLink } from '../../utils/whatsapp.js';
import { formatPrice } from '../../utils/format.js';

export default function AdminCustomersPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    api
      .get(`/admin/customers?page=${page}&sort=-createdAt`)
      .then((res) => {
        setItems(res.data);
        setPagination(res.pagination);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => load(), [load]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await api.del(`/admin/customers/${toDelete._id}`);
      toast.success('Customer removed');
      setToDelete(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel__head">
        <h2 className="panel__title">Customers ({pagination?.total ?? '…'})</h2>
        <p className="text-muted" style={{ fontSize: '0.82rem' }}>
          Created automatically when someone orders via WhatsApp.
        </p>
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
            <h3>No customers yet</h3>
            <p className="page-state__text">Customers who order through the website will be listed here.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Total value</th>
                <th>Last order</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600 }}>{c.name || '—'}</td>
                  <td style={{ color: 'var(--ink-soft)' }}>{c.phone || c.phoneRaw || '—'}</td>
                  <td style={{ color: 'var(--ink-soft)' }}>{c.email || '—'}</td>
                  <td>{c.orderCount}</td>
                  <td>{formatPrice(c.totalSpent, 'PKR')}</td>
                  <td>{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      {(c.phone || c.phoneRaw) && (
                        <a
                          href={waLink(c.phone || c.phoneRaw, `Assalam-o-Alaikum ${c.name || ''}, this is Ladies Suits Boutique.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mini-btn"
                          title="Chat on WhatsApp"
                          aria-label="Chat on WhatsApp"
                        >
                          <MessageCircle size={15} />
                        </a>
                      )}
                      <button type="button" className="mini-btn mini-btn--danger" title="Delete customer" aria-label="Delete customer" onClick={() => setToDelete(c)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && <PaginationBar page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete customer?"
        text={toDelete ? `${toDelete.name || 'This customer'} and their record will be removed from your list.` : ''}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={busy}
      />
    </div>
  );
}