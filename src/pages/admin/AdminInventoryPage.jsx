import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Minus, MinusCircle } from 'lucide-react';
import api from '../../api/apiClient.js';
import { useToast } from '../../context/ToastContext.jsx';
import { StockBadge } from './components/Badges.jsx';
import { PaginationBar } from './components/PaginationBar.jsx';

export default function AdminInventoryPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('low_stock');
  const [page, setPage] = useState(1);
  const [deltas, setDeltas] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const search = new URLSearchParams({ page: String(page), status });
    if (q) search.set('q', q);
    api
      .get(`/admin/products?${search.toString()}`)
      .then((res) => {
        setItems(res.data);
        setPagination(res.pagination);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q, status, page]);

  useEffect(() => load(), [load]);

  const replaceItem = (p, data) =>
    setItems((list) => list.map((it) => (it._id === p._id ? data : it)));

  const shift = async (p, by) => {
    const delta = by == null ? Number(deltas[p._id] || 0) : by;
    if (!Number.isFinite(delta) || delta === 0) {
      toast.error('Enter a number first');
      return;
    }
    try {
      const res = await api.patch(`/admin/products/${p._id}`, { stockShift: delta });
      replaceItem(p, res.data);
      setDeltas((m) => ({ ...m, [p._id]: '' }));
      toast.success(`${p.name} → ${res.data.stock} in stock`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const setExact = async (p, val) => {
    try {
      const res = await api.patch(`/admin/products/${p._id}`, { stock: Math.max(0, Number(val)) });
      replaceItem(p, res.data);
      toast.success('Stock updated');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="panel">
      <div className="panel__head" style={{ gap: '0.8rem' }}>
        <h2 className="panel__title">Inventory ({pagination?.total ?? '…'})</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ maxWidth: 240 }}>
            <Search size={15} className="search-box__icon" />
            <input
              className="input"
              type="search"
              placeholder="Search product…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              aria-label="Search products"
            />
          </div>
          <select className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Stock filter">
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
            <option value="">All</option>
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
            <p className="page-state__text">Nothing here — change the filter above.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current stock</th>
                <th>Adjust by</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td>
                    <Link to={`/admin/products/edit/${p._id}`} className="table-product__name">{p.name}</Link>
                    <div className="table-product__sku">{p.sku}</div>
                  </td>
                  <td>
                    <strong>{p.stock}</strong>{' '}
                    {p.stock === 0 && <MinusCircle size={13} style={{ color: 'var(--danger)', verticalAlign: 'text-bottom' }} />}
                  </td>
                  <td>
                    <div className="auto-space" style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                      <input
                        className="input"
                        type="number"
                        placeholder="±"
                        value={deltas[p._id] ?? ''}
                        onChange={(e) => setDeltas((m) => ({ ...m, [p._id]: e.target.value }))}
                        style={{ width: 84 }}
                        aria-label={`Adjust stock for ${p.name}`}
                      />
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => shift(p)}>
                        Save
                      </button>
                    </div>
                  </td>
                  <td><StockBadge product={p} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <button type="button" className="mini-btn" aria-label="Add 1" onClick={() => shift(p, 1)}>
                        <Plus size={14} />
                      </button>
                      <button type="button" className="mini-btn mini-btn--danger" aria-label="Remove 1" onClick={() => shift(p, -1)}>
                        <Minus size={14} />
                      </button>
                      <button type="button" className="mini-btn" title="Set to 0" aria-label="Set to zero" onClick={() => setExact(p, 0)}>
                        Clear
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
    </div>
  );
}