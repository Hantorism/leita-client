import { Button, Footer, Header, Pagination } from '@components';
import { useAlert } from '@contexts';
import { useJudges } from '@hooks';
import { formatCodeSize, formatMemory, formatTime, formatDateTime } from '@utils';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ITEMS_PER_PAGE = 15;

const JudgePage = () => {
  const { judges: allJudges, loading, error } = useJudges(false);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // 이메일 마스킹 처리 (abc***@ajou.ac.kr)
  const maskEmail = (email?: string) => {
    if (!email) return '알 수 없음';
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) return `${localPart}***@${domain}`;
    return `${localPart.substring(0, 3)}***@${domain}`;
  };

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
          (judge.problemTitle && judge.problemTitle.toLowerCase().includes(lowerQuery)) ||
          (judge.problemId && judge.problemId.toLowerCase().includes(lowerQuery)),
      );
    }

    return filtered;
  }, [filter, searchQuery, allJudges]);

  const totalPages = Math.ceil(filteredJudges.length / ITEMS_PER_PAGE);

  const paginatedJudges = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return filteredJudges.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredJudges, currentPage]);

  // 필터나 검색어가 바뀌면 1페이지로 이동
  useEffect(() => {
    setCurrentPage(0);
  }, [filter, searchQuery]);

  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500 font-bold">{error}</div>;

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
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">채점 현황</h1>
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
                  placeholder="문제 번호나 제목 검색..."
                  className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-base text-white placeholder-gray-600 focus:outline-none focus:border-[#CAFE33]/30 transition-all font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/5 w-fit shrink-0"
            >
              {[
                { key: 'ALL', label: '전체' },
                { key: 'CORRECT', label: '성공' },
                { key: 'WRONG', label: '실패' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
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
          </div>

          {/* Judge List */}
          <div className="flex flex-col gap-3 mt-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <div className="w-12 h-12 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-bold">채점 현황을 불러오고 있어요...</p>
              </div>
            ) : paginatedJudges.length > 0 ? (
              paginatedJudges.map((judge, index) => (
                <motion.div
                  key={`${judge.problemId}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="group flex flex-col md:flex-row md:items-center justify-between px-6 py-4 rounded-[1.5rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 gap-4 active:scale-[0.99] cursor-pointer"
                  onClick={() => navigate(`/problems/${judge.problemId}`)}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 min-w-[4rem] px-3 h-12 rounded-xl bg-white/5 flex items-center justify-center text-lg font-black text-gray-500 font-JetBrain group-hover:bg-white/10 group-hover:text-[#CAFE33] transition-all duration-300">
                      #{judge.problemId}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#CAFE33]">{maskEmail(judge.user?.email)}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-gray-800"></span>
                        <span className={`text-xs font-bold ${judge.result === 'CORRECT' ? 'text-green-400' : 'text-red-400'}`}>
                          {judge.result}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{judge.used.language}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-gray-800"></span>
                        <span className="text-[10px] font-bold text-gray-700">{formatDateTime(judge.createdAt).split(' (')[0]}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:flex items-center gap-8 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                    <div className="flex flex-col items-start md:items-end">
                      <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-0.5">Memory</span>
                      <span className="text-base font-black text-gray-500 font-JetBrain group-hover:text-white transition-colors">
                        {judge.used.memory.toLocaleString()} <span className="text-[10px] font-normal text-gray-700">KB</span>
                      </span>
                    </div>
                    <div className="flex flex-col items-start md:items-end">
                      <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-0.5">Time</span>
                      <span className="text-base font-black text-gray-500 font-JetBrain group-hover:text-white transition-colors">
                        {judge.used.time} <span className="text-[10px] font-normal text-gray-700">ms</span>
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              className="mt-12"
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JudgePage;
