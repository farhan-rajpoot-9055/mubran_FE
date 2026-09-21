import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Star, Eye, EyeOff, ImageIcon, Copy } from 'lucide-react';
import api from '../../api/apiClient.js';
import { useToast } from '../../context/ToastContext.jsx';
import { StockBadge, PublishBadge, FeaturedBadge } from './components/Badges.jsx';
import { ConfirmDialog } from './components/ConfirmDialog.jsx';
import { PaginationBar } from './components/PaginationBar.jsx';

export default function AdminProductsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const search = new URLSearchParams({ page: String(page) });
    if (q) search.set('q', q);
    if (status) search.set('status', status);
    if (category) search.set('category', category);
    api
      .get(`/admin/products?${search.toString()}`)
      .then((res) => {
        setItems(res.data);
        setPagination(res.pagination);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q, status, category, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api.get('/admin/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const toggle = async (item, field) => {
    try {
      const next = !item[field];
      await api.patch(`/admin/products/${item._id}`, { [field]: next });
      setItems((list) => list.map((it) => (it._id === item._id ? { ...it, [field]: next } : it)));
      toast.success(field === 'published' ? (next ? 'Published' : 'Unpublished') : next ? 'Featured' : 'Unfeatured');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await api.del(`/admin/products/${toDelete._id}`);
      toast.success('Product deleted');
      setToDelete(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const copySlug = async (slug) => {
    try {
      await navigator.clipboard.writeText(slug);
      setCopiedId(slug);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  const pageReset = (nextPage) => {
    setPage(nextPage);
  };

  return (
    <div>
      <div className="panel">
        <div className="panel__head" style={{ gap: '0.8rem' }}>
          <h2 className="panel__title">All Products ({pagination?.total ?? '…'})</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <div className="search-box" style={{ maxWidth: 260 }}>
              <Search size={15} className="search-box__icon" />
              <input
                className="input"
                type="search"
                placeholder="Search name or SKU…"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                aria-label="Search products"
              />
            </div>
            <select className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status filter">
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="featured">Featured</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
            <select className="select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} aria-label="Category filter">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <Link to="/admin/products/new" className="btn btn--primary btn--sm">
              <Plus size={15} /> New Product
            </Link>
          </div>
        </div>

        <div className="admin-table-wrap">
          {loading && (
            <div className="page-state">
              <div className="spinner" />
            </div>
          )}

          {error && (
            <div className="page-state">
              <p className="page-state__text">{error}</p>
              <button type="button" className="btn btn--outline btn--sm" onClick={load}>Retry</button>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="page-state">
              <h3>No products found</h3>
              <p className="page-state__text">Try different filters, or create your first product.</p>
              <Link to="/admin/products/new" className="btn btn--primary btn--sm"><Plus size={15} /> New Product</Link>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="table-product">
                        {p.images?.[0] ? (
                          <img className="table-product__img" src={p.images[0].startsWith('http') ? p.images[0] : `${window.location.origin}${p.images[0]}`} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        ) : (
                          <div className="table-product__img" style={{ display: 'grid', placeItems: 'center', color: 'var(--ink-muted)' }}>
                            <ImageIcon size={16} />
                          </div>
                        )}
                        <div>
                          <Link to={`/admin/products/edit/${p._id}`} className="table-product__name">{p.name}</Link>
                          <div className="table-product__sku">
                            {p.sku} · #{p._id.slice(-6)}
                          </div>
                          <button
                            type="button"
                            className="table-product__sku"
                            style={{ textDecoration: 'underline', color: 'var(--primary)' }}
                            onClick={() => copySlug(p.slug)}
                          >
                            {copiedId === p.slug ? <Copy size={11} style={{ display: 'inline' }} /> : p.slug}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>
                      {p.salePrice && p.salePrice < p.price ? (
                        <>
                          <strong>{Number(p.salePrice).toLocaleString('en-PK')}</strong>
                          <span className="text-muted" style={{ textDecoration: 'line-through', marginLeft: '0.4rem', fontSize: '0.8rem' }}>
                            {Number(p.price).toLocaleString('en-PK')}
                          </span>
                        </>
                      ) : (
                        <strong>{Number(p.price).toLocaleString('en-PK')}</strong>
                      )}
                    </td>
                    <td><StockBadge product={p} /></td>
                    <td>{p.category?.name || <span className="text-muted">—</span>}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                        <PublishBadge published={p.published} />
                        <FeaturedBadge featured={p.featured} />
                      </div>
                    </td>
                    <td>
                      <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" className="mini-btn" title={p.published ? 'Unpublish' : 'Publish'} aria-label={p.published ? 'Unpublish' : 'Publish'} onClick={() => toggle(p, 'published')}>
                          {p.published ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button type="button" className="mini-btn" title="Toggle featured" aria-label="Toggle featured" onClick={() => toggle(p, 'featured')}>
                          <Star size={15} fill={p.featured ? 'currentColor' : 'none'} color={p.featured ? 'var(--accent)' : 'currentColor'} />
                        </button>
                        <Link to={`/admin/products/edit/${p._id}`} className="mini-btn" title="Edit" aria-label="Edit">
                          <Pencil size={15} />
                        </Link>
                        <button type="button" className="mini-btn mini-btn--danger" title="Delete" aria-label="Delete" onClick={() => setToDelete(p)}>
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

        {pagination && <PaginationBar page={pagination.page} totalPages={pagination.totalPages} onChange={pageReset} />}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete product?"
        text={toDelete ? `“${toDelete.name}” (${toDelete.sku}) will be permanently removed. This cannot be undone.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={busy}
      />
    </div>
  );
}