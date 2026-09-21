import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, MessageCircle, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice } from '../utils/format.js';
import { resolveImageUrl } from '../api/apiClient.js';
import { Seo } from '../components/common/Seo.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export default function CartPage() {
  const { cart, subtotal, setQuantity, removeFromCart, clearCart, orderOnWhatsApp } = useCart();
  const { currency, whatsappNumber } = useStore();
  const toast = useToast();

  const onOrder = () => {
    if (!cart.length) return;
    if (!whatsappNumber) {
      toast.error('WhatsApp number not configured yet. Add it in Admin → Settings.');
      return;
    }
    const res = orderOnWhatsApp();
    if (res?.ok) toast.success('WhatsApp opened with your order details.');
  };

  return (
    <>
      <Seo title="Your Shopping Bag | Ladies Suits" description="Review your selected items and order them easily on WhatsApp." canonical="/cart" noIndex />

      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Your Shopping Bag</h1>
          <p className="page-hero__text">Review your items, then send the order to us on WhatsApp.</p>
        </div>
      </div>

      <div className="container">
        {cart.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is empty"
            text="Browse our collection and add something you love."
            action={<Link to="/shop" className="btn btn--primary">Start Shopping <ArrowRight size={16} /></Link>}
          />
        ) : (
          <div className="cart-layout">
            <div className="panel">
              {cart.map((it) => {
                const price = it.salePrice && it.salePrice < it.price ? it.salePrice : it.price;
                return (
                  <div className="cart-item" key={it.slug}>
                    <Link to={`/products/${it.slug}`}>
                      {it.image ? (
                        <img src={resolveImageUrl(it.image)} alt={it.name} className="cart-item__img" loading="lazy" />
                      ) : (
                        <div className="cart-item__img skeleton" />
                      )}
                    </Link>
                    <div>
                      <Link to={`/products/${it.slug}`} className="cart-item__name">{it.name}</Link>
                      <div className="cart-item__sku">{it.sku}</div>
                      <div className="cart-item__price">
                        {formatPrice(price, currency)} {currency}
                        {it.salePrice && it.salePrice < it.price && (
                          <span className="text-muted" style={{ fontSize: '0.8rem', textDecoration: 'line-through', marginLeft: '0.5rem' }}>
                            {formatPrice(it.price, currency)}
                          </span>
                        )}
                      </div>
                      <div className="cart-item__actions">
                        <div className="qty" aria-label="Quantity">
                          <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(it.slug, it.quantity - 1)}>
                            <Minus size={14} />
                          </button>
                          <span className="qty__val">{it.quantity}</span>
                          <button type="button" aria-label="Increase quantity" onClick={() => setQuantity(it.slug, it.quantity + 1)}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="cart-item__third-col">
                      <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>
                        {formatPrice(price * it.quantity, currency)}
                      </strong>
                      <button
                        type="button"
                        className="mini-btn mini-btn--danger"
                        aria-label={`Remove ${it.name}`}
                        onClick={() => removeFromCart(it.slug)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="panel" style={{ position: 'sticky', top: 'calc(var(--header-h) + 1.2rem)' }}>
              <div className="panel__head">
                <h2 className="panel__title">Order Summary</h2>
              </div>
              <div className="panel__body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <span className="text-muted">Items ({cart.length})</span>
                  <span>{formatPrice(subtotal, currency)} {currency}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--line)', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 600 }}>Estimated Subtotal</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
                    {formatPrice(subtotal, currency)} {currency}
                  </span>
                </div>
                <button type="button" className="btn btn--whatsapp btn--lg btn--block" onClick={onOrder}>
                  <MessageCircle size={18} /> Order via WhatsApp
                </button>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.7rem', textAlign: 'center' }}>
                  Delivery charges confirmed on WhatsApp after order confirmation.
                </p>
                <button
                  type="button"
                  className="btn btn--outline btn--block"
                  style={{ marginTop: '0.6rem' }}
                  onClick={() => clearCart()}
                >
                  Clear Bag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}