export const StockBadge = ({ product }) => {
  if (product.stock <= 0) return <span className="chip-badge chip-badge--red">Out of stock</span>;
  if (product.stock <= 10) return <span className="chip-badge chip-badge--amber">Low · {product.stock}</span>;
  return <span className="chip-badge chip-badge--green">{product.stock} in stock</span>;
};

export const PublishBadge = ({ published }) =>
  published ? (
    <span className="chip-badge chip-badge--green">Published</span>
  ) : (
    <span className="chip-badge chip-badge--gray">Draft</span>
  );

export const FeaturedBadge = ({ featured }) =>
  featured ? <span className="chip-badge chip-badge--rose">Featured</span> : null;

export const OrderStatusBadge = ({ status }) => {
  const map = {
    pending: ['Pending', 'chip-badge--amber'],
    in_review: ['In Review', 'chip-badge--amber'],
    confirmed: ['Confirmed', 'chip-badge--green'],
    fulfilled: ['Fulfilled', 'chip-badge--green'],
    cancelled: ['Cancelled', 'chip-badge--red'],
  };
  const [label, cls] = map[status] || [status, 'chip-badge--gray'];
  return <span className={`chip-badge ${cls}`}>{label}</span>;
};

export const CategoryActiveBadge = ({ active }) =>
  active ? (
    <span className="chip-badge chip-badge--green">Active</span>
  ) : (
    <span className="chip-badge chip-badge--gray">Hidden</span>
  );