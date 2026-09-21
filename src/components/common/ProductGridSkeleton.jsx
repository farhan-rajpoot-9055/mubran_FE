export function ProductCardSkeleton() {
  return (
    <div className="product-card" aria-hidden="true">
      <div className="product-card__media">
        <div className="skeleton" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="product-card__body">
        <div className="skeleton" style={{ width: '40%', height: 12 }} />
        <div className="skeleton" style={{ width: '90%', height: 16, marginTop: 6 }} />
        <div className="skeleton" style={{ width: '70%', height: 16, marginTop: 6 }} />
        <div className="skeleton" style={{ width: '45%', height: 18, marginTop: 10 }} />
        <div className="skeleton" style={{ width: '100%', height: 40, marginTop: 10 }} />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default ProductGridSkeleton;