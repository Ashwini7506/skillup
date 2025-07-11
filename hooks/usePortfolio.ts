import { UserPortfolio } from '@/utils/types';
import { useState, useEffect } from 'react';
// import { UserPortfolio } from '@/lib/types';

export function usePortfolio(userId: string) {
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        const response = await fetch(`/api/portfolio/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio');
        }
        const data = await response.json();
        setPortfolio(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [userId]);

  return { portfolio, loading, error };
}