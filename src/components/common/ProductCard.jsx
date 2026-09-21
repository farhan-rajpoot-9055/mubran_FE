import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, ImageOff } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { resolveImageUrl } from '../../api/apiClient.js';
import { formatPrice } from '../../utils/format.js';

export function ProductCard({ product, currency = 'PKR', onQuickView }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const wished = isWishlisted(product.slug);
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const cover = resolveImageUrl(product.images?.[0]);
  const [imgFailed, setImgFailed] = useState(false);

  const currentPrice = hasDiscount ? product.salePrice : product.price;

  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`} className="product-card__media" aria-label={product.name}>
        {cover && !imgFailed ? (
          <img
            src={cover}
            alt={product.altText || product.name}
            className="product-card__img"
            loading="lazy"
            decoding="async"
            width="400"
            height="500"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="product-card__img product-card__img--placeholder">
            <ImageOff size={30} />
          </span>
        )}

        {product.stock <= 0 && <span className="badge badge--soldout">Sold Out</span>}
        {!hasDiscount && product.stock > 0 && product.featured && (
          <span className="badge">Featured</span>
        )}
        {hasDiscount && <span className="badge badge--sale">-{product.discountPercent}%</span>}
      </Link>

      <button
        type="button"
        className={`product-card__wish ${wished ? 'is-wished' : ''}`}
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={wished}
        onClick={() => toggleWishlist(product.slug)}
      >
        <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
      </button>

      {onQuickView && (
        <button
          type="button"
          className="product-card__quick"
          aria-label={`Quick view ${product.name}`}
          onClick={() => onQuickView(product)}
        >
          <Eye size={17} />
        </button>
      )}

      <div className="product-card__body">
        {product.category && (
          <span className="product-card__cat">{product.category.name}</span>
        )}
        <Link to={`/products/${product.slug}`} className="product-card__name">
          {product.name}
        </Link>
        <span className="product-card__sku">{product.sku}</span>

        <div className="product-card__price">
          <span className="product-card__price-now">
            {formatPrice(currentPrice, currency)} {currency}
          </span>
          {hasDiscount && <span className="product-card__price-was">{formatPrice(product.price, currency)}</span>}
        </div>

        {product.stock > 0 ? (
          product.stock <= 10 ? (
            <span className="product-card__stock" style={{ color: 'var(--warning)' }}>
              Only {product.stock} left
            </span>
          ) : (
            <span className="product-card__stock">In Stock</span>
          )
        ) : (
          <span className="product-card__stock product-card__stock--out">Out of stock</span>
        )}

        <button
          type="button"
          className="btn btn--dark btn--sm btn--block product-card__btn"
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
            })
          }
        >
          <ShoppingBag size={14} />
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default ProductCard;