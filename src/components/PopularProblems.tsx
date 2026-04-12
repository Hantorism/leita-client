import { problemApi } from '@apis';
import { Logger, type PagedResponse } from '@utils';
import { motion } from 'framer-motion';
import type { ProblemDetail } from '@types';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-8">
      {problems.map((problem, index) => (
        <motion.div
          key={problem.problemId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          onClick={() => window.open(`problems/${problem.problemId}`, '_blank')}
          className="group cursor-pointer bg-white/5 border border-white/5 p-8 rounded-[2rem] sm:rounded-[2.5rem] transition-all duration-500 hover:bg-white/10 hover:border-white/10 active:scale-95 shadow-2xl flex flex-col justify-between aspect-auto min-h-[200px] sm:min-h-[280px]"
        >
          <div className="flex flex-col gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#CAFE33]/10 flex items-center justify-center group-hover:bg-[#CAFE33] transition-colors duration-500">
               <span className="text-sm sm:text-base font-black text-[#CAFE33] group-hover:text-black">0{index + 1}</span>
            </div>
            <div>
              <span className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block">
                Popular
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight group-hover:text-[#CAFE33] transition-colors line-clamp-2">
                {problem.title}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6 sm:mt-8">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">Solved by</span>
              <span className="text-base sm:text-lg font-black text-gray-300 font-JetBrain">{problem.solved.totalCount.toLocaleString()}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#CAFE33] transition-all duration-500 shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-400 group-hover:text-black">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PopularProblems;
