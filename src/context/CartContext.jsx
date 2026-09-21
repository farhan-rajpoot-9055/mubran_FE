import { createContext, useContext, useEffect, useMemo, useReducer, useCallback, useState } from 'react';
import api from '../api/apiClient';
import { cartMessage } from '../utils/whatsapp.js';
import { useStore } from './StoreContext.jsx';

const CartContext = createContext(null);
const CART_KEY = 'ams_cart_v1';
const WISHLIST_KEY = 'ams_wishlist_v1';

const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'CLEAR':
      return [];
    case 'ADD': {
      const existing = state.find((it) => it.slug === action.item.slug);
      if (existing) {
        return state.map((it) =>
          it.slug === action.item.slug
            ? { ...it, quantity: Math.min(it.quantity + action.quantity, action.maxStock) }
            : it
        );
      }
      return [...state, { ...action.item, quantity: action.quantity }];
    }
    case 'REMOVE':
      return state.filter((it) => it.slug !== action.slug);
    case 'SET_QTY':
      return state.map((it) =>
        it.slug === action.slug ? { ...it, quantity: action.quantity } : it
      );
    default:
      return state;
  }
};

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE':
      return state.includes(action.slug)
        ? state.filter((s) => s !== action.slug)
        : [...state, action.slug];
    case 'REMOVE':
      return state.filter((s) => s !== action.slug);
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { whatsappNumber, currency } = useStore();
  const [cart, dispatch] = useReducer(cartReducer, [], () => readStorage(CART_KEY));
  const [wishlist, wishlistDispatch] = useReducer(wishlistReducer, [], () =>
    readStorage(WISHLIST_KEY)
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const addToCart = useCallback((item, quantity = 1) => {
    dispatch({
      type: 'ADD',
      item,
      quantity,
      maxStock: item.stock || 99,
    });
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((slug) => dispatch({ type: 'REMOVE', slug }), []);
  const setQuantity = useCallback((slug, quantity) =>
    dispatch({ type: 'SET_QTY', slug, quantity: Math.max(1, quantity) }), []);

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const toggleWishlist = useCallback((slug) => wishlistDispatch({ type: 'TOGGLE', slug }), []);
  const isWishlisted = useCallback((slug) => wishlist.includes(slug), [wishlist]);

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, it) => {
        const price = it.salePrice && it.salePrice < it.price ? it.salePrice : it.price;
        return sum + price * it.quantity;
      }, 0),
    [cart]
  );

  const count = useMemo(() => cart.reduce((s, it) => s + it.quantity, 0), [cart]);

  const orderOnWhatsApp = useCallback(() => {
    if (!cart.length) return { ok: false, message: 'Cart is empty' };

    const buildUrl = (slug) => {
      const base = import.meta.env.VITE_APP_URL || window.location.origin;
      return `${base.replace(/\/$/, '')}/products/${slug}`;
    };

    const payload = cart.map((it) => ({
      productId: it.id || '000000000000000000000000',
      sku: it.sku,
      quantity: it.quantity,
    }));

    const link = `https://wa.me/${whatsappNumber}`;

    const ship = async () => {
      try {
        await api.post('/orders/whatsapp', {
          name: 'WhatsApp Customer',
          items: payload,
        });
      } catch {
        // The record is best-effort — WhatsApp message is the source of truth.
      }
    };

    const message = cartMessage({
      items: cart.map((it) => ({
        name: it.name,
        sku: it.sku,
        price: it.salePrice && it.salePrice < it.price ? it.salePrice : it.price,
        quantity: it.quantity,
        url: buildUrl(it.slug),
      })),
      subtotal,
      currency,
    });

    window.open(`${link}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    ship();

    return { ok: true };
  }, [cart, subtotal, currency, whatsappNumber]);

  const value = useMemo(
    () => ({
      cart,
      count,
      subtotal,
      isOpen,
      setIsOpen,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      orderOnWhatsApp,
      toggleWishlist,
      isWishlisted,
      wishlist,
    }),
    [
      cart,
      count,
      subtotal,
      isOpen,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      orderOnWhatsApp,
      toggleWishlist,
      isWishlisted,
      wishlist,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
export default CartContext;