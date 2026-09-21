import { useState } from 'react';
import { resolveImageUrl } from '../../api/apiClient.js';

export function CartItemThumb({ image, alt }) {
  const [failed, setFailed] = useState(false);
  const src = image ? resolveImageUrl(image) : '';

  if (!src || failed) {
    return <div className="cart-item__img skeleton" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="cart-item__img"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default CartItemThumb;
