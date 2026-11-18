import { useCallback, useEffect, useState } from 'react';
import { healthService } from '../services/healthService';

const fetchHealth = async () => {
  try {
    const { data } = await healthService.getHealth();
    return { status: 'online', data, error: null };
  } catch (err) {
    return {
      status: 'offline',
      data: null,
      error: err.friendlyMessage || err.message,
    };
  }
};

/**
 * Pings GET /api/health so the UI can show whether the Express API
 * (and therefore MongoDB) is reachable.
 */
export function useBackendStatus() {
  const [status, setStatus] = useState('checking');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const check = useCallback(async () => {
    setStatus('checking');
    setError(null);
    const result = await fetchHealth();
    setStatus(result.status);
    setData(result.data);
    setError(result.error);
    return result.status;
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchHealth().then((result) => {
      if (cancelled) return;
      setStatus(result.status);
      setData(result.data);
      setError(result.error);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, data, error, check };
}
