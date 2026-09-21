import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/apiClient';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    api
      .get('/settings/public')
      .then((res) => {
        if (mounted) setStore(res.data);
      })
      .catch((e) => {
        if (mounted) setError(e.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
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