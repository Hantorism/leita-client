import { judgeApi, problemApi } from '@apis';
import { Solved } from '@assets/images';
import { Footer, Header } from '@components';
import { useAlert } from '@contexts';
import { useDebounce } from '@hooks';
import { getCurrentUserEmail, Logger } from '@utils';
import { useEffect, useState } from 'react';

interface Problem {
  problemId: number;
  title: string;
  category: string[];
  solved: {
    rate: number;
  };
}

interface JudgedProblem {
  problemId: number;
  result: string;
}

const ProblemsPage = () => {
  const { showAlert } = useAlert();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [judgedProblems, setJudgedProblems] = useState<JudgedProblem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const problemsPerPage = 10;
  const [filter, setFilter] = useState<'ALL' | 'SOLVED' | 'UNSOLVED'>('ALL');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const filterValue = filter !== 'ALL' ? filter : undefined;

        const res = await problemApi.getProblems(currentPage, problemsPerPage, debouncedSearchQuery, filterValue as any);

        const content = res.data?.content ?? res.content ?? [];
        const total = res.data?.totalPages ?? res.totalPages ?? 1;

        if (!Array.isArray(content)) {
          throw new Error('Invalid response format');
        }

        setProblems(content);
        setTotalPages(total);
      } catch (error) {
        Logger.error('Failed to fetch problems:', error);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchJudgedProblems = async () => {
      try {
        const res = await judgeApi.getJudges();
        const judgedData = res.data ?? res ?? [];
        setJudgedProblems(judgedData.filter((judge: JudgedProblem) => judge.result === 'CORRECT'));
      } catch (error) {
        Logger.error('Failed to fetch judged problems:', error);
      }
    };

    fetchProblems();
    fetchJudgedProblems();
  }, [currentPage, debouncedSearchQuery, filter]);

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

  // 페이지네이션 렌더 모듈 (API가 0-indexed이므로 i 전달, 표시는 i+1)
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        // currentPage is 0-indexed, display value is i + 1
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`min-w-[32px] h-[32px] rounded-lg text-sm font-medium transition-colors ${
            currentPage === i
              ? 'bg-[#CAFE33] text-black'
              : 'bg-transparent text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          {i + 1}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-Pretendard flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-10 flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-3xl font-bold text-[#CAFE33]">문제 목록</h1>
          <p className="text-gray-400 text-sm">알고리즘 문제를 풀고 코딩 실력을 향상시키세요.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex bg-[#1f1f1f] border border-gray-800 rounded-lg p-1 w-full md:w-auto">
            {[
              { key: 'ALL', label: '전체' },
              { key: 'SOLVED', label: '해결함' },
              { key: 'UNSOLVED', label: '미해결' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setFilter(key as 'ALL' | 'SOLVED' | 'UNSOLVED');
                  setCurrentPage(0);
                }}
                className={`flex-1 md:flex-none px-5 py-2 text-sm font-semibold rounded-md transition-all ${
                  filter === key ? 'bg-[#CAFE33] text-black shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="문제 번호 또는 제목 검색..."
              className="w-full bg-[#1f1f1f] border border-gray-800 rounded-lg py-2.5 pl-4 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#CAFE33] transition-colors"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
              🔍
            </span>
          </div>
        </div>

        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-black/40 text-gray-400 text-xs border-b border-gray-800">
                  <th className="p-4 font-semibold w-24 text-center">ID</th>
                  <th className="p-4 font-semibold text-left">문제 제목</th>
                  <th className="p-4 font-semibold w-32 text-center">정답률</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-10 text-center text-gray-500">
                      데이터를 불러오는 중입니다...
                    </td>
                  </tr>
                ) : filteredProblems.length > 0 ? (
                  filteredProblems.map((problem) => (
                    <tr
                      key={problem.problemId}
                      onClick={() => {
                        const email = getCurrentUserEmail();
                        if (!email) {
                          showAlert('error', '로그인이 필요합니다.');
                          return;
                        }
                        const problemUrl = `/problems/${problem.problemId}`;
                        window.open(problemUrl, '_blank');
                      }}
                      className="border-b border-gray-800/50 hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="p-4 text-center">
                        <span className="text-gray-300 font-medium group-hover:text-[#CAFE33] transition-colors inline-block w-full">
                          {problem.problemId}
                        </span>
                      </td>
                      <td className="p-4 text-left">
                        <div className="font-medium text-gray-200 flex flex-col md:flex-row items-start md:items-center gap-2">
                          <div className="flex items-center">
                            {problem.title || '제목 없음'}
                            {isProblemSolved(problem.problemId) && (
                              <img src={Solved} alt="solved" className="ml-2 w-4 h-4 inline-block opacity-90" />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 md:ml-2">
                            {problem.category?.map((cat, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 text-[10px] text-gray-300 font-medium bg-gray-800/60 border border-gray-700/50 rounded-md"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center text-gray-300">
                        {problem.solved?.rate != null ? (
                          <span className={`${problem.solved.rate >= 50 ? 'text-green-400' : 'text-orange-400'} font-medium`}>
                            {problem.solved.rate.toFixed(2)}%
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-10 text-center text-gray-500">
                      해당 조건에 맞는 문제가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 0 && (
          <div className="flex justify-center items-center gap-2 mb-10">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 rounded-lg bg-[#2a2a2a] text-gray-300 text-sm font-medium hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              이전
            </button>
            <div className="flex gap-1 mx-2">
              {renderPagination()}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 rounded-lg bg-[#2a2a2a] text-gray-300 text-sm font-medium hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              다음
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProblemsPage;
