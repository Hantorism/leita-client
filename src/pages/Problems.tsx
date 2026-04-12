import { Solved } from '@assets/images';
import { Footer, Header, Pagination } from '@components';
import { useAlert } from '@contexts';
import { useDebounce, useJudges, useProblems } from '@hooks';
import { getCurrentUserEmail } from '@utils';
import { useCallback, useMemo, useState } from 'react';

const PROBLEMS_PER_PAGE = 10;

const ProblemsPage = () => {
  const { showAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<'ALL' | 'SOLVED' | 'UNSOLVED'>('ALL');

  // 커스텀 훅으로 데이터 페칭 로직 캡슐화
  const { problems, totalPages, loading } = useProblems(currentPage, PROBLEMS_PER_PAGE, debouncedSearchQuery, filter);
  const { judges } = useJudges();

  // 해결한 문제 ID를 Set으로 메모이제이션 (O(1) 조회)
  const solvedProblemIds = useMemo(() => {
    const ids = new Set<number>();
    judges.forEach((judge) => {
      if (judge.result === 'CORRECT') {
        ids.add(judge.problemId);
      }
    });
    return ids;
  }, [judges]);

  const isProblemSolved = useCallback(
    (problemId: number) => solvedProblemIds.has(problemId),
    [solvedProblemIds],
  );

  const handleProblemClick = useCallback(
    (problemId: number) => {
      const email = getCurrentUserEmail();
      if (!email) {
        showAlert('error', '로그인이 필요합니다.');
        return;
      }
      window.open(`/problems/${problemId}`, '_blank');
    },
    [showAlert],
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] text-white font-Pretendard flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-10 flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-3xl font-bold text-[var(--color-brand)]">문제 목록</h1>
          <p className="text-gray-400 text-sm">알고리즘 문제를 풀고 코딩 실력을 향상시키세요.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex bg-[var(--color-bg-card)] border border-gray-800 rounded-lg p-1 w-full md:w-auto">
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
                  filter === key ? 'bg-[var(--color-brand)] text-black shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="문제 번호 또는 제목 검색"
              className="w-full bg-[var(--color-bg-card)] border border-gray-800 rounded-lg py-2.5 pl-4 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-brand)] transition-colors"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              🔍
            </span>
          </div>
        </div>

        <div className="bg-[var(--color-bg-card)] border border-gray-800 rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-black/40 text-gray-400 text-sm border-b border-gray-800">
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
                ) : problems.length > 0 ? (
                  problems.map((problem) => (
                    <tr
                      key={problem.problemId}
                      onClick={() => handleProblemClick(problem.problemId)}
                      className="border-b border-gray-800/50 hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="p-4 text-center">
                        <span className="text-gray-300 font-medium group-hover:text-[var(--color-brand)] transition-colors inline-block w-full">
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
                                className="px-2 py-0.5 text-sm text-gray-300 font-medium bg-gray-800/60 border border-gray-700/50 rounded-md"
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mb-10"
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProblemsPage;
