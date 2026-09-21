import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/apiClient';

const StoreContext = createContext(null);

// camelCase theme keys -> CSS custom property names (see :root in styles/index.css)
export const THEME_CSS_VARS = {
  bg: '--bg', bgDeep: '--bg-deep', surface: '--surface', surface2: '--surface-2',
  ink: '--ink', inkSoft: '--ink-soft', inkMuted: '--ink-muted',
  primary: '--primary', primaryDark: '--primary-dark', primaryDeep: '--primary-deep', primarySoft: '--primary-soft',
  accent: '--accent', accentDark: '--accent-dark', accentSoft: '--accent-soft',
  line: '--line', lineStrong: '--line-strong',
  wa: '--wa', waDark: '--wa-dark', waSoft: '--wa-soft',
  danger: '--danger', dangerSoft: '--danger-soft',
  success: '--success', successSoft: '--success-soft',
  warning: '--warning', warningSoft: '--warning-soft',
};

// Some theme colors are also used as translucent backgrounds/shadows via
// rgba(var(--x-rgb), alpha) — see .header, .admin-topbar, .btn--primary etc.
// in styles/index.css. Keep these "R, G, B" triplets in sync too.
const RGB_DERIVED_VARS = {
  bg: '--bg-rgb',
  primary: '--primary-rgb',
  primaryDark: '--primary-dark-rgb',
  waDark: '--wa-dark-rgb',
  danger: '--danger-rgb',
};

export const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const hexToRgbTriplet = (hex) =>
  `${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}`;

export const applyTheme = (theme) => {
  if (!theme) return;
  const root = document.documentElement.style;
  for (const [key, cssVar] of Object.entries(THEME_CSS_VARS)) {
    const value = theme[key];
    if (HEX_COLOR_RE.test(String(value || ''))) root.setProperty(cssVar, value);
  }
  for (const [key, cssVar] of Object.entries(RGB_DERIVED_VARS)) {
    const value = theme[key];
    if (HEX_COLOR_RE.test(String(value || ''))) root.setProperty(cssVar, hexToRgbTriplet(value));
  }
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta && HEX_COLOR_RE.test(String(theme.primary || ''))) {
    themeColorMeta.setAttribute('content', theme.primary);
  }
};

// Cached by index.html's inline anti-flash script too — keep the key in sync.
const CACHE_KEY = 'ams_store_cache';

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* ignore (storage disabled/full) */
  }
};

export const StoreProvider = ({ children }) => {
  const [store, setStore] = useState(readCache);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    api
      .get('/settings/public')
      .then((res) => {
        if (mounted) {
          setStore(res.data);
          applyTheme(res.data?.theme);
          writeCache(res.data);
        }
      })
      .catch((e) => {
        if (mounted) setError(e.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
        window.__hideAppLoader?.();
      });
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      store,
      loading,
      error,
      whatsappNumber:
        store?.whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '',
      currency: store?.currency || 'PKR',
    }),
    [store, loading, error]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);

export default StoreContext;