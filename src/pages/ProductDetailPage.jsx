import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import {
  MessageCircle, ShoppingBag, Minus, Plus, Truck, ShieldCheck, RotateCcw, Heart, ImageOff,
} from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';
import api, { resolveImageUrl } from '../api/apiClient.js';
import { useCart } from '../context/CartContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { formatPrice } from '../utils/format.js';
import { productMessage, waLink } from '../utils/whatsapp.js';
import { productSchema, breadcrumbSchema } from '../utils/seo.js';
import { ProductCard } from '../components/common/ProductCard.jsx';
import { ProductGridSkeleton } from '../components/common/ProductGridSkeleton.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Seo } from '../components/common/Seo.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { SectionHead } from '../components/common/SectionHead.jsx';
import { QuickView } from '../components/common/QuickView.jsx';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currency, whatsappNumber } = useStore();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [quickView, setQuickView] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get(`/products/${slug}`)
      .then(async (res) => {
        setProduct(res.data);
        setQty(1);
        setActiveImage(0);
        try {
          const rel = await api.get(`/products/${slug}/related`);
          setRelated(rel.data);
        } catch {
          setRelated([]);
        }
      })
      .catch((e) => {
        setError(e.message);
        if (e.status === 404) navigate('/shop', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const wished = product ? isWishlisted(product.slug) : false;
  const hasDiscount = !!(product?.salePrice && product?.price && product.salePrice < product.price);
  const currentPrice = hasDiscount ? product.salePrice : product?.price ?? 0;
  const images = product?.images?.length ? product.images : [];

  const origin = import.meta.env.VITE_APP_URL || window.location.origin;
  const seoTitle =
    product?.seo?.title ||
    (product ? `${product.name} – ${formatPrice(currentPrice, currency)} ${currency}` : '');
  const seoDesc =
    product?.seo?.description ||
    (product ? `${product.name} (${product.sku}). Shop online — order easily on WhatsApp.` : '');
  const cover = images[0];

  if (loading) {
    return (
      <div className="container" style={{ paddingBlock: '2.5rem' }}>
        <div className="skeleton" style={{ height: 20, width: 260, marginBottom: '1.4rem' }} />
        <div className="product-banner">
          <div style={{ background: 'var(--surface-2)' }}>
            <div className="skeleton" style={{ height: 420, margin: '1.2rem', borderRadius: 8 }} />
          </div>
          <div style={{ padding: '2rem' }}>
            <div className="skeleton" style={{ height: 14, width: 140 }} />
            <div className="skeleton" style={{ height: 34, width: '80%', marginTop: 14 }} />
            <div className="skeleton" style={{ height: 16, width: 160, marginTop: 12 }} />
            <div className="skeleton" style={{ height: 38, width: 240, marginTop: 22 }} />
            <div className="skeleton" style={{ height: 90, width: '100%', marginTop: 22 }} />
            <div className="skeleton" style={{ height: 46, width: '100%', marginTop: 26 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingBlock: '3rem' }}>
        <ErrorState title="Product unavailable" text={error} retry={load} />
      </div>
    );
  }

  if (!product) return null;

  const categoryCrumb = product.category
    ? { name: product.category.name, path: `/category/${product.category.slug}` }
    : null;

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDesc}
        canonical={`/products/${product.slug}`}
        type="product"
        image={cover}
        jsonLd={productSchema(product, origin, currency, 'Ladies Suits')}
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(
            breadcrumbSchema(
              [
                { name: 'Home', path: '/' },
                { name: 'Shop', path: '/shop' },
                ...(categoryCrumb ? [categoryCrumb] : []),
                { name: product.name, path: `/products/${product.slug}` },
              ],
              origin
            )
          )}
        </script>
      </Helmet>

      <div className="container product-page">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            ...(categoryCrumb ? [categoryCrumb] : []),
            { name: product.name },
          ]}
        />

        <div className="product-banner" style={{ marginTop: '1.2rem' }}>
          <div className="gallery gallery--desktop">
            {images.length > 1 && (
              <div className="gallery__thumbs">
                {images.map((img, i) => (
                  <button
                    type="button"
                    key={img}
                    className={`gallery__thumb ${i === activeImage ? 'is-active' : ''}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={resolveImageUrl(img)} alt={`${product.name} view ${i + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
            <div
              className={`gallery__main ${zoomed ? 'gallery__main--zoomed' : ''}`}
              onMouseMove={(e) => {
                if (zoomed) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  e.currentTarget.querySelector('img').style.transformOrigin = `${x}% ${y}%`;
                }
              }}
              onClick={() => setZoomed((z) => !z)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setZoomed((z) => !z);
              }}
              aria-label="Zoom product image"
            >
              {images.length ? (
                <img
                  src={resolveImageUrl(images[activeImage])}
                  alt={product.altText || product.name}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
                  <ImageOff size={44} />
                </div>
              )}
            </div>
          </div>

          <div className="gallery gallery--mobile">
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              spaceBetween={8}
              onSlideChange={(s) => setActiveImage(s.activeIndex)}
              initialSlide={activeImage}
            >
              {images.map((img, i) => (
                <SwiperSlide key={img}>
                  <img src={resolveImageUrl(img)} alt={`${product.name} view ${i + 1}`} />
                </SwiperSlide>
              ))}
              {!images.length && (
                <SwiperSlide>
                  <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
                    <ImageOff size={44} />
                  </div>
                </SwiperSlide>
              )}
            </Swiper>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.8rem 1rem' }}>
                {images.map((img, i) => (
                  <button
                    type="button"
                    key={img}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    style={{
                      width: 56,
                      height: 66,
                      borderRadius: 5,
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: `2px solid ${i === activeImage ? 'var(--primary)' : 'transparent'}`,
                    }}
                  >
                    <img src={resolveImageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            {product.category && (
              <Link to={`/category/${product.category.slug}`} className="product-info__cat">
                {product.category.name}
              </Link>
            )}
            <h1 className="product-info__name">{product.name}</h1>
            <span className="product-info__sku">SKU: {product.sku}</span>

            <div className="product-info__meta-row">
              {product.stock > 0 ? (
                product.stock <= 10 ? (
                  <span className="stock-chip stock-chip--low">Only {product.stock} left in stock</span>
                ) : (
                  <span className="stock-chip stock-chip--in">✓ In Stock</span>
                )
              ) : (
                <span className="stock-chip stock-chip--out">Out of Stock</span>
              )}

              <button
                type="button"
                className={`product-card__wish ${wished ? 'is-wished' : ''}`}
                style={{ position: 'static', boxShadow: 'none', border: '1px solid var(--line)' }}
                aria-pressed={wished}
                onClick={() => toggleWishlist(product.slug)}
              >
                <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
                {wished ? 'Saved' : 'Save'}
              </button>
            </div>

            <div className="product-info__price">
              <span className="price-now">{formatPrice(currentPrice, currency)} {currency}</span>
              {hasDiscount && (
                <>
                  <span className="price-was">{formatPrice(product.price, currency)}</span>
                  <span className="save-badge">Save {product.discountPercent}%</span>
                </>
              )}
            </div>

            <hr className="product-info__divider" />

            {product.description && (
              <div className="product-info__desc">{product.description}</div>
            )}

            <div className="buy-row">
              <div className="qty" aria-label="Quantity selector">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                  <Minus size={15} />
                </button>
                <span className="qty__val">{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))} aria-label="Increase quantity">
                  <Plus size={15} />
                </button>
              </div>

              <button
                type="button"
                className="btn btn--dark"
                disabled={product.stock <= 0}
                onClick={() =>
                  addToCart(
                    {
                      id: product.id || product._id,
                      slug: product.slug,
                      name: product.name,
                      sku: product.sku,
                      price: product.price,
                      salePrice: product.salePrice,
                      image: images[0] || '',
                      stock: product.stock,
                    },
                    qty
                  )
                }
              >
                <ShoppingBag size={17} /> Add to Cart
              </button>
            </div>

            {whatsappNumber && product.stock > 0 && (
              <a
                className="btn btn--whatsapp btn--lg btn--block"
                target="_blank"
                rel="noopener noreferrer"
                href={waLink(
                  whatsappNumber,
                  productMessage({
                    name: product.name,
                    sku: product.sku,
                    price: currentPrice,
                    quantity: qty,
                    url: `${origin}/products/${product.slug}`,
                    currency,
                  })
                )}
              >
                <MessageCircle size={18} /> Order on WhatsApp
              </a>
            )}

            <div className="product-info__shipping">
              <span className="ship-note"><Truck size={16} /> Nationwide delivery across Pakistan</span>
              <span className="ship-note"><ShieldCheck size={16} /> Quality checked before dispatch</span>
              <span className="ship-note"><RotateCcw size={16} /> Easy replacement on quality issues</span>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="related">
            <SectionHead eyebrow="You may also like" title="Related Products" />
            <div className="product-grid">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} currency={currency} onQuickView={setQuickView} />
              ))}
            </div>
          </section>
        )}
      </div>

      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} />}
    </>
  );
}