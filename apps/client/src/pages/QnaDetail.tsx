import { Button, Footer, Header } from '@components';
import { useAlert, useAuth } from '@contexts';
import { qnaApi } from '@leita/api';
import type { QnaResponse } from '@leita/types';
import { formatDateTime } from '@utils';
import { motion } from 'framer-motion';
import { useFetchItem } from '@hooks';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const QnaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { showAlert } = useAlert();
  const [isDeleting, setIsDeleting] = useState(false);

  const fetcher = useCallback(() => {
    if (!id) return Promise.resolve(null);
    return qnaApi.getQna(Number(id));
  }, [id]);

  const { item: qna, loading, error } = useFetchItem<QnaResponse | null>(fetcher, [id]);

  useEffect(() => {
    if (error) {
      showAlert('error', '문의 내용을 불러오는데 실패했습니다.');
    }
  }, [error, showAlert]);

  const handleDelete = async () => {
    if (!id || !qna) return;
    if (!window.confirm('정말 이 문의를 삭제하시겠습니까?')) return;

    try {
      setIsDeleting(true);
      await qnaApi.deleteQna(Number(id));
      showAlert('success', '문의가 성공적으로 삭제되었습니다.');
      navigate('/qna');
    } catch (err) {
      console.error('Failed to delete Q&A', err);
      showAlert('error', '문의 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // authLoading이 끝난 후에만 isAuthor를 판단해 타이밍 문제를 방지합니다.
  const isAuthor = !authLoading && user && qna && user.email === qna.authorEmail;

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#1A1A1A] font-Pretendard overflow-x-hidden">
      <Header />

      <main className="flex-grow w-full max-w-4xl mx-auto px-5 sm:px-6 py-10 sm:py-20">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/qna')}
              className="!px-3 !py-2 text-gray-400 hover:text-white flex items-center gap-1.5 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              목록으로
            </Button>

            {isAuthor && qna && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/qna/edit/${qna.id}`)}
                  className="!px-4 !py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold"
                >
                  수정
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="!px-4 !py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-bold border border-red-500/10"
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-bold">Q&A 상세 내용을 불러오고 있습니다...</p>
            </div>
          ) : qna ? (
            <div className="flex flex-col gap-8">
              {/* Question */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col gap-8"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#CAFE33]/5 blur-[80px] -mr-32 -mt-32 rounded-full pointer-events-none" />
                
                <div className="flex flex-col gap-4 border-b border-white/10 pb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-white/10 text-gray-400 text-xs font-black font-JetBrain">Q</span>
                    <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                      {qna.title}
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500 font-semibold">
                    <span className="text-[#CAFE33] font-bold">질문자: {qna.authorName}</span>
                    <span className="w-1 h-1 bg-white/10 rounded-full hidden sm:inline" />
                    <span>등록일: {formatDateTime(qna.createdAt)}</span>
                    {qna.updatedAt !== qna.createdAt && (
                      <>
                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                        <span>수정일: {formatDateTime(qna.updatedAt)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-gray-300 font-medium leading-relaxed min-h-[150px] relative z-10 text-base break-words whitespace-pre-wrap select-text">
                  {qna.content}
                </div>
              </motion.div>

              {/* Answer */}
              {qna.answer ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-[#CAFE33]/5 border border-[#CAFE33]/20 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col gap-6"
                >
                  <div className="flex flex-col gap-4 border-b border-[#CAFE33]/10 pb-6">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-[#CAFE33] text-black text-xs font-black font-JetBrain">A</span>
                      <h2 className="text-lg sm:text-xl font-black text-[#CAFE33]">관리자 답변</h2>
                    </div>
                    {qna.answeredAt && (
                      <div className="text-xs text-gray-500 font-semibold">
                        답변일: {formatDateTime(qna.answeredAt)}
                      </div>
                    )}
                  </div>

                  <div className="text-gray-300 font-medium leading-relaxed text-base break-words whitespace-pre-wrap select-text">
                    {qna.answer}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-12 text-center"
                >
                  <p className="text-gray-500 font-bold text-sm">아직 등록된 답변이 없습니다. 관리자가 답변을 준비 중입니다.</p>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center">
              <p className="text-gray-500 font-bold">Q&A 문의를 찾을 수 없습니다.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QnaDetail;
