import { Link } from 'react-router-dom';
import { MessageCircle, Mail, MapPin, Phone } from 'lucide-react';
import { Seo } from '../components/common/Seo.jsx';
import Reveal from '../components/common/Reveal.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { waLink } from '../utils/whatsapp.js';

export default function ContactPage() {
  const { store, whatsappNumber } = useStore();

  const cards = [
    whatsappNumber && {
      icon: MessageCircle,
      title: 'WhatsApp',
      line: store?.phone ? `Response within hours` : 'Tap to chat instantly',
      href: waLink(whatsappNumber, 'Assalam-o-Alaikum, I would like to ask about your products.'),
      link: 'Start chat',
    },
    store?.email && {
      icon: Mail,
      title: 'Email',
      line: store.email,
      href: `mailto:${store.email}`,
      link: 'Send email',
    },
    store?.phone && {
      icon: Phone,
      title: 'Phone',
      line: store.phone,
      href: `tel:${store.phone.replace(/\s/g, '')}`,
      link: 'Call us',
    },
    store?.address && {
      icon: MapPin,
      title: 'Based in',
      line: store.address,
      href: null,
      link: null,
    },
  ].filter(Boolean);

  return (
    <>
      <Seo
        title="Contact Us – Ladies Suits Boutique"
        description="Get in touch with us on WhatsApp, email or phone. We are happy to help with your order."
        canonical="/contact"
      />

      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Get in Touch</h1>
          <p className="page-hero__text">Questions about fabrics, sizing or delivery? We're one message away.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
            {cards.map((c) => (
              <Reveal key={c.title}>
                <div className="why-card" style={{ textAlign: 'left' }}>
                  <div className="why-card__icon"><c.icon size={24} /></div>
                  <h3 className="why-card__title">{c.title}</h3>
                  <p className="why-card__text" style={{ marginBottom: '0.4rem' }}>{c.line}</p>
                  {c.href && (
                    <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                      {c.link} →
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Reveal>
              <h2 className="section-head__title" style={{ fontSize: '1.8rem' }}>Prefer to shop first?</h2>
              <p className="page-state__text" style={{ margin: '0 auto 1.2rem' }}>Browse the full collection and order straight from your bag.</p>
              <Link to="/shop" className="btn btn--primary btn--lg">Shop the Collection</Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}