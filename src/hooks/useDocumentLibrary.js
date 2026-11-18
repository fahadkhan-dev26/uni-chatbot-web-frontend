import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { documentService } from '../services/documentService';
import { computeDocumentStats } from '../utils/documentStats';

/**
 * Loads the full document library and derives dashboard statistics from it.
 * Exposes `refresh({ silent: true })` for reloads that should not replace the
 * page with a skeleton.
 */
export function useDocumentLibrary() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const requestRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    documentService
      .getAll()
      .then(({ documents: records }) => {
        if (cancelled) return;
        setDocuments(records);
        setLastUpdated(new Date().toISOString());
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(loadError.friendlyMessage || 'Could not load the document library.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    const requestId = ++requestRef.current;

    if (silent) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const { documents: records } = await documentService.getAll();
      if (requestId !== requestRef.current) return false;

      setDocuments(records);
      setLastUpdated(new Date().toISOString());
      return true;
    } catch (refreshError) {
      if (requestId !== requestRef.current) return false;
      setError(refreshError.friendlyMessage || 'Could not load the document library.');
      return false;
    } finally {
      if (requestId === requestRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  const stats = useMemo(() => computeDocumentStats(documents), [documents]);

  return {
    documents,
    stats,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  };
}
