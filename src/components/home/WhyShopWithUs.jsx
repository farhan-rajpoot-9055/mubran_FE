import { BadgeCheck, Wallet, MessageCircle, Zap, Headphones } from 'lucide-react';
import SectionHead from '../common/SectionHead.jsx';
import Reveal from '../common/Reveal.jsx';

const FEATURES = [
  { icon: BadgeCheck, title: 'Quality Products', text: 'Every suit is checked for fabric, stitching and finishing before dispatch.' },
  { icon: Wallet, title: 'Affordable Prices', text: 'Direct-from-studio pricing with honest, competitive rates.' },
  { icon: MessageCircle, title: 'Easy WhatsApp Ordering', text: 'Order in under a minute — send us your selection on WhatsApp.' },
  { icon: Zap, title: 'Fast Response', text: 'Quick confirmations and quick replies to all your questions.' },
  { icon: Headphones, title: 'Customer Support', text: 'Friendly support at every step, from sizing to after-sales.' },
];

export function WhyShopWithUs() {
  return (
    <section className="section section--tint">
      <div className="container">
        <SectionHead
          eyebrow="Why Choose Us"
          title="Why Shop With Us"
          sub="A boutique experience you can trust, delivered to your door."
        />
        <div className="why-grid">
          {FEATURES.slice(0, 4).map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <div className="why-card">
                <div className="why-card__icon">
                  <f.icon size={26} />
                </div>
                <h3 className="why-card__title">{f.title}</h3>
                <p className="why-card__text">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <div
            className="why-card"
            style={{ maxWidth: 420, margin: '1.2rem auto 0', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}
          >
            <div className="why-card__icon" style={{ margin: 0, flexShrink: 0 }}>
              <Headphones size={26} />
            </div>
            <div>
              <h3 className="why-card__title">Always Here to Help</h3>
              <p className="why-card__text" style={{ margin: 0 }}>Questions about sizing or fabrics? Just message us on WhatsApp.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default WhyShopWithUs;