import { ChevronLeft, ChevronRight } from 'lucide-react';

export function PaginationBar({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => i + 1);

  return (
    <div className="pagination">
      <button type="button" className="pagination__btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`pagination__btn ${p === page ? 'is-active' : ''}`}
          onClick={() => onChange(p)}
          aria-label={`Page ${p}`}
        >
          {p}
        </button>
      ))}
      <button type="button" className="pagination__btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default PaginationBar;