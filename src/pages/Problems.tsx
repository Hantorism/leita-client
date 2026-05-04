import { Solved } from '@assets/images';
import { Button, Footer, Header, Pagination } from '@components';
import { useAlert, useAuth } from '@contexts';
import { useProblems, useJudges, useDebounce } from '@hooks';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const PROBLEMS_PER_PAGE = 10;

const ProblemsPage = () => {
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<'ALL' | 'SOLVED' | 'UNSOLVED'>('ALL');
  const currentUserEmail = user?.email;

  // 커스텀 훅을 사용하여 데이터 페칭 및 상태 관리
  const { problems, totalPages, loading } = useProblems(currentPage, PROBLEMS_PER_PAGE, debouncedSearchQuery, filter);

  const { judges } = useJudges(true);

  // 해결한 문제 ID를 Set으로 메모이제이션 하여 성능 최적화
  const solvedProblemIds = useMemo(() => {
    const ids = new Set<string>();
    if (!judges) return ids;
    for (const judge of judges) {
      if (judge.result === 'CORRECT') {
        ids.add(judge.problemId);
      }
    }
    return ids;
  }, [judges]);

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // ✅ 검색어나 필터가 변경되면 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchQuery, filter]);

  const isProblemSolved = (problemId: string | number) => {
    return solvedProblemIds.has(String(problemId));
  };

  // hook에서 이미 검색 및 필터링이 처리된 데이터를 반환함
  const filteredProblems = problems;

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#1A1A1A] font-Pretendard overflow-x-hidden">
      <Header />

      <main className="flex-grow w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="flex flex-col gap-8">
          {/* Page Header & Search Bar combined */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-grow">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="shrink-0"
              >
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">문제 목록</h1>
              </motion.div>
              
              {/* Compact Search Bar next to title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative flex-grow max-w-md"
              >
                <svg
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="문제 검색..."
                  className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-base text-white placeholder-gray-600 focus:outline-none focus:border-[#CAFE33]/30 transition-all font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
            </div>

            {currentUserEmail && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/5 w-fit shrink-0"
              >
                {[
                  { key: 'ALL', label: '전체' },
                  { key: 'SOLVED', label: '해결' },
                  { key: 'UNSOLVED', label: '미해결' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as 'ALL' | 'SOLVED' | 'UNSOLVED')}
                    className={`px-6 py-3 text-xs font-black rounded-xl transition-all duration-300 ${
                      filter === key 
                        ? 'bg-white/10 text-[#CAFE33] shadow-lg' 
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Problem List */}
          <div className="flex flex-col gap-3 mt-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <div className="w-12 h-12 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-bold">문제를 불러오고 있어요...</p>
              </div>
            ) : filteredProblems.length > 0 ? (
              filteredProblems.map((problem, index) => (
                <motion.div
                  key={problem.problemId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  onClick={() => {
                    if (!currentUserEmail) {
                      showAlert('error', '로그인이 필요합니다.');
                      return;
                    }
                    window.open(`/problems/${problem.problemId}`, '_blank');
                  }}
                  className="group flex flex-col md:flex-row md:items-center justify-between px-6 py-4 rounded-[1.5rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 cursor-pointer gap-4 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-6 flex-grow">
                    <div className="flex-shrink-0 min-w-[4rem] px-3 h-12 rounded-xl bg-white/5 flex items-center justify-center text-lg font-black text-gray-500 font-JetBrain group-hover:bg-[#CAFE33] group-hover:text-black transition-all duration-300">
                      {problem.problemId}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-black group-hover:text-[#CAFE33] transition-colors line-clamp-1">{problem.title || '제목 없음'}</h2>
                        {isProblemSolved(problem.problemId) && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-[#CAFE33]/10 p-1.5 rounded-full shrink-0 border border-[#CAFE33]/20"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#CAFE33" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {problem.category?.map((cat, i) => (
                          <span key={i} className="text-[10px] font-black text-gray-600 px-2 py-0.5 bg-white/5 rounded uppercase tracking-wider">
                            #{cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-8 shrink-0 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                    <div className="flex flex-col items-start md:items-end">
                      <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-0.5">Success Rate</span>
                      <span className="text-lg font-black text-gray-500 font-JetBrain group-hover:text-white transition-colors">
                        {problem.solved?.rate != null ? `${problem.solved.rate.toFixed(1)}%` : '-'}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#CAFE33] group-hover:text-black transition-all duration-300">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => handlePageChange(page)}
              className="mt-12"
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProblemsPage;
