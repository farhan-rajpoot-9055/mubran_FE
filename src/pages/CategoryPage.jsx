import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import api from '../api/apiClient.js';
import { ProductCard } from '../components/common/ProductCard.jsx';
import { ProductGridSkeleton } from '../components/common/ProductGridSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Seo } from '../components/common/Seo.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { QuickView } from '../components/common/QuickView.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { breadcrumbSchema } from '../utils/seo.js';

const PAGE_SIZE = 12;

export default function CategoryPage() {
  const { slug } = useParams();
  const { currency } = useStore();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickView, setQuickView] = useState(null);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get(`/categories/${slug}`),
      api.get(`/products?category=${slug}&sort=${sort}&page=${page}&pageSize=${PAGE_SIZE}`),
    ])
      .then(([c, p]) => {
        setCategory(c.data);
        setProducts(p.data);
        setPagination(p.pagination);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug, sort, page]);

  useEffect(() => {
    setProducts(null);
    load();
  }, [load]);

  const origin = import.meta.env.VITE_APP_URL || window.location.origin;
  const seoTitle = category?.seo?.title || (category ? `${category.name} – Ladies Suits` : 'Category');
  const seoDesc =
    category?.seo?.description ||
    (category ? `Shop our ${category.name} collection — premium quality, affordable prices. Order on WhatsApp.` : '');

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDesc}
        canonical={`/category/${slug}`}
        jsonLd={category ? breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: category.name, path: `/category/${category.slug}` },
        ], origin) : undefined}
      />

      <div className="page-hero">
        <div className="container">
          <Breadcrumbs
            items={[
              { name: 'Home', path: '/' },
              { name: 'Shop', path: '/shop' },
              { name: loading ? '…' : category?.name || 'Category' },
            ]}
          />
          <h1 className="page-hero__title" style={{ marginTop: '0.5rem' }}>
            {loading ? 'Loading…' : category?.name}
          </h1>
          {category?.description && <p className="page-hero__text">{category.description}</p>}
        </div>
      </div>

      <div className="container">
        <div className="toolbar">
          <span className="toolbar__count">
            {loading ? 'Loading…' : `${pagination?.total ?? 0} item(s)`}
          </span>
          <div className="toolbar__spacer" />
          <select
            className="select sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
          >
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="featured">Featured</option>
          </select>
        </div>

        {loading && <ProductGridSkeleton count={8} />}

        {error && <ErrorState title="Couldn't load this category" text={error} retry={load} />}

        {!loading && !error && products?.length === 0 && (
          <EmptyState
            icon={PackageOpen}
            title="No products in this category yet"
            text="Check back soon — new pieces are added regularly."
            action={<Link to="/shop" className="btn btn--primary">Browse All Products</Link>}
          />
        )}

        {!loading && !error && products?.length > 0 && (
          <>
            <div className="product-grid" style={{ marginTop: '1.6rem' }}>
              {products.map((p) => (
                <ProductCard key={p._id} product={p} currency={currency} onQuickView={setQuickView} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <button
                  type="button"
                  className="pagination__btn"
                  disabled={page <= 1}
                  aria-label="Previous page"
                  onClick={() => setPage((p) => p - 1)}
                >
                  ‹
                </button>
                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    type="button"
                    className={`pagination__btn ${i + 1 === page ? 'is-active' : ''}`}
                    aria-label={`Page ${i + 1}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  className="pagination__btn"
                  disabled={page >= pagination.totalPages}
                  aria-label="Next page"
                  onClick={() => setPage((p) => p + 1)}
                >
                  ›
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} />}
    </>
  );
}