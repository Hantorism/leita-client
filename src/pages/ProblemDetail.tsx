import { problemApi } from '@apis';
import { Logo } from '@assets/images';
import { CodeEditor, ProblemDescriptionEditor } from '@components';
import { DecodeBase64, Logger } from '@utils';
import { type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

interface TestCase {
  id?: number;
  input: string;
  output: string;
}

interface ProblemDetailType {
  problemId: number;
  title: string;
  category: string[];
  solved: {
    rate: number;
    totalCount: number;
  };
  description: {
    problem: string;
    input: string;
    output: string;
  };
  testCases: TestCase[];
  limit: {
    memory: number;
    time: number;
  };
  source: string;
  authorName: string;
}

const ProblemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<ProblemDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [leftWidth, setLeftWidth] = useState<number>(600);
  const isDragging = useRef<boolean>(false);
  const [code, setCode] = useState<string>('');
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'code'>('description');

  const decodeText = (text: string): string => {
    try {
      if (!text) return '';
      return DecodeBase64(text);
    } catch (error) {
      return text;
    }
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await problemApi.getProblem(Number(id));
        const data = res as unknown as ProblemDetailType;

        if (!data) {
          throw new Error('Invalid response format');
        }

        setProblem(data);
      } catch (error) {
        Logger.error('Failed to fetch problem:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  useEffect(() => {
    if (problem) {
      document.title = `${problem.title} - Leita`;
    }
  }, [problem]);

  const startResizing = (e: ReactMouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';

    const overlay = document.createElement('div');
    overlay.id = 'resize-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'ew-resize';
    document.body.appendChild(overlay);

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleResize = (e: MouseEvent) => {
    if (isDragging.current) {
      const newWidth = e.clientX;
      setLeftWidth(Math.max(300, Math.min(newWidth, window.innerWidth * 0.7)));
    }
  };

  const stopResizing = () => {
    isDragging.current = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    const overlay = document.getElementById('resize-overlay');
    if (overlay) {
      document.body.removeChild(overlay);
    }

    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResizing);
  };

  const handleCopy = (input: string, id: number | string) => {
    navigator.clipboard.writeText(input).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 font-black">
        👾 문제를 불러오는 중...
      </div>
    );
  if (!problem)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 font-black">
        👽 문제를 찾을 수 없습니다.
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-[#1A1A1A] text-white font-Pretendard overflow-hidden">
      {/* Focused Mode Header */}
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-white/10 bg-[#1A1A1A] z-50">
        <div className="flex items-center gap-6">
          <Link
            to="/problems"
            className="flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </div>
            <img
              src={Logo}
              alt="Logo"
              className="h-5 opacity-80"
            />
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-JetBrain text-sm font-bold">#{problem.problemId}</span>
            <h1 className="text-sm sm:text-base font-black truncate max-w-[200px] sm:max-w-md">{problem.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-[11px] font-black text-gray-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CAFE33]" />
              Time: {problem.limit.time}ms
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CAFE33]" />
              Memory: {problem.limit.memory}KB
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden flex border-b border-white/5 bg-[#1A1A1A] flex-shrink-0">
        <button
          onClick={() => setActiveTab('description')}
          className={`flex-1 py-4 text-sm font-black transition-all ${activeTab === 'description' ? 'text-[#CAFE33] border-b-2 border-[#CAFE33]' : 'text-gray-500'}`}
        >
          문제 설명
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 py-4 text-sm font-black transition-all ${activeTab === 'code' ? 'text-[#CAFE33] border-b-2 border-[#CAFE33]' : 'text-gray-500'}`}
        >
          코드 에디터
        </button>
      </div>

      <main className="flex-grow flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Column (Description) */}
        <div
          className={`scrollbar-hide bg-[#1A1A1A] lg:bg-[#2A2A2A]/30 p-6 lg:p-10 overflow-y-auto w-full lg:max-w-[70vw] ${activeTab === 'description' ? 'block' : 'hidden lg:block'}`}
          style={{ width: window.innerWidth >= 1024 ? `${leftWidth}px` : '100%' }}
        >
          <div className="max-w-4xl mx-auto lg:mx-0">
            <div className="flex flex-wrap gap-2 mb-8">
              {problem.category?.map((cat, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 text-xs font-black text-gray-400 bg-white/5 rounded-xl uppercase tracking-wider"
                >
                  {cat}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-12 p-8 rounded-[2rem] bg-white/5 border border-white/5">
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest mb-2">정답률</span>
                <span className="text-2xl font-black font-JetBrain">{problem.solved?.rate?.toFixed(1)}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest mb-2">제출 수</span>
                <span className="text-2xl font-black font-JetBrain">{problem.solved?.totalCount.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-16">
              <section>
                <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#CAFE33]" />
                  문제 설명
                </h2>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed font-medium">
                  <ProblemDescriptionEditor
                    content={problem.description.problem}
                    readonly
                  />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#CAFE33]" />
                  입력
                </h2>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed font-medium">
                  <ProblemDescriptionEditor
                    content={problem.description.input}
                    readonly
                  />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#CAFE33]" />
                  출력
                </h2>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed font-medium">
                  <ProblemDescriptionEditor
                    content={problem.description.output}
                    readonly
                  />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-black mb-8 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#CAFE33]" />
                  예제 테스트 케이스
                </h2>
                <div className="space-y-8">
                  {problem.testCases.map((testCase, index) => (
                    <div
                      key={testCase.id || index}
                      className="p-8 rounded-[2rem] bg-white/5 border border-white/5 space-y-6"
                    >
                      {testCase.input.trim() !== '' && (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-black text-gray-600 uppercase tracking-widest">
                              입력 {index + 1}
                            </span>
                            <button
                              onClick={() => handleCopy(decodeText(testCase.input), testCase.id || index)}
                              className="text-xs font-bold text-[#CAFE33] hover:underline"
                            >
                              {copiedId === (testCase.id || index) ? '복사됨!' : '복사하기'}
                            </button>
                          </div>
                          <pre className="font-JetBrain bg-black/40 p-6 rounded-2xl text-base text-gray-300 overflow-x-auto border border-white/5">
                            {decodeText(testCase.input)}
                          </pre>
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-black text-gray-600 uppercase tracking-widest block mb-3">
                          출력 {index + 1}
                        </span>
                        <pre className="font-JetBrain bg-black/40 p-6 rounded-2xl text-base text-gray-300 overflow-x-auto border border-white/5">
                          {decodeText(testCase.output)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-8 rounded-[2.5rem] bg-[#CAFE33]/5 border border-[#CAFE33]/10">
                <h2 className="text-sm font-black text-[#CAFE33] mb-6 uppercase tracking-[0.2em]">제한 사항</h2>
                <div className="grid grid-cols-2 gap-10 text-base">
                  <div>
                    <span className="text-gray-500 block mb-2 font-bold">메모리 제한</span>
                    <span className="font-black font-JetBrain text-xl">{problem?.limit?.memory ?? '-'} KB</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-2 font-bold">시간 제한</span>
                    <span className="font-black font-JetBrain text-xl">{problem?.limit?.time ?? '-'} MS</span>
                  </div>
                </div>
              </section>

              <div className="pt-10 pb-20 text-xs font-bold text-gray-600 flex flex-col gap-2">
                <p>출처: {problem.source}</p>
                <p>작성자: {problem.authorName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resize Handle (Desktop only) */}
        <div
          className="hidden lg:flex w-2 bg-white/5 hover:bg-[#CAFE33]/30 cursor-ew-resize items-center justify-center transition-colors"
          onMouseDown={startResizing}
        >
          <div className="w-0.5 h-12 bg-white/20 rounded-full" />
        </div>

        {/* Right Column (Editor) */}
        <div
          className={`flex-1 flex flex-col h-full overflow-hidden ${activeTab === 'code' ? 'block' : 'hidden lg:block'}`}
        >
          <CodeEditor
            code={code}
            setCode={setCode}
            problemId={String(problem.problemId)}
            testCases={problem.testCases}
          />
        </div>
      </main>
    </div>
  );
};

export default ProblemDetailPage;
