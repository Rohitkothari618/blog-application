import { useEffect, useState } from "react";

const useDebounce = (query: string, delay: number) => {
  const [debounceValue, setDebouncedValue] = useState(query);
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedValue(query);
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [delay, query]);

  return debounceValue;
};

export default useDebounce;
