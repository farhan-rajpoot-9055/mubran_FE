import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, Check, Eye, EyeOff, X } from 'lucide-react';
import api from '../../api/apiClient.js';
import { useToast } from '../../context/ToastContext.jsx';
import { CategoryActiveBadge } from './components/Badges.jsx';
import { ConfirmDialog } from './components/ConfirmDialog.jsx';
import { slugify } from '../../utils/format.js';

export default function AdminCategoriesPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: '', slug: '', active: true });
  const [newDraft, setNewDraft] = useState({ name: '', slug: '', active: true });
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const newRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get('/admin/categories')
      .then((res) => setItems(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  const startEdit = (c) => {
    setEditingId(c._id);
    setDraft({ name: c.name, slug: c.slug, active: c.active });
  };

  const saveEdit = async (c) => {
    if (!draft.name.trim()) return;
    setBusy(true);
    try {
      const res = await api.put(`/admin/categories/${c._id}`, {
        name: draft.name.trim(),
        slug: slugify(draft.slug || draft.name),
        active: draft.active,
      });
      setItems((list) => list.map((it) => (it._id === c._id ? res.data : it)));
      setEditingId(null);
      toast.success('Category updated');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (c) => {
    const next = !c.active;
    try {
      await api.patch(`/admin/categories/${c._id}`, { active: next });
      setItems((list) => list.map((it) => (it._id === c._id ? { ...it, active: next } : it)));
      toast.success(next ? 'Category shown' : 'Category hidden');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const addCategory = async () => {
    if (!newDraft.name.trim()) {
      setAdding(false);
      return;
    }
    setBusy(true);
    try {
      const res = await api.post('/admin/categories', {
        name: newDraft.name.trim(),
        slug: slugify(newDraft.slug || newDraft.name),
        active: newDraft.active,
      });
      setItems((list) => [...list, res.data]);
      setNewDraft({ name: '', slug: '', active: true });
      setAdding(false);
      toast.success('Category created');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await api.del(`/admin/categories/${toDelete._id}`);
      toast.success('Category deleted');
      setItems((list) => list.filter((c) => c._id !== toDelete._id));
      setToDelete(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel__head">
        <h2 className="panel__title">Categories ({items.length})</h2>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => setAdding(true)}>
          <Plus size={15} /> Add Category
        </button>
      </div>

      {adding && (
        <div className="admin-form-row">
          <input
            ref={newRef}
            className="input"
            placeholder="Category name"
            value={newDraft.name}
            onChange={(e) => setNewDraft((d) => ({ ...d, name: e.target.value, slug: slugify(e.target.value) }))}
            autoFocus
          />
          <input
            className="input"
            placeholder="slug"
            value={newDraft.slug}
            onChange={(e) => setNewDraft((d) => ({ ...d, slug: slugify(e.target.value) }))}
            style={{ maxWidth: 180 }}
          />
          <button type="button" className="btn btn--primary btn--sm" onClick={addCategory} disabled={busy || !newDraft.name.trim()}>
            Save
          </button>
          <button type="button" className="mini-btn" onClick={() => setAdding(false)} aria-label="Cancel">
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert--error" onClick={load} style={{ cursor: 'pointer' }}>{error} · click to retry</div>
      )}

      <div className="admin-table-wrap">
        {loading ? (
          <div className="page-state"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="page-state">
            <p className="page-state__text">No categories yet. Create one to start organising your products.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const editing = editingId === c._id;
                return (
                  <tr key={c._id}>
                    {editing ? (
                      <td colSpan={5}>
                        <div className="admin-form-row">
                          <input className="input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value, slug: slugify(e.target.value) }))} autoFocus />
                          <input className="input" value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))} style={{ maxWidth: 180 }} />
                          <label className="checkbox-row">
                            <input type="checkbox" checked={draft.active} onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))} />
                            <span>Active</span>
                          </label>
                          <button type="button" className="btn btn--primary btn--sm" onClick={() => saveEdit(c)} disabled={busy}>
                            <Check size={14} /> Save
                          </button>
                          <button type="button" className="mini-btn" onClick={() => setEditingId(null)} aria-label="Cancel">
                            <X size={15} />
                          </button>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td><span className="chip-badge chip-badge--gray">{c.slug}</span></td>
                        <td>{c.count ?? c.productsCount ?? 0}</td>
                        <td><CategoryActiveBadge active={c.active} /></td>
                        <td>
                          <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                            <button type="button" className="mini-btn" title="Toggle visibility" aria-label="Toggle visibility" onClick={() => toggleActive(c)}>
                              {c.active ? <Eye size={15} /> : <EyeOff size={15} />}
                            </button>
                            <button type="button" className="mini-btn" title="Edit" aria-label="Edit" onClick={() => startEdit(c)}>
                              <Pencil size={15} />
                            </button>
                            <button type="button" className="mini-btn mini-btn--danger" title="Delete" aria-label="Delete" onClick={() => setToDelete(c)}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete category?"
        text={toDelete ? `“${toDelete.name}” will be removed. Products in this category will stay but lose their category link.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={busy}
      />
    </div>
  );
}