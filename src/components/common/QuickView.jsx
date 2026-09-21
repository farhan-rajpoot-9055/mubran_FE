import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, MessageCircle, Truck } from 'lucide-react';
import { resolveImageUrl } from '../../api/apiClient.js';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/format.js';
import { productMessage, waLink } from '../../utils/whatsapp.js';
import { useStore } from '../../context/StoreContext.jsx';

export function QuickView({ product, onClose }) {
  const { addToCart } = useCart();
  const { whatsappNumber, currency } = useStore();
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    const t = requestAnimationFrame(() => setOpen(true));
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, []);

  const close = () => {
    setOpen(false);
    setTimeout(onClose, 150);
  };

  if (!product) return null;

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const currentPrice = hasDiscount ? product.salePrice : product.price;
  const cover = resolveImageUrl(product.images?.[0]);
  const url = `${import.meta.env.VITE_APP_URL || window.location.origin}/products/${product.slug}`;

  return (
    <div
      className={`quickview ${open ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view ${product.name}`}
    >
      <button className="quickview__backdrop" aria-label="Close quick view" onClick={close} />
      <div className="quickview__panel">
        <button type="button" className="quickview__close" aria-label="Close" onClick={close}>
          <X size={18} />
        </button>

        <div className="quickview__media">
          {cover ? (
            <img src={cover} alt={product.altText || product.name} />
          ) : (
            <div style={{ minHeight: 320, background: 'var(--surface-2)' }} />
          )}
        </div>

        <div className="quickview__body">
          {product.category && <span className="product-info__cat">{product.category.name}</span>}
          <Link to={`/products/${product.slug}`} className="product-info__name" style={{ fontSize: '1.5rem' }}>
            {product.name}
          </Link>
          <span className="product-info__sku">SKU: {product.sku}</span>

          <div className="product-info__price">
            <span className="price-now" style={{ fontSize: '1.6rem' }}>
              {formatPrice(currentPrice, currency)} {currency}
            </span>
            {hasDiscount && (
              <>
                <span className="price-was">{formatPrice(product.price, currency)}</span>
                <span className="save-badge">Save {product.discountPercent}%</span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-muted" style={{ fontSize: '0.92rem' }}>
              {product.description.slice(0, 220)}
              {product.description.length > 220 ? '…' : ''}
            </p>
          )}

          <span className={`stock-chip ${product.stock <= 0 ? 'stock-chip--out' : product.stock <= 10 ? 'stock-chip--low' : 'stock-chip--in'}`}>
            {product.stock <= 0 ? 'Out of stock' : product.stock <= 10 ? `Only ${product.stock} left` : 'In stock'}
          </span>

          <div className="buy-row" style={{ marginTop: '0.4rem' }}>
            <div className="qty" aria-label="Quantity">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span className="qty__val">{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button
              type="button"
              className="btn btn--dark"
              disabled={product.stock <= 0}
              onClick={() =>
                addToCart({
                  id: product.id || product._id,
                  slug: product.slug,
                  name: product.name,
                  sku: product.sku,
                  price: product.price,
                  salePrice: product.salePrice,
                  image: cover,
                  stock: product.stock,
                }, qty)
              }
            >
              <ShoppingBag size={16} /> Add to Cart
            </button>
          </div>

          {whatsappNumber && product.stock > 0 && (
            <a
              className="btn btn--whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              href={waLink(whatsappNumber, productMessage({
                name: product.name,
                sku: product.sku,
                price: currentPrice,
                quantity: qty,
                url,
                currency,
              }))}
            >
              <MessageCircle size={16} /> Order on WhatsApp
            </a>
          )}

          <Link to={`/products/${product.slug}`} className="text-muted" style={{ fontSize: '0.86rem', textDecoration: 'underline' }}>
            View full details →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default QuickView;