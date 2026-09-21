import { Link } from 'react-router-dom';
import { X, ShoppingBag, MessageCircle, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { formatPrice } from '../../utils/format.js';
import { CartItemThumb } from '../common/CartItemThumb.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function CartDrawer() {
  const { cart, count, subtotal, isOpen, setIsOpen, setQuantity, removeFromCart, orderOnWhatsApp } = useCart();
  const { currency, whatsappNumber } = useStore();
  const toast = useToast();

  const onOrder = () => {
    if (!cart.length) return;
    if (!whatsappNumber) {
      toast?.error('WhatsApp number not configured yet. Add it in Admin → Settings.');
      return;
    }
    const res = orderOnWhatsApp();
    if (res?.ok) {
      toast?.success('WhatsApp opened with your order details.');
    }
  };

  return (
    <div className={`drawer ${isOpen ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button type="button" className="drawer__backdrop" aria-label="Close cart" onClick={() => setIsOpen(false)} />
      <div className="drawer__panel">
        <div className="drawer__head">
          <h2 className="drawer__title">
            Your Bag {count > 0 && <span className="text-muted">({count})</span>}
          </h2>
          <button type="button" className="icon-btn" aria-label="Close cart" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer__body">
          {cart.length === 0 ? (
            <div className="page-state" style={{ padding: '3rem 0' }}>
              <div className="page-state__icon">
                <ShoppingBag size={28} />
              </div>
              <h3 className="page-state__title" style={{ fontSize: '1.15rem' }}>Your bag is empty</h3>
              <p className="page-state__text" style={{ fontSize: '0.9rem' }}>Browse our collection and add something beautiful.</p>
              <Link to="/shop" className="btn btn--primary btn--sm" onClick={() => setIsOpen(false)}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              {cart.map((it) => {
                const price = it.salePrice && it.salePrice < it.price ? it.salePrice : it.price;
                return (
                  <div className="cart-item" key={it.slug}>
                    <Link to={`/products/${it.slug}`} onClick={() => setIsOpen(false)}>
                      <CartItemThumb image={it.image} alt={it.name} />
                    </Link>
                    <div>
                      <Link to={`/products/${it.slug}`} onClick={() => setIsOpen(false)} className="cart-item__name">
                        {it.name}
                      </Link>
                      <div className="cart-item__sku">{it.sku}</div>
                      <div className="cart-item__actions">
                        <div className="qty" aria-label="Quantity">
                          <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(it.slug, it.quantity - 1)}>
                            <Minus size={13} />
                          </button>
                          <span className="qty__val">{it.quantity}</span>
                          <button type="button" aria-label="Increase quantity" onClick={() => setQuantity(it.slug, it.quantity + 1)}>
                            <Plus size={13} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ width: 36, height: 36 }}
                          aria-label={`Remove ${it.name}`}
                          onClick={() => removeFromCart(it.slug)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="cart-item__price">
                        {formatPrice(price * it.quantity, currency)} {currency}
                      </div>
                      {it.salePrice && it.salePrice < it.price && (
                        <div className="text-muted" style={{ fontSize: '0.72rem', textDecoration: 'line-through' }}>
                          {formatPrice(it.price * it.quantity, currency)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="drawer__foot">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
                  <span style={{ fontWeight: 600 }}>Estimated Subtotal</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                    {formatPrice(subtotal, currency)} {currency}
                  </span>
                </div>
                <button type="button" className="btn btn--whatsapp btn--block" onClick={onOrder}>
                  <MessageCircle size={17} /> Order via WhatsApp
                </button>
                <Link to="/cart" className="btn btn--outline btn--block" style={{ marginTop: '0.6rem' }} onClick={() => setIsOpen(false)}>
                  View Full Cart
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;