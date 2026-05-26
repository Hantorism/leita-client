import { useState, useEffect, useCallback, useRef } from 'react';

export function usePaginatedList<T>(
  fetcher: (page: number) => Promise<{ content: T[]; totalPages: number }>,
  deps: any[] = []
) {
  const [items, setItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const fetchItems = useCallback(
    async (page = 0) => {
      try {
        setLoading(true);
        const res = await fetcherRef.current(page);
        setItems(res.content || []);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(page);
      } catch (err) {
        console.error('Failed to fetch paginated list:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchItems(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const goToPage = useCallback(
    (page: number) => {
      fetchItems(page);
    },
    [fetchItems]
  );

  const refresh = useCallback(() => {
    fetchItems(currentPage);
  }, [fetchItems, currentPage]);

  return {
    items,
    currentPage,
    totalPages,
    loading,
    goToPage,
    refresh,
  };
}
