import { Footer, Header, CommitModal } from '@components';
import { useAlert, useAuth } from '@contexts';
import { judgeApi, authApi } from '@leita/api';
import { JudgeResult, JudgeResultMessages } from '@leita/types';
import type { JudgeData } from '@leita/types';
import { DecodeBase64, Logger, formatMemory, formatTime } from '@utils';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';

const JudgeDetailPage = () => {
  const { judgeId } = useParams<{ judgeId: string }>();
  const [judge, setJudge] = useState<JudgeData | null>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [serverGithubLinked, setServerGithubLinked] = useState<boolean | null>(null);
  const { showAlert } = useAlert();
  const { user, fetchUserInfo } = useAuth();
  const navigate = useNavigate();

  // 서버에 직접 유저 정보를 물어봐서 깃허브 연동 여부 확인
  useEffect(() => {
    const checkGithubStatus = async () => {
      try {
        const res = await authApi.getAuthInfo();
        setServerGithubLinked(res.isGithubLinked || !!res.githubUserName);
        // 컨텍스트도 동기화 (다른 페이지를 위해)
        fetchUserInfo();
      } catch (err) {
        Logger.error('Failed to fetch github status from server', err);
        setServerGithubLinked(false);
      }
    };
    checkGithubStatus();
  }, [fetchUserInfo]);

  useEffect(() => {
    let interval: any;

    const fetchDetail = async () => {
      if (!judgeId) return;
      try {
        const res = await judgeApi.getJudgeDetail(Number(judgeId));
        // res is JudgeDetailResponse { id, result: { name, message }, ... }
        const data = res as any;
        
        // 1. Result normalization: 
        // If it's an object {name, message}, extract them.
        // If it's a string, use it as name.
        let resultName = '';
        let resultMessage = '';

        if (data.result) {
          if (typeof data.result === 'object') {
            resultName = data.result.name;
            resultMessage = data.result.message;
          } else {
            resultName = String(data.result);
          }
        }

        // Update state with normalized values
        setJudge({
          ...data,
          result: resultName as JudgeResult,
          resultMessage: resultMessage // Add this to local display
        });

        if (data.codeUrl && !code) {
          const codeRes = await fetch(data.codeUrl);
          const encodedCode = await codeRes.text();
          setCode(DecodeBase64(encodedCode));
        }

        // 결과가 PENDING이 아니거나 결과가 명확히 나오면 중단
        if (resultName && resultName !== 'PENDING') {
           clearInterval(interval);
           setLoading(false);
        }
      } catch (err) {
        Logger.error('Failed to fetch judge detail:', err);
        showAlert('error', '제출 상세 정보를 불러오는 데 실패했습니다.');
        navigate('/judge');
        if (interval) clearInterval(interval);
        setLoading(false);
      }
    };

    if (judgeId) {
      setLoading(true);
      fetchDetail();
      interval = setInterval(fetchDetail, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // Removed 'code' to prevent infinite loop
  }, [judgeId, showAlert, navigate, user]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#1A1A1A]">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!judge) return null;

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#1A1A1A] font-Pretendard">
      <Header />
      <main className="flex-grow w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-[#CAFE33] hover:border-[#CAFE33]/30 hover:bg-[#CAFE33]/5 transition-all active:scale-90 group"
                aria-label="Go Back"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:-translate-x-0.5 transition-transform"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <h1 className="text-3xl font-black">제출 상세 정보</h1>
            </div>
            <div className="flex gap-4 items-center">
               {/* Use the normalized judge.result from state */}
               {judge.result === JudgeResult.CORRECT && serverGithubLinked === true && (
                 <button
                   onClick={() => setIsCommitModalOpen(true)}
                   className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-[#CAFE33]/50 hover:bg-[#CAFE33]/5 text-gray-300 hover:text-[#CAFE33] transition-all rounded-xl group"
                   type="button"
                 >
                   <Icon icon="mdi:github" className="w-5 h-5" />
                   <span className="text-sm font-bold">GitHub에 커밋</span>
                 </button>
               )}
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Result</span>
                  <span className={`text-xl font-black ${judge.result === JudgeResult.CORRECT ? 'text-[#CAFE33]' : 'text-red-500'}`}>
                    {(judge as any).resultMessage || JudgeResultMessages[judge.result] || String(judge.result)}
                  </span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-white/5 border border-white/5">
             <div>
                <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Problem</span>
                <span className="text-lg font-bold">#{judge.problemId}</span>
             </div>
             <div>
                <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Language</span>
                <span className="text-lg font-bold">{judge.used.language}</span>
             </div>
             <div>
                <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Memory</span>
                <span className="text-lg font-bold">{formatMemory(judge.used.memory)}</span>
             </div>
             <div>
                <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Time</span>
                <span className="text-lg font-bold">{formatTime(judge.used.time)}</span>
             </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-black mt-4">제출 코드</h2>
            <div className="rounded-2xl overflow-hidden border border-white/10 h-[500px]">
              <MonacoEditor
                height="100%"
                language={judge.used.language.toLowerCase()}
                theme="vs-dark"
                value={code}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  fontFamily: 'JetBrainMono',
                }}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {judge && (
        <CommitModal
          isOpen={isCommitModalOpen}
          onClose={() => setIsCommitModalOpen(false)}
          judge={judge}
        />
      )}
    </div>
  );
};

export default JudgeDetailPage;
