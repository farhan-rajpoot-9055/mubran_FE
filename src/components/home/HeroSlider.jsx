import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { resolveImageUrl } from '../../api/apiClient.js';

const FALLBACK_SLIDES = [
  {
    id: 'fallback-1',
    image: '',
    title: 'New Collection',
    subtitle: 'Elegant styles for every occasion',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
  },
  {
    id: 'fallback-2',
    image: '',
    title: 'Premium Lawn & Cotton',
    subtitle: 'Handpicked seasonal fabrics, made with care',
    ctaText: 'Explore Collection',
    ctaLink: '/shop',
  },
];

export function HeroSlider({ slides }) {
  const list = (slides && slides.length ? slides : FALLBACK_SLIDES)
    .filter((s) => s.title || s.subtitle || s.image);

  if (!list.length) return null;

  return (
    <section className="hero" aria-label="Featured collection">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 6500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        navigation={{
          prevEl: '.hero-nav-btn--prev',
          nextEl: '.hero-nav-btn--next',
        }}
        loop
        speed={850}
        className="hero-slider"
      >
        {list.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="hero__slide">
              {slide.image ? (
                <>
                  <div
                    className="hero__bg"
                    style={{ backgroundImage: `url(${resolveImageUrl(slide.image)})` }}
                    role="img"
                    aria-label={slide.title}
                  />
                  <div className="hero__overlay" />
                </>
              ) : (
                <div className="hero__bg hero--gradient-only" />
              )}

              <div className="container">
                <div className="hero__content">
                  <p className="hero__eyebrow">New Season · {new Date().getFullYear()}</p>
                  <h1 className="hero__title">{slide.title}</h1>
                  {slide.subtitle && <p className="hero__sub">{slide.subtitle}</p>}
                  <div className="hero__cta">
                    <Link
                      to={slide.ctaLink || '/shop'}
                      className="btn btn--light btn--lg"
                      aria-label={slide.ctaText || 'Shop Now'}
                    >
                      {slide.ctaText || 'Shop Now'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <button type="button" className="hero-nav-btn hero-nav-btn--prev" aria-label="Previous slide">
        <ChevronLeft size={22} />
      </button>
      <button type="button" className="hero-nav-btn hero-nav-btn--next" aria-label="Next slide">
        <ChevronRight size={22} />
      </button>
    </section>
  );
}

export default HeroSlider;