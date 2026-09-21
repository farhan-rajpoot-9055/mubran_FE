import { useEffect } from 'react';
import { useStore } from '../../context/StoreContext.jsx';

export function SiteBrandAssets() {
  const { store } = useStore();
  const favicon = store?.favicon;

  useEffect(() => {
    if (!favicon) return undefined;
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    const prevHref = link.getAttribute('href');
    link.setAttribute('href', favicon);
    return () => {
      link.setAttribute('href', prevHref || '/favicon.svg');
    };
  }, [favicon]);

  return null;
}

export default SiteBrandAssets;