import { Button, Footer, Header } from '@components';
import { useAlert } from '@contexts';
import { useJudges } from '@hooks';
import { formatCodeSize, formatMemory, formatTime } from '@utils';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 15;

const getResultBadge = (result: string) => {
  switch (result) {
    case 'CORRECT':
      return (
        <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1.5 rounded-md text-sm font-bold inline-block min-w-[70px] text-center">
          정답
        </span>
      );
    case 'WRONG':
      return (
        <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1.5 rounded-md text-sm font-bold inline-block min-w-[70px] text-center">
          오답
        </span>
      );
    case 'COMPILE_ERROR':
      return (
        <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1.5 rounded-md text-sm font-bold inline-block min-w-[70px] text-center">
          컴파일 에러
        </span>
      );
    case 'RUNTIME_ERROR':
      return (
        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1.5 rounded-md text-sm font-bold inline-block min-w-[70px] text-center">
          런타임 에러
        </span>
      );
    case 'TIME_OUT':
      return (
        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1.5 rounded-md text-sm font-bold inline-block min-w-[70px] text-center">
          시간 초과
        </span>
      );
    case 'MEMORY_OUT':
      return (
        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1.5 rounded-md text-sm font-bold inline-block min-w-[70px] text-center">
          메모리 초과
        </span>
      );
    default:
      return (
        <span className="bg-gray-500/10 text-gray-400 border border-gray-500/20 px-2.5 py-1.5 rounded-md text-sm font-bold inline-block min-w-[70px] text-center">
          {result}
        </span>
      );
  }
};

const JudgePage = () => {
  const { judges: allJudges, loading, error } = useJudges();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // 필터링 및 검색 로직 (Memoization)
  const filteredJudges = useMemo(() => {
    let filtered = [...allJudges];

    if (filter === 'CORRECT') {
      filtered = filtered.filter((judge) => judge.result === 'CORRECT');
    } else if (filter === 'WRONG') {
      filtered = filtered.filter((judge) =>
        ['WRONG', 'COMPILE_ERROR', 'RUNTIME_ERROR', 'TIME_OUT', 'MEMORY_OUT', 'UNKNOWN'].includes(judge.result),
      );
    }

    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (judge) =>
          judge.problemTitle?.toLowerCase().includes(lowerQuery) || judge.problemId.toString().includes(lowerQuery),
      );
    }

    return filtered;
  }, [filter, searchQuery, allJudges]);

  const totalPages = Math.ceil(filteredJudges.length / ITEMS_PER_PAGE);

  const paginatedJudges = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJudges.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredJudges, currentPage]);

  // 필터나 검색어가 바뀌면 1페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500 font-bold">{error}</div>;

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
                <h1 className="text-4xl sm:text-5xl font-black mb-2 tracking-tighter">채점 현황</h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex flex-wrap gap-1.5 bg-white/5 p-1.5 rounded-[1.5rem] border border-white/5 w-fit"
              >
                {[
                  { key: 'ALL', label: '전체' },
                  { key: 'CORRECT', label: '성공' },
                  { key: 'WRONG', label: '실패' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-6 py-2.5 text-xs sm:text-sm font-black rounded-2xl transition-all duration-300 ${
                      filter === key ? 'bg-white/10 text-[#CAFE33] shadow-lg' : 'text-gray-500 hover:text-white'
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="검색할 문제 번호나 제목을 입력하세요"
                className="w-full pl-16 pr-8 py-6 sm:py-7 rounded-[2.5rem] bg-white/5 border border-white/5 text-lg sm:text-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#CAFE33]/30 focus:ring-[12px] focus:ring-[#CAFE33]/5 transition-all font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
          </div>

          {/* Judge List */}
          <div className="grid grid-cols-1 gap-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <div className="w-12 h-12 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-bold">채점 현황을 불러오고 있어요...</p>
              </div>
            ) : paginatedJudges.length > 0 ? (
              paginatedJudges.map((judge, index) => (
                <motion.div
                  key={`${judge.problemId}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group flex flex-col md:flex-row md:items-center justify-between p-8 sm:p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-500 gap-8 active:scale-[0.99] shadow-2xl"
                >
                  <div className="flex items-center gap-8">
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-xl sm:text-2xl font-black text-gray-500 font-JetBrain group-hover:bg-white/10 group-hover:text-[#CAFE33] transition-all duration-500">
                      #{judge.problemId}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div
                        className={`text-2xl sm:text-4xl font-black tracking-tighter italic uppercase ${judge.result === 'CORRECT' ? 'text-[#CAFE33]' : 'text-red-500'}`}
                      >
                        {judge.result}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs sm:text-[11px] font-black text-gray-600 uppercase tracking-widest">
                          {judge.used.language}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-800"></span>
                        <span className="text-xs sm:text-[11px] font-bold text-gray-600 font-JetBrain">
                          {judge.sizeOfCode} Bytes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:flex items-center gap-6 sm:gap-12 border-t md:border-t-0 border-white/5 pt-8 md:pt-0">
                    <div className="flex flex-col items-start md:items-end">
                      <span className="text-xs sm:text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-2">
                        Memory
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-gray-400 font-JetBrain group-hover:text-white transition-colors">
                        {judge.used.memory.toLocaleString()}{' '}
                        <span className="text-xs font-normal text-gray-600">KB</span>
                      </span>
                    </div>
                    <div className="flex flex-col items-start md:items-end">
                      <span className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-2">Time</span>
                      <span className="text-xl sm:text-2xl font-black text-gray-400 font-JetBrain group-hover:text-white transition-colors">
                        {judge.used.time} <span className="text-xs font-normal text-gray-600">ms</span>
                      </span>
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
                <p className="text-gray-500 text-xl font-bold">결과가 아직 없어요.</p>
              </motion.div>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="w-full flex justify-center items-center gap-4 mt-12">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="ghost"
                className="px-8 py-4 text-gray-600 font-black hover:bg-white/10 hover:text-white disabled:opacity-30 rounded-2xl"
              >
                이전
              </Button>

              <div className="px-8 py-4 text-white font-black font-JetBrain bg-white/5 rounded-2xl border border-white/5">
                {currentPage} <span className="text-gray-700 font-normal mx-2">/</span> {totalPages}
              </div>

              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="ghost"
                className="px-8 py-4 text-gray-600 font-black hover:bg-white/10 hover:text-white disabled:opacity-30 rounded-2xl"
              >
                다음
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JudgePage;
