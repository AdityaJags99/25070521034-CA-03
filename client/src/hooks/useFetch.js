import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

// Loads data from the backend. Re-runs whenever `path` changes. Pass null to skip.
export default function useFetch(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) { setLoading(false); return undefined; }
    let cancelled = false;
    setLoading(true);
    setError('');
    api(path)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload };
}
