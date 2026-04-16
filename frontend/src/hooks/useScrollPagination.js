import { useState, useEffect, useCallback, useRef } from 'react';

export function useScrollPagination(fetchFn, { threshold = 200 } = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(page);
      setItems((prev) => [...prev, ...result.posts]);
      setHasMore(result.pagination.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchFn, page, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    loadingRef.current = false;
  }, []);

  useEffect(() => {
    loadMore();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop - clientHeight < threshold && hasMore && !loadingRef.current) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, hasMore, threshold]);

  return { items, loading, hasMore, error, reset, loadMore };
}
