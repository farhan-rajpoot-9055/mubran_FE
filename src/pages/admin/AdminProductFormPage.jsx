import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, Plus, X } from 'lucide-react';
import api from '../../api/apiClient.js';
import { useToast } from '../../context/ToastContext.jsx';
import ImageUploader from './components/ImageUploader.jsx';
import { slugify } from '../../utils/format.js';

const EMPTY = {
  name: '',
  sku: '',
  description: '',
  materials: '',
  sizeChart: '',
  careInstructions: '',
  price: '',
  salePrice: '',
  stock: 0,
  category: '',
  published: true,
  featured: false,
  collectionMonth: '',
  collectionYear: '',
  brand: '',
  seoTitle: '',
  seoDescription: '',
  altText: '',
  images: [],
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState('');

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const load = useCallback(() => {
    if (!isEdit) return;
    setLoading(true);
    setError(null);
    Promise.all([api.get(`/admin/categories`), api.get(`/admin/products/${id}`)])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data);
        const p = prodRes.data;
        setForm({
          name: p.name || '',
          slug: p.slug || '',
          sku: p.sku || '',
          description: p.description || '',
          materials: p.materials || '',
          sizeChart: p.sizeChart || '',
          careInstructions: p.careInstructions || '',
          price: p.price ?? '',
          salePrice: p.salePrice ?? '',
          stock: p.stock ?? 0,
          category: p.category?._id || '',
          published: !!p.published,
          featured: !!p.featured,
          collectionMonth: p.collectionMonth || '',
          collectionYear: p.collectionYear || '',
          brand: p.brand || '',
          seoTitle: p.seoTitle || '',
          seoDescription: p.seoDescription || '',
          altText: p.altText || '',
          images: p.images || [],
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    load();
    if (!isEdit) {
      api.get('/admin/categories').then((res) => setCategories(res.data)).catch(() => {});
    }
  }, [load, isEdit]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      slug: slugify(form.slug || form.name),
      price: Number(form.price),
      salePrice: form.salePrice === '' || form.salePrice === null ? null : Number(form.salePrice),
      stock: Number(form.stock),
      category: form.category || null,
    };
    try {
      if (isEdit) {
        await api.put(`/admin/products/${id}`, payload);
        toast.success('Product updated');
      } else {
        const res = await api.post('/admin/products', payload);
        toast.success('Product created');
        navigate(`/admin/products/edit/${res.data._id}`, { replace: true });
      }
    } catch (err) {
      const msg = err.fieldErrors
        ? Object.values(err.fieldErrors).flat().join(', ')
        : err.message;
      setError(msg || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-state">
        <div className="spinner" />
      </div>
    );
  }

  if (error && !form.name && isEdit) {
    return (
      <div className="page-state">
        <h2>Could not load product</h2>
        <p className="page-state__text">{error}</p>
        <button type="button" className="btn btn--outline" onClick={load}>Retry</button>
      </div>
    );
  }

  const addCategory = async (val) => {
    const name = (val || newCategory).trim();
    if (!name) return;
    try {
      const res = await api.post('/admin/categories', { name, slug: slugify(name) });
      setCategories((c) => [...c, res.data]);
      set('category', res.data._id);
      setNewCategory('');
      toast.success('Category created');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="panel">
        <div className="panel__head">
          <Link to="/admin/products" className="btn btn--outline btn--sm">
            <ChevronLeft size={15} /> Back
          </Link>
          <h2 className="panel__title">{isEdit ? 'Edit Product' : 'New Product'}</h2>
          <button type="submit" className="btn btn--primary btn--sm" disabled={saving || (!form.name.trim() && !isEdit)}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save Product'}
          </button>
        </div>

        {error && (
          <div className="alert alert--error">{error}</div>
        )}

        <div className="admin-form-grid">
          <div className="admin-form-col">
            <div className="field">
              <label className="field__label" htmlFor="p-name">Product name *</label>
              <input id="p-name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="p-slug">Slug</label>
              <input id="p-slug" className="input" value={form.slug} placeholder="auto-generated from name" onChange={(e) => set('slug', slugify(e.target.value))} />
            </div>

            <div className="form-row">
              <div className="field">
                <label className="field__label" htmlFor="p-sku">SKU *</label>
                <input id="p-sku" className="input" value={form.sku} placeholder="e.g. SUIT-001" onChange={(e) => set('sku', e.target.value.toUpperCase())} required />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="p-price">Price (PKR) *</label>
                <input id="p-price" className="input" type="number" min="0" step="1" value={form.price} onChange={(e) => set('price', e.target.value)} required />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="p-sale">Sale price (PKR)</label>
                <input id="p-sale" className="input" type="number" min="0" step="1" value={form.salePrice} placeholder="leave empty for none" onChange={(e) => set('salePrice', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label className="field__label" htmlFor="p-stock">Stock quantity</label>
                <input id="p-stock" className="input" type="number" min="0" step="1" value={form.stock} onChange={(e) => set('stock', e.target.value)} />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="p-cat">Category</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <select id="p-cat" className="select" value={form.category} onChange={(e) => set('category', e.target.value)}>
                    <option value="">— None —</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <label className="checkbox-row" style={{ marginTop: 'auto' }}>
                <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
                <span>Publish immediately</span>
              </label>
              <label className="checkbox-row">
                <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
                <span>Feature on homepage</span>
              </label>
            </div>

            <div className="field">
              <label className="field__label">Quick-add category</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input className="input" value={newCategory} placeholder="e.g. Summer Collection" onChange={(e) => setNewCategory(e.target.value)} />
                <button type="button" onClick={() => addCategory()} className="btn btn--outline btn--sm">
                  <Plus size={15} /> Add
                </button>
              </div>
            </div>
          </div>

          <div className="admin-form-col">
            <div className="field">
              <label className="field__label" htmlFor="p-desc">Description (shown on product page)</label>
              <textarea id="p-desc" className="input" rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>

            <div className="form-row">
              <div className="field">
                <label className="field__label" htmlFor="p-mat">Fabric / Material</label>
                <input id="p-mat" className="input" value={form.materials} onChange={(e) => set('materials', e.target.value)} />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="p-size">Size chart / note</label>
                <input id="p-size" className="input" value={form.sizeChart} onChange={(e) => set('sizeChart', e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="p-care">Care instructions</label>
              <input id="p-care" className="input" value={form.careInstructions} onChange={(e) => set('careInstructions', e.target.value)} />
            </div>

            <div className="form-row">
              <div className="field">
                <label className="field__label" htmlFor="p-brand">Brand / own label</label>
                <input id="p-brand" className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} />
              </div>
              <div className="field">
                <label className="field__label">Collection</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input className="input" placeholder="Month" value={form.collectionMonth} onChange={(e) => set('collectionMonth', e.target.value)} />
                  <input className="input" placeholder="Year" value={form.collectionYear} onChange={(e) => set('collectionYear', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="field">
              <label className="field__label">Images</label>
              <ImageUploader images={form.images} onChange={(images) => set('images', images)} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="p-alt">Primary image alt text</label>
              <input id="p-alt" className="input" value={form.altText} onChange={(e) => set('altText', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="panel__head" style={{ borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem' }}>SEO (optional)</h3>
        </div>
        <div className="form-row">
          <div className="field" style={{ flex: 2 }}>
            <label className="field__label" htmlFor="p-seo-title">SEO title</label>
            <input id="p-seo-title" className="input" value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} />
          </div>
          <div className="field" style={{ flex: 3 }}>
            <label className="field__label" htmlFor="p-seo-desc">SEO description</label>
            <textarea id="p-seo-desc" className="input" rows={2} value={form.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} />
          </div>
        </div>
      </div>
    </form>
  );
}