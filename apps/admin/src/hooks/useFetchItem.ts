import { useState, useEffect, useCallback, useRef } from 'react';

export function useFetchItem<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
) {
  const [item, setItem] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetcherRef.current();
      setItem(res);
    } catch (err) {
      console.error('Failed to fetch item:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    item,
    loading,
    error,
    refetch: fetchItem,
  };
}
