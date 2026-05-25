import { Button, Footer, Header, Pagination } from '@components';
import { useAlert, useAuth } from '@contexts';
import { qnaApi } from '@leita/api';
import type { QnaResponse } from '@leita/types';
import { formatDateTime } from '@utils';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QnaList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [qnas, setQnas] = useState<QnaResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchQnas = async (page = 0) => {
    try {
      setLoading(true);
      const res = await qnaApi.getAllQnas(page, 10);
      setQnas(res.content || []);
      setTotalPages(res.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch QnAs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQnas(0);
  }, []);

  const handleWriteClick = () => {
    if (!user) {
      showAlert('error', '로그인이 필요한 서비스입니다.');
      return;
    }
    navigate('/qna/write');
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#1A1A1A] font-Pretendard overflow-x-hidden">
      <Header />

      <main className="flex-grow w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative">
            <div className="absolute top-0 left-0 w-48 h-48 bg-[#CAFE33]/5 blur-[80px] -ml-20 -mt-20 rounded-full pointer-events-none" />
            
            <div className="flex flex-col gap-2 relative z-10">
              <h1 className="text-4xl font-black text-white tracking-tight">Q&A 문의 게시판</h1>
              <p className="text-gray-500 font-medium">LEITA 서비스 이용 중 궁금한 점을 공유하고 답변을 확인해 보세요.</p>
            </div>

            <Button
              variant="primary"
              onClick={handleWriteClick}
              className="relative z-10 !rounded-xl !py-3.5 !px-6 shadow-lg shadow-[#CAFE33]/10 font-bold shrink-0 self-stretch sm:self-auto text-center"
            >
              문의 등록하기
            </Button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-bold">Q&A 목록을 가져오고 있습니다...</p>
              </div>
            ) : qnas.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-white/10">
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest w-20">번호</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">제목</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest w-28">작성자</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest w-28">상태</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right w-44">작성일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qnas.map((qna) => (
                        <tr
                          key={qna.id}
                          onClick={() => navigate(`/qna/${qna.id}`)}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group active:scale-[0.99]"
                        >
                          <td className="px-6 py-5 text-sm font-bold text-gray-500 font-JetBrain">
                            #{qna.id}
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-gray-300 group-hover:text-[#CAFE33] transition-colors line-clamp-1">
                            {qna.title}
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-gray-400">
                            {qna.authorName}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                              qna.answer 
                                ? 'bg-[#CAFE33]/10 text-[#CAFE33] border border-[#CAFE33]/20' 
                                : 'bg-white/5 text-gray-500 border border-white/5'
                            }`}>
                              {qna.answer ? '답변완료' : '답변대기'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right text-xs font-medium text-gray-500 group-hover:text-white transition-colors">
                            {formatDateTime(qna.createdAt).split(' (')[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => fetchQnas(page)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-gray-500 font-bold">등록된 Q&A 문의가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QnaList;
