import { Link } from 'react-router-dom';
import { ArrowUpRight, ImageOff } from 'lucide-react';
import { resolveImageUrl } from '../../api/apiClient.js';
import SectionHead from '../common/SectionHead.jsx';
import Reveal from '../common/Reveal.jsx';

export function FeaturedCategories({ categories }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <SectionHead
          eyebrow="Collections"
          title="Shop by Category"
          sub="Every piece is handpicked and quality checked before it reaches you."
        />

        <Reveal>
          <div className="cat-grid">
            {categories.slice(0, 6).map((cat) => {
              const image = resolveImageUrl(cat.image);
              return (
                <Link to={`/category/${cat.slug}`} className="cat-card" key={cat._id || cat.slug}>
                  {image ? (
                    <span className="cat-card__img" style={{ backgroundImage: `url(${image})` }} role="img" aria-label={cat.name} />
                  ) : (
                    <span className="cat-card__img cat-card__img--placeholder" style={{ display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
                      <ImageOff size={24} />
                    </span>
                  )}
                  <span className="cat-card__shade" />
                  <span className="cat-card__arrow" aria-hidden="true">
                    <ArrowUpRight size={16} />
                  </span>
                  <span className="cat-card__body">
                    <span className="cat-card__name">{cat.name}</span>
                    <span className="cat-card__count">{cat.productCount ?? 0} items</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default FeaturedCategories;