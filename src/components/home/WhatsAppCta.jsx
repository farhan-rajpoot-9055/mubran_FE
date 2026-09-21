import { MessageCircle } from 'lucide-react';
import Reveal from '../common/Reveal.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { waLink } from '../../utils/whatsapp.js';

export function WhatsAppCta() {
  const { whatsappNumber } = useStore();

  if (!whatsappNumber) return null;

  const href = waLink(
    whatsappNumber,
    'Assalam-o-Alaikum! I would like to know more about your ladies suits collection.'
  );

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <Reveal>
          <div className="wa-cta">
            <div>
              <div className="wa-cta__icon" aria-hidden="true">
                <MessageCircle size={34} />
              </div>
              <h2 className="wa-cta__title">Order on WhatsApp</h2>
              <p className="wa-cta__text">
                Browse the collection, then send us your order directly on WhatsApp. We'll confirm
                availability and delivery details right away.
              </p>
            </div>
            <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp btn--lg">
              <MessageCircle size={18} /> Chat With Us
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default WhatsAppCta;