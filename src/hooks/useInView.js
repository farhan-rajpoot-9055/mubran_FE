import { useCallback, useEffect, useRef, useState } from 'react';

export const useInView = (options = { threshold: 0.12 }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      options
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
};

export const useReveal = () => useInView({ threshold: 0.12 });

export default useInView;