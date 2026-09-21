import { useEffect, useRef, useState } from 'react';

export const useDebounce = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);
  const t = useRef();

  useEffect(() => {
    t.current = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t.current);
  }, [value, delay]);

  return debounced;
};