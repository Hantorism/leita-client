import { problemApi } from '@apis';
import { type ProblemDetail } from '@types';
import { Logger, type PagedResponse } from '@utils';
import { useEffect, useRef, useState } from 'react';

const PopularProblems = () => {
  const [problems, setProblems] = useState<ProblemDetail[]>([]);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchProblems = async () => {
      try {
        const res = await problemApi.getProblems(0, 20);
        if (!isMounted.current) return;

        const { content } = res as unknown as PagedResponse<ProblemDetail>;

        const sortedProblems = [...content]
          .sort((a, b) => (b.solved?.totalCount || 0) - (a.solved?.totalCount || 0))
          .slice(0, 5);

        setProblems(sortedProblems);
      } catch (error) {
        Logger.error('Failed to fetch problems:', error);
      }
    };

    fetchProblems();
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <div className="mt-4 w-full mb-8 border-collapse bg-[var(--color-bg-card)] rounded-xl shadow-lg p-6 border border-gray-800">
      <h2 className="text-2xl font-normal text-white mb-4 pl-3 font-Pretendard flex items-center gap-2">
        Best Problems
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 lg:grid-cols-5 gap-4 font-NanumSquare">
        {problems.map((problem) => (
          <div
            key={problem.problemId}
            onClick={() => window.open(`problems/${problem.problemId}`, '_blank')}
            className="cursor-pointer w-full h-40 bg-[var(--color-bg-surface)] p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:bg-white/10 border border-transparent hover:border-[var(--color-brand)]/30"
          >
            <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
            <p className="text-sm text-gray-300">{problem.solved.totalCount}번 풀었어요!</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularProblems;
