import { Link } from 'react-router-dom';
import Reveal from '../common/Reveal.jsx';

export function PromoBanner({ title = 'New Season Collection', text = 'Discover your next favorite look', ctaText = 'Explore Collection', ctaLink = '/shop' }) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <Reveal>
          <div className="promo">
            <div className="promo__bg" aria-hidden="true" />
            <div className="promo__overlay">
              <p className="promo__eyebrow">Limited Season</p>
              <h2 className="promo__title">{title}</h2>
              <p className="promo__sub">{text}</p>
              <Link to={ctaLink} className="btn btn--light btn--lg" style={{ marginTop: '0.6rem' }}>
                {ctaText}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default PromoBanner;