import { useEffect, useState } from 'react';

interface UseDebouncedValueOptions {
  delay?: number;
  leading?: boolean; // reserved for future behavior
}

export const useDebouncedValue = <T>(
  value: T,
  { delay = 300 }: UseDebouncedValueOptions = {}
) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
};
