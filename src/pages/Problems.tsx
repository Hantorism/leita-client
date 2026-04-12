import { Solved } from '@assets/images';
import { Button, Footer, Header } from '@components';
import { useAlert } from '@contexts';
import { getCurrentUserEmail, Logger } from '@utils';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const PROBLEMS_PER_PAGE = 10;

const ProblemsPage = () => {
  const { showAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const problemsPerPage = 10;
  const [filter, setFilter] = useState<'ALL' | 'SOLVED' | 'UNSOLVED'>('ALL');

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const filterValue = filter !== 'ALL' ? filter : undefined;
        const res = await problemApi.getProblems(currentPage, problemsPerPage, searchQuery, filterValue as any);
        const content = res.data?.content ?? res.content ?? [];
        const total = res.data?.totalPages ?? res.totalPages ?? 1;
        setProblems(content);
        setTotalPages(total);
      } catch (error) {
        Logger.error('Failed to fetch problems:', error);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

  // 해결한 문제 ID를 Set으로 메모이제이션 (O(1) 조회)
  const solvedProblemIds = useMemo(() => {
    const ids = new Set<number>();
    judges.forEach((judge) => {
      if (judge.result === 'CORRECT') {
        ids.add(judge.problemId);
      }
    };

    fetchProblems();
    fetchJudgedProblems();
  }, [currentPage, searchQuery, filter]);

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const isProblemSolved = (problemId: number) => {
    return judgedProblems.some((judge) => judge.problemId === problemId);
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.problemId.toString().includes(searchQuery);
    if (!matchesSearch) return false;
    if (filter === 'ALL') return true;
    if (filter === 'SOLVED') return isProblemSolved(problem.problemId);
    if (filter === 'UNSOLVED') return !isProblemSolved(problem.problemId);
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#1A1A1A] font-Pretendard overflow-x-hidden">
      <Header />

      <main className="flex-grow w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="flex flex-col gap-12">
          {/* Page Header */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl sm:text-5xl font-black mb-2 tracking-tighter">문제 목록</h1>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex flex-wrap gap-1.5 bg-white/5 p-1.5 rounded-[1.5rem] border border-white/5 w-fit"
              >
                {[
                  { key: 'ALL', label: '전체' },
                  { key: 'SOLVED', label: '해결' },
                  { key: 'UNSOLVED', label: '미해결' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as 'ALL' | 'SOLVED' | 'UNSOLVED')}
                    className={`px-6 py-2.5 text-xs sm:text-sm font-black rounded-2xl transition-all duration-300 ${
                      filter === key 
                        ? 'bg-white/10 text-[#CAFE33] shadow-lg' 
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            </div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative w-full"
            >
              <svg
                className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#CAFE33] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="어떤 문제를 찾으시나요?"
                className="w-full pl-16 pr-8 py-6 sm:py-7 rounded-[2.5rem] bg-white/5 border border-white/5 text-lg sm:text-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#CAFE33]/30 focus:ring-[12px] focus:ring-[#CAFE33]/5 transition-all font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
          </div>

          {/* Problem List */}
          <div className="grid grid-cols-1 gap-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <div className="w-12 h-12 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-bold">문제를 불러오고 있어요...</p>
              </div>
            ) : filteredProblems.length > 0 ? (
              filteredProblems.map((problem, index) => (
                <motion.div
                  key={problem.problemId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  onClick={() => {
                    const email = getCurrentUserEmail();
                    if (!email) {
                      showAlert('error', '로그인이 필요합니다.');
                      return;
                    }
                    window.open(`problems/${problem.problemId}`, '_blank');
                  }}
                  className="group flex flex-col md:flex-row md:items-center justify-between p-8 sm:p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-500 cursor-pointer gap-8 active:scale-[0.98] shadow-2xl"
                >
                  <div className="flex items-start gap-8">
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-xl sm:text-2xl font-black text-gray-500 font-JetBrain group-hover:bg-[#CAFE33] group-hover:text-black transition-all duration-500">
                      {problem.problemId}
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-4">
                        <h2 className="text-xl sm:text-3xl font-black tracking-tight group-hover:text-[#CAFE33] transition-colors">{problem.title || '제목 없음'}</h2>
                        {isProblemSolved(problem.problemId) && (
                          <div className="bg-[#CAFE33]/10 p-2 rounded-full">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CAFE33" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {problem.category?.map((cat, i) => (
                          <span key={i} className="text-xs sm:text-[11px] font-black text-gray-500 px-3 py-1 bg-white/5 rounded-lg uppercase tracking-wider">
                            #{cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 border-white/5 pt-8 md:pt-0">
                    <div className="flex flex-col items-start md:items-end">
                      <span className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-2">Success Rate</span>
                      <span className="text-xl sm:text-2xl font-black text-gray-400 font-JetBrain group-hover:text-white transition-colors">
                        {problem.solved?.rate != null ? `${problem.solved.rate.toFixed(1)}%` : '-'}
                      </span>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#CAFE33] group-hover:text-black transition-all duration-500 shadow-xl group-hover:shadow-[#CAFE33]/20">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-40 rounded-[3rem] bg-white/5 border border-dashed border-white/10"
              >
                <p className="text-gray-500 text-xl font-bold">찾으시는 문제가 아직 없어요.</p>
              </motion.div>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`w-14 h-14 rounded-3xl font-black font-JetBrain text-lg transition-all duration-300 ${
                    currentPage === i 
                      ? 'bg-[#CAFE33] text-black shadow-[0_10px_30px_-5px_rgba(202,254,51,0.3)]' 
                      : 'bg-white/5 text-gray-600 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProblemsPage;
