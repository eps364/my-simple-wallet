"use client";

import { useState, useCallback, useEffect } from 'react';

interface FetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useDataFetching<T>(
  fetcher: () => Promise<T>,
  dependencies: unknown[] = []
): FetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(errorMessage || 'Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}