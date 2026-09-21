import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import api from '../api/apiClient.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useCart } from '../context/CartContext.jsx';
import { ProductCard } from '../components/common/ProductCard.jsx';
import { ProductGridSkeleton } from '../components/common/ProductGridSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Seo } from '../components/common/Seo.jsx';
import { QuickView } from '../components/common/QuickView.jsx';
import { useStore } from '../context/StoreContext.jsx';

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'featured', label: 'Featured' },
  { value: 'oldest', label: 'Oldest first' },
];

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currency } = useStore();
  const { wishlist } = useCart();

  const [products, setProducts] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [quickView, setQuickView] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const minPrice = params.get('min') || '';
  const maxPrice = params.get('max') || '';
  const inStock = params.get('inStock') === 'true';
  const featured = params.get('featured') === 'true';
  const sale = params.get('sale') === 'true';
  const wishlistOnly = params.get('wishlist') === 'true';
  const sort = params.get('sort') || 'newest';
  const page = parseInt(params.get('page') || '1', 10);

  const debouncedQ = useDebounce(q, 400);

  const updateParams = useCallback(
    (patch, { resetPage = true } = {}) => {
      const next = new URLSearchParams(params);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined || value === false) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      if (resetPage && !('page' in patch)) next.delete('page');
      setParams(next, { replace: false });
    },
    [params, setParams]
  );

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);

    const search = new URLSearchParams();
    if (debouncedQ) search.set('q', debouncedQ);
    if (category) search.set('category', category);
    if (inStock) search.set('inStock', 'true');
    if (featured) search.set('featured', 'true');
    if (sale) search.set('sale', 'true');
    if (minPrice) search.set('minPrice', minPrice);
    if (maxPrice) search.set('maxPrice', maxPrice);
    search.set('sort', sort);
    search.set('page', String(page));
    if (wishlistOnly) search.set('pageSize', '60');

    api
      .get(`/products?${search.toString()}`)
      .then((res) => {
        let data = res.data;
        let pag = res.pagination;
        if (wishlistOnly) {
          data = data.filter((p) => wishlist.includes(p.slug));
          pag = { ...pag, total: data.length, totalPages: Math.max(1, Math.ceil(data.length / pag.pageSize)) };
        }
        setProducts(data);
        setPagination(pag);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [debouncedQ, category, inStock, featured, sale, minPrice, maxPrice, sort, page, wishlistOnly, wishlist]);

  useEffect(() => {
    load();
  }, [load]);

  const totalCount = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const isFiltering = Boolean(
    q || category || inStock || featured || sale || minPrice || maxPrice || wishlistOnly
  );

  const clearAll = () => navigate('/shop');

  return (
    <>
      <Seo
        title="Shop Ladies Suits – Lawn, Cotton & Embroidered | Online"
        description="Browse our full collection of premium ladies suits. Filter by category, price and availability. Order easily on WhatsApp."
        canonical="/shop"
      />

      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">{wishlistOnly ? 'Your Wishlist' : 'Shop All'}</h1>
          <p className="page-hero__text">
            {wishlistOnly
              ? 'The pieces you have saved for later.'
              : 'Explore the complete collection — new arrivals, classic favourites and seasonal specials.'}
          </p>
        </div>
      </div>

      <div className="container">
        <div className="toolbar">
          <button type="button" className="btn btn--outline btn--sm filter-btn" onClick={() => setSidebarOpen(true)}>
            <SlidersHorizontal size={15} /> Filters
          </button>

          <div className="search-box">
            <Search size={17} className="search-box__icon" />
            <label htmlFor="shop-search" className="visually-hidden" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
              Search products
            </label>
            <input
              id="shop-search"
              className="input"
              type="search"
              placeholder="Search suits, SKUs, fabrics…"
              value={q}
              onChange={(e) => updateParams({ q: e.target.value })}
              aria-label="Search products"
            />
            {q && (
              <button
                type="button"
                aria-label="Clear search"
                style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }}
                onClick={() => updateParams({ q: '' })}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <span className="toolbar__count">
            {loading ? 'Loading…' : `${totalCount} product${totalCount === 1 ? '' : 's'}`}
          </span>

          <div className="toolbar__spacer" />

          <label htmlFor="sort-select" className="visually-hidden" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            Sort products
          </label>
          <select
            id="sort-select"
            className="select sort-select"
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            aria-label="Sort products"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className={`sidebar-backdrop ${sidebarOpen ? 'is-open' : ''}`} onClick={() => setSidebarOpen(false)} />

        <div className="shop-layout">
          <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`} aria-label="Product filters">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="sidebar__title" style={{ marginBottom: 0 }}>Filters</h2>
              <button
                type="button"
                className="icon-btn"
                aria-label="Close filters"
                style={{ display: sidebarOpen ? 'grid' : 'none' }}
                onClick={() => setSidebarOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="sidebar__group">
              <h3 className="sidebar__title">Category</h3>
              <div>
                <button
                  type="button"
                  className="filter-option"
                  onClick={() => { updateParams({ category: '' }); setSidebarOpen(false); }}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    className="filter-option"
                    onClick={() => {
                      if (pathname.startsWith('/category/')) {
                        navigate(`/shop?category=${c._id}`);
                      } else {
                        updateParams({ category: c._id });
                      }
                      setSidebarOpen(false);
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar__group">
              <h3 className="sidebar__title">Price (PKR)</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParams({ min: e.target.value })}
                  aria-label="Minimum price"
                />
                <span className="text-muted">—</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParams({ max: e.target.value })}
                  aria-label="Maximum price"
                />
              </div>
            </div>

            <div className="sidebar__group">
              <h3 className="sidebar__title">Show Only</h3>
              <label className="filter-option">
                <input type="checkbox" checked={inStock} onChange={(e) => updateParams({ inStock: e.target.checked })} />
                In stock
              </label>
              <label className="filter-option">
                <input type="checkbox" checked={sale} onChange={(e) => updateParams({ sale: e.target.checked })} />
                On sale
              </label>
              <label className="filter-option">
                <input type="checkbox" checked={featured} onChange={(e) => updateParams({ featured: e.target.checked })} />
                Featured
              </label>
            </div>

            {isFiltering && (
              <button type="button" className="sidebar__reset" onClick={clearAll}>
                Clear all filters
              </button>
            )}
          </aside>

          <div>
            {isFiltering && (
              <div className="chips">
                {q && (
                  <span className="chip">
                    “{q}” <button onClick={() => updateParams({ q: '' })} aria-label="Remove search">✕</button>
                  </span>
                )}
                {category && (
                  <span className="chip">
                    {categories.find((c) => c._id === category)?.name || 'Category'}{' '}
                    <button onClick={() => updateParams({ category: '' })} aria-label="Remove category filter">✕</button>
                  </span>
                )}
                {minPrice && (
                  <span className="chip">
                    Min {Number(minPrice).toLocaleString()} <button onClick={() => updateParams({ min: '' })} aria-label="Remove min price">✕</button>
                  </span>
                )}
                {maxPrice && (
                  <span className="chip">
                    Max {Number(maxPrice).toLocaleString()} <button onClick={() => updateParams({ max: '' })} aria-label="Remove max price">✕</button>
                  </span>
                )}
                {inStock && <span className="chip">In stock <button onClick={() => updateParams({ inStock: false })} aria-label="Remove stock filter">✕</button></span>}
                {sale && <span className="chip">Sale <button onClick={() => updateParams({ sale: false })} aria-label="Remove sale filter">✕</button></span>}
                {featured && <span className="chip">Featured <button onClick={() => updateParams({ featured: false })} aria-label="Remove featured filter">✕</button></span>}
              </div>
            )}

            {loading && <ProductGridSkeleton count={8} />}

            {error && <ErrorState title="Couldn't load products" text={error} retry={load} />}

            {!loading && !error && wishlistOnly && wishlist.length === 0 && (
              <EmptyState
                icon={Heart}
                title="Your wishlist is empty"
                text="Save your favourite pieces by tapping the heart icon on any product."
                action={<Link to="/shop" className="btn btn--primary">Browse Products</Link>}
              />
            )}

            {!loading && !error && !wishlistOnly && products?.length === 0 && (
              <EmptyState
                title="No products found"
                text="Try adjusting your search or clearing some filters."
                action={<button type="button" className="btn btn--primary" onClick={clearAll}>Clear filters</button>}
              />
            )}

            {!loading && !error && products?.length > 0 && (
              <div className="product-grid">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} currency={currency} onQuickView={setQuickView} />
                ))}
              </div>
            )}

            {!loading && !error && !wishlistOnly && products?.length > 0 && totalPages > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <button
                  type="button"
                  className="pagination__btn"
                  disabled={page <= 1}
                  aria-label="Previous page"
                  onClick={() => updateParams({ page: page - 1 }, { resetPage: false })}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 8) }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`pagination__btn ${p === page ? 'is-active' : ''}`}
                      aria-label={`Page ${p}`}
                      aria-current={p === page ? 'page' : undefined}
                      onClick={() => updateParams({ page: p }, { resetPage: false })}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="pagination__btn"
                  disabled={page >= totalPages}
                  aria-label="Next page"
                  onClick={() => updateParams({ page: page + 1 }, { resetPage: false })}
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>

      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} />}
    </>
  );
}