import { useState, useEffect, useCallback } from 'react';
import { GetRecyclable } from '../../../firebase/providers/recyclable';

interface Output {
  data: any | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useGetRecyclable(): Output {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchRecyclable = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const recyclableData = await GetRecyclable();
      setData(recyclableData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Erro ao buscar dados dos recicláveis');
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecyclable();
  }, [fetchRecyclable]);

  return {
    data,
    error,
    isLoading,
    refetch: fetchRecyclable,
  };
}