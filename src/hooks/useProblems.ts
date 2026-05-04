import { problemApi } from '@apis';
import type { ProblemDetail } from '@types';
import { Logger, type PagedResponse } from '@utils';
import { useEffect, useState } from 'react';

export const useProblems = (currentPage: number, problemsPerPage: number, searchQuery: string, filter?: string) => {
  const [problems, setProblems] = useState<ProblemDetail[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const filterValue = filter !== 'ALL' ? filter : undefined;

        const res = await problemApi.getProblems(currentPage, problemsPerPage, searchQuery, filterValue as any);

        if (isMounted) {
          const { content, totalPages: total } = res;

          setProblems(content);
          setTotalPages(total);
        }
      } catch (error) {
        if (isMounted) {
          Logger.error('Failed to fetch problems:', error);
          setProblems([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProblems();

    return () => {
      isMounted = false;
    };
  }, [currentPage, problemsPerPage, searchQuery, filter]);

  return { problems, totalPages, loading };
};
