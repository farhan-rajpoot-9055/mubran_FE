import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Music2, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { resolveImageUrl } from '../../api/apiClient.js';
import { waLink } from '../../utils/whatsapp.js';

export function Footer() {
  const { store, whatsappNumber } = useStore();

  const socials = [
    { icon: Instagram, href: store?.social?.instagram, label: 'Instagram' },
    { icon: Facebook, href: store?.social?.facebook, label: 'Facebook' },
    { icon: Music2, href: store?.social?.tiktok, label: 'TikTok' },
    { icon: Youtube, href: store?.social?.youtube, label: 'YouTube' },
  ].filter((s) => s.href);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Link to="/" className="brand">
              {store?.logo ? (
                <img
                  className="brand__logo brand__logo--footer"
                  src={resolveImageUrl(store.logo)}
                  alt={`${store?.storeName || 'Ladies Suits'} logo`}
                />
              ) : (
                <>
                  <span className="brand__mark" aria-hidden="true">S</span>
                  <span>
                    {store?.storeName || 'Ladies Suits'}
                    <span className="brand__sub" aria-hidden="true">Elegance · Crafted</span>
                  </span>
                </>
              )}
            </Link>
            <p className="footer__about">
              {store?.about || store?.tagline ||
                'Premium Pakistani ladies suits — 2 piece, 3 piece, lawn, cotton and embroidered outfits. Order easily on WhatsApp.'}
            </p>
            {socials.length > 0 && (
              <div className="footer__socials">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    className="footer__social"
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit our ${s.label}`}
                  >
                    <s.icon size={17} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="footer__title">Shop</h3>
            <div className="footer__col">
              <Link className="footer__link" to="/shop">All Products</Link>
              <Link className="footer__link" to="/shop?sale=true">Sale</Link>
              <Link className="footer__link" to="/shop?featured=true">Featured</Link>
              <Link className="footer__link" to="/shop?sort=newest">New Arrivals</Link>
            </div>
          </div>

          <div>
            <h3 className="footer__title">Company</h3>
            <div className="footer__col">
              <Link className="footer__link" to="/about">About Us</Link>
              <Link className="footer__link" to="/contact">Contact</Link>
              <Link className="footer__link" to="/cart">Your Cart</Link>
            </div>
          </div>

          <div>
            <h3 className="footer__title">Get in Touch</h3>
            <div className="footer__col">
              {whatsappNumber && (
                <a
                  className="footer__link"
                  href={waLink(whatsappNumber, 'Assalam-o-Alaikum, I have a question about your products.')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Us
                </a>
              )}
              {store?.email && <a className="footer__link" href={`mailto:${store.email}`}>{store.email}</a>}
              {store?.phone && <span className="footer__link">{store.phone}</span>}
              {store?.address && <span className="footer__link">{store.address}</span>}
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {currentYear} {store?.storeName || 'Ladies Suits'}. All rights reserved.</span>
          <span>Made with care in Pakistan</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;