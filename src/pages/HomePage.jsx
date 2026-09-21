import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../api/apiClient.js';
import { HeroSlider } from '../components/home/HeroSlider.jsx';
import { FeaturedCategories } from '../components/home/FeaturedCategories.jsx';
import { PromoBanner } from '../components/home/PromoBanner.jsx';
import { WhyShopWithUs } from '../components/home/WhyShopWithUs.jsx';
import { WhatsAppCta } from '../components/home/WhatsAppCta.jsx';
import { ProductGridSkeleton } from '../components/common/ProductGridSkeleton.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { SectionHead } from '../components/common/SectionHead.jsx';
import { ProductCard } from '../components/common/ProductCard.jsx';
import { QuickView } from '../components/common/QuickView.jsx';
import Reveal from '../components/common/Reveal.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { storeSchema } from '../utils/seo.js';

export default function HomePage() {
  const { store, currency } = useStore();
  const [featured, setFeatured] = useState(null);
  const [newArrivals, setNewArrivals] = useState(null);
  const [error, setError] = useState(null);
  const [quickView, setQuickView] = useState(null);

  const load = useCallback(() => {
    setError(null);
    Promise.all([api.get('/products/featured'), api.get('/products/new-arrivals')])
      .then(([f, n]) => {
        setFeatured(f.data);
        setNewArrivals(n.data);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const origin = import.meta.env.VITE_APP_URL || window.location.origin;
  const storeName = store?.storeName || 'Pakistani Ladies Suits';

  return (
    <>
      <Helmet>
        <title>{store?.seo?.title || storeName}</title>
        <meta name="description" content={store?.seo?.description || `${storeName} — premium ladies suits`} />
        {store?.seo?.keywords && <meta name="keywords" content={store.seo.keywords} />}
        <script type="application/ld+json">
          {JSON.stringify(storeSchema({ ...store, storeName }, origin))}
        </script>
      </Helmet>

      <HeroSlider slides={store?.heroSlides} />

      {store?.categories?.length > 0 && <FeaturedCategories categories={store.categories} />}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <SectionHead
            eyebrow="Handpicked"
            title="Featured Products"
            sub="Our most-loved pieces, curated for you."
          />
          {error && <ErrorState title="Couldn't load products" text={error} retry={load} />}
          {!featured && !error && <ProductGridSkeleton count={4} />}
          {featured && featured.length > 0 && (
            <Reveal>
              <div className="product-grid">
                {featured.map((p) => (
                  <ProductCard key={p._id} product={p} currency={currency} onQuickView={setQuickView} />
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {!error && newArrivals && newArrivals.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead eyebrow="Just Landed" title="New Arrivals" sub="Fresh pieces added every week. Be the first to own them." />
            <Reveal>
              <div className="product-grid">
                {newArrivals.slice(0, 4).map((p) => (
                  <ProductCard key={p._id} product={p} currency={currency} onQuickView={setQuickView} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <PromoBanner />

      <WhyShopWithUs />

      <WhatsAppCta />

      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} />}
    </>
  );
}