import { Link } from 'react-router-dom';

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={it.path || i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            {i > 0 && <span className="breadcrumbs__sep" aria-hidden="true">/</span>}
            {last || !it.path ? (
              <span aria-current={last ? 'page' : undefined} className={last ? '' : 'text-muted'}>
                {it.name}
              </span>
            ) : (
              <Link to={it.path}>{it.name}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;