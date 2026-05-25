import { Button, Footer, Header } from '@components';
import { useAlert, useAuth } from '@contexts';
import { qnaApi } from '@leita/api';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const QnaWrite = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      showAlert('error', '로그인이 필요한 서비스입니다.');
      navigate('/qna');
      return;
    }

    const fetchQnaForEdit = async () => {
      if (!isEditMode || !id) return;
      try {
        setLoading(true);
        const res = await qnaApi.getQna(Number(id));
        if (res.authorEmail !== user.email) {
          showAlert('error', '수정 권한이 없습니다.');
          navigate('/qna');
          return;
        }
        setTitle(res.title);
        setContent(res.content);
      } catch (err) {
        console.error('Failed to fetch Q&A for edit', err);
        showAlert('error', '문의 내용을 가져오는데 실패했습니다.');
        navigate('/qna');
      } finally {
        setLoading(false);
      }
    };

    fetchQnaForEdit();
  }, [id, isEditMode, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showAlert('error', '제목을 입력해 주세요.');
      return;
    }
    if (!content.trim()) {
      showAlert('error', '내용을 입력해 주세요.');
      return;
    }

    try {
      setSubmitting(true);
      if (isEditMode && id) {
        await qnaApi.updateQna(Number(id), { title, content });
        showAlert('success', '문의가 성공적으로 수정되었습니다.');
        navigate(`/qna/${id}`);
      } else {
        const res = await qnaApi.createQna({ title, content });
        showAlert('success', '문의가 성공적으로 등록되었습니다.');
        navigate(`/qna/${res.id}`);
      }
    } catch (err) {
      console.error('Failed to submit Q&A', err);
      showAlert('error', '문의 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#1A1A1A] font-Pretendard overflow-x-hidden">
      <Header />

      <main className="flex-grow w-full max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-20">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(isEditMode ? `/qna/${id}` : '/qna')}
              className="!px-3 !py-2 text-gray-400 hover:text-white flex items-center gap-1.5 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              취소
            </Button>
          </div>

          {loading ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-bold">데이터를 불러오고 있습니다...</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#CAFE33]/5 blur-[80px] -mr-32 -mt-32 rounded-full pointer-events-none" />

              <h2 className="text-2xl font-black text-white mb-8 border-b border-white/10 pb-4 relative z-10">
                {isEditMode ? 'Q&A 문의 수정' : 'Q&A 문의 작성'}
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="문의 제목을 입력해 주세요."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#CAFE33] transition-all font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">문의 내용</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="상세한 문의 내용을 작성해 주세요."
                    rows={8}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#CAFE33] transition-all font-semibold resize-y"
                  />
                </div>

                <div className="flex gap-4 mt-4 justify-end">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => navigate(isEditMode ? `/qna/${id}` : '/qna')}
                    className="rounded-xl font-bold bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    취소
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl font-bold shadow-lg shadow-[#CAFE33]/10"
                  >
                    {submitting ? '등록 중...' : isEditMode ? '수정 완료' : '등록 완료'}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QnaWrite;
