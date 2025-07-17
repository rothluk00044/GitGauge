import { useState, useCallback } from 'react';

export default function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (...args) => {
    try {
      setLoading(true);
      const response = await apiFunction(...args);
      setData(response);
      setError(null);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, error, loading, request };
}