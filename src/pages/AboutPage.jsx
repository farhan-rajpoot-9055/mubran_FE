import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle, Scissors, Truck } from 'lucide-react';
import { Seo } from '../components/common/Seo.jsx';
import SectionHead from '../components/common/SectionHead.jsx';
import Reveal from '../components/common/Reveal.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { waLink } from '../utils/whatsapp.js';

export default function AboutPage() {
  const { store, whatsappNumber } = useStore();

  return (
    <>
      <Seo
        title="About Us – Pakistani Ladies Suits Boutique"
        description="Meet the studio behind your favourite ladies suits — quality fabrics, honest pricing and easy WhatsApp ordering."
        canonical="/about"
      />

      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Our Story</h1>
          <p className="page-hero__text">Quality fabrics, honest pricing and designs made for the modern Pakistani woman.</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <Reveal>
            <div style={{ display: 'flex', gap: '1.4rem', flexWrap: 'wrap', marginBottom: '2.4rem' }}>
              <div className="why-card" style={{ flex: 1, minWidth: 200 }}>
                <div className="why-card__icon"><Scissors size={24} /></div>
                <h3 className="why-card__title">Crafted with Care</h3>
                <p className="why-card__text">Every piece is selected for fabric quality, stitching and finish.</p>
              </div>
              <div className="why-card" style={{ flex: 1, minWidth: 200 }}>
                <div className="why-card__icon"><Truck size={24} /></div>
                <h3 className="why-card__title">Delivered Nationwide</h3>
                <p className="why-card__text">We deliver to every city in Pakistan, carefully packed.</p>
              </div>
              <div className="why-card" style={{ flex: 1, minWidth: 200 }}>
                <div className="why-card__icon"><Sparkles size={24} /></div>
                <h3 className="why-card__title">Fresh Collections</h3>
                <p className="why-card__text">New arrivals and seasonal collections, updated regularly.</p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <h2 className="section-head__title" style={{ marginBottom: '1rem' }}>What we stand for</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', color: 'var(--ink-soft)' }}>
              <p>
                {store?.about ||
                  'We started with a simple idea: Pakistani women deserve beautiful, well-made suits without overpaying. Today we bring you curated collections of lawn, cotton, 2-piece and 3-piece suits, plus intricately embroidered pieces for your special occasions.'}
              </p>
              <p>
                Ordering with us is simple. Browse the collection, add your favourites to the bag, and send your
                order on WhatsApp. Our team confirms availability and delivery details with you personally before
                anything is dispatched.
              </p>
              {whatsappNumber && (
                <p style={{ marginTop: '1rem' }}>
                  <a
                    href={waLink(whatsappNumber, 'Assalam-o-Alaikum, I would like to know more about your collection.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--whatsapp"
                  >
                    <MessageCircle size={16} /> Ask us anything on WhatsApp
                  </a>
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}