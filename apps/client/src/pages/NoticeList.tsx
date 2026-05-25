import { Button, Footer, Header, Pagination } from '@components';
import { noticeApi } from '@leita/api';
import type { NoticeResponse } from '@leita/types';
import { formatDateTime } from '@utils';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NoticeList = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<NoticeResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async (page = 0) => {
    try {
      setLoading(true);
      const res = await noticeApi.getNotices(page, 10);
      setNotices(res.content || []);
      setTotalPages(res.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch notices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices(0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#1A1A1A] font-Pretendard overflow-x-hidden">
      <Header />

      <main className="flex-grow w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-2 relative">
            <div className="absolute top-0 left-0 w-48 h-48 bg-[#CAFE33]/5 blur-[80px] -ml-20 -mt-20 rounded-full pointer-events-none" />
            <h1 className="text-4xl font-black text-white tracking-tight relative z-10">공지사항</h1>
            <p className="text-gray-500 font-medium relative z-10">LEITA 서비스의 공지사항 및 공지 내용을 전달합니다.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-bold">공지사항을 가져오고 있습니다...</p>
              </div>
            ) : notices.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-white/10">
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest w-20">번호</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">제목</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest w-32">작성자</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right w-44">작성일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notices.map((notice, idx) => (
                        <tr
                          key={notice.id}
                          onClick={() => navigate(`/notices/${notice.id}`)}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group active:scale-[0.99]"
                        >
                          <td className="px-6 py-5 text-sm font-bold text-gray-500 font-JetBrain">
                            #{notice.id}
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-gray-300 group-hover:text-[#CAFE33] transition-colors line-clamp-1">
                            {notice.title}
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-gray-400">
                            {notice.authorName}
                          </td>
                          <td className="px-6 py-5 text-right text-xs font-medium text-gray-500 group-hover:text-white transition-colors">
                            {formatDateTime(notice.createdAt).split(' (')[0]}
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
                      onPageChange={(page) => fetchNotices(page)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-gray-500 font-bold">등록된 공지사항이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NoticeList;
