import { problemApi } from '@apis';
import { Logger } from '@utils';
import { useEffect, useState } from 'react';

interface Problem {
  problemId: number;
  title: string;
  solved: {
    totalCount: number;
    rate: number;
  };
}

const PopularProblems = () => {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await problemApi.getProblems(0, 20);
        const content = res.data?.content || res.content || [];

        const sortedProblems = [...content]
          .sort((a: Problem, b: Problem) => (b.solved?.totalCount || 0) - (a.solved?.totalCount || 0))
          .slice(0, 5);

        setProblems(sortedProblems);
      } catch (error) {
        Logger.error('Failed to fetch problems:', error);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className="mt-20 w-full mb-20 border-collapse bg-white bg-opacity-10 rounded-xl shadow-lg   p-4">
      <h2 className="text-2xl font-normal text-white mb-4 pl-3 font-Pretendard flex items-center gap-2">
        Best Problems
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 font-NanumSquare">
        {problems.map((problem) => (
          <div
            key={problem.problemId}
            onClick={() => window.open(`problems/${problem.problemId}`, '_blank')}
            className="cursor-pointer w-full h-40 bg-white bg-opacity-10 p-4 rounded-xl transition-transform duration-200 hover:scale-105 hover:bg-opacity-20"
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
