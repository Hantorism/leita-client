import { judgeApi } from '@apis';
import { Footer, Header } from '@components';
import { useAlert } from '@contexts';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 15;

interface JudgeData {
  problemId: number;
  problemTitle?: string;
  user: {
    name: string;
    email: string;
    profileImage?: string;
  };
  result: 'CORRECT' | 'WRONG' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIME_OUT' | 'MEMORY_OUT' | 'UNKNOWN';
  used: {
    memory: number;
    time: number;
    language: string;
  };
  sizeOfCode: number;
  type: string;
}

const getResultBadge = (result: string) => {
  switch (result) {
    case 'CORRECT':
      return <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1.5 rounded-md text-[11px] font-bold inline-block min-w-[70px] text-center">정답</span>;
    case 'WRONG':
      return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1.5 rounded-md text-[11px] font-bold inline-block min-w-[70px] text-center">오답</span>;
    case 'COMPILE_ERROR':
      return <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1.5 rounded-md text-[11px] font-bold inline-block min-w-[70px] text-center">컴파일 에러</span>;
    case 'RUNTIME_ERROR':
      return <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1.5 rounded-md text-[11px] font-bold inline-block min-w-[70px] text-center">런타임 에러</span>;
    case 'TIME_OUT':
      return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1.5 rounded-md text-[11px] font-bold inline-block min-w-[70px] text-center">시간 초과</span>;
    case 'MEMORY_OUT':
      return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1.5 rounded-md text-[11px] font-bold inline-block min-w-[70px] text-center">메모리 초과</span>;
    default:
      return <span className="bg-gray-500/10 text-gray-400 border border-gray-500/20 px-2.5 py-1.5 rounded-md text-[11px] font-bold inline-block min-w-[70px] text-center">{result}</span>;
  }
};

const formatMemory = (kb: number) => {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(2)} MB`;
  }
  return `${kb} KB`;
};

const JudgePage = () => {
  const [allJudges, setAllJudges] = useState<JudgeData[]>([]);
  const [judges, setJudges] = useState<JudgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    async function fetchJudges() {
      try {
        const result = await judgeApi.getJudges();
        const data = result.data ?? result ?? [];
        setAllJudges(data);
        setJudges(data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          showAlert('error', '로그인이 필요합니다.');
          navigate('/');
        } else {
          setError('데이터를 가져오는 중 오류가 발생했습니다.');
        }
        setAllJudges([]);
        setJudges([]);
      } finally {
        setLoading(false);
      }
    }

    fetchJudges();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    let filtered = [...allJudges];

    // 필터링
    if (filter === 'CORRECT') {
      filtered = filtered.filter((judge) => judge.result === 'CORRECT');
    } else if (filter === 'WRONG') {
      filtered = filtered.filter((judge) =>
        ['WRONG', 'COMPILE_ERROR', 'RUNTIME_ERROR', 'TIME_OUT', 'MEMORY_OUT', 'UNKNOWN'].includes(judge.result),
      );
    }

    // 검색
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (judge) =>
          judge.problemTitle?.toLowerCase().includes(lowerQuery) || judge.problemId.toString().includes(lowerQuery),
      );
    }

    setJudges(filtered);
  }, [filter, searchQuery, allJudges]);

  if (loading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-gray-500 font-Pretendard">데이터를 불러오는 중입니다...</div>;
  if (error) return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-red-500 font-Pretendard">{error}</div>;

  const totalPages = Math.ceil(judges.length / ITEMS_PER_PAGE);
  const paginatedJudges = judges.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // 페이지네이션 유틸
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`min-w-[32px] h-[32px] rounded-lg text-sm font-medium transition-colors ${
            currentPage === i
              ? 'bg-[#CAFE33] text-black'
              : 'bg-transparent text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-Pretendard flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-10 flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-3xl font-bold text-[#CAFE33]">내 채점 현황</h1>
          <p className="text-gray-400 text-sm">제출한 코드의 채점 결과를 확인하세요.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex bg-[#1f1f1f] border border-gray-800 rounded-lg p-1 w-full md:w-auto">
            {[
              { key: 'ALL', label: '전체' },
              { key: 'CORRECT', label: '맞았습니다' },
              { key: 'WRONG', label: '틀렸습니다' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
                  <th className="p-4 font-semibold w-24 text-center">문제 ID</th>
                  <th className="p-4 font-semibold text-left">문제 제목</th>
                  <th className="p-4 font-semibold w-32 text-center">결과</th>
                  <th className="p-4 font-semibold text-center">언어</th>
                  <th className="p-4 font-semibold text-right">메모리</th>
                  <th className="p-4 font-semibold text-right">시간</th>
                  <th className="p-4 font-semibold text-right">코드 길이</th>
                  <th className="p-4 font-semibold text-center w-28">코드 보기</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJudges.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-10 text-center text-gray-500"
                    >
                      해당 조건에 맞는 채점 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  paginatedJudges.map((judge, index) => (
                    <tr
                      key={`${judge.problemId}-${index}`}
                      onClick={() => window.open(`/problems/${judge.problemId}`, '_blank')}
                      className="border-b border-gray-800/50 hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="p-4 text-center">
                        <span className="text-gray-300 font-medium group-hover:text-[#CAFE33] transition-colors inline-block w-full">
                          {judge.problemId}
                        </span>
                      </td>
                      <td className="p-4 text-left font-medium text-gray-200">
                        {judge.problemTitle || '제목 없음'}
                      </td>
                      <td className="p-4 text-center">{getResultBadge(judge.result)}</td>
                      <td className="p-4 text-center">
                        <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md text-xs border border-gray-700/50">
                          {judge.used.language}
                        </span>
                      </td>
                      <td className="p-4 text-right text-gray-300 text-sm">{formatMemory(judge.used.memory)}</td>
                      <td className="p-4 text-right text-gray-300 text-sm">{judge.used.time} ms</td>
                      <td className="p-4 text-right text-gray-400 text-sm">{judge.sizeOfCode} B</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // `/source/${judge.problemId}` 등으로 보낼 수 있으나 우선 /source로 라우팅
                            navigate('/source');
                          }}
                          className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 hover:text-white px-3 py-1.5 rounded-md text-xs transition-colors border border-gray-700 w-full"
                        >
                          소스 확인
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 0 && (
          <div className="flex justify-center items-center gap-2 mb-10">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-[#2a2a2a] text-gray-300 text-sm font-medium hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              이전
            </button>
            <div className="flex gap-1 mx-2">
              {renderPagination()}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
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

export default JudgePage;
