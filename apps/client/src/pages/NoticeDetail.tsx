import { Button, Footer, Header } from '@components';
import { noticeApi } from '@leita/api';
import type { NoticeResponse } from '@leita/types';
import { formatDateTime } from '@utils';
import { motion } from 'framer-motion';
import { useFetchItem } from '@hooks';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { marked } from 'marked';

const NoticeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetcher = useCallback(() => {
    if (!id) return Promise.resolve(null);
    return noticeApi.getNotice(Number(id));
  }, [id]);

  const { item: notice, loading } = useFetchItem<NoticeResponse | null>(fetcher, [id]);

  const htmlContent = useMemo(() => {
    if (!notice?.content) return '';
    // Check if the content is HTML (e.g. starts with <p, <h1, etc.)
    const isHtml = /^\s*<[a-z0-9]+/i.test(notice.content);
    if (isHtml) return notice.content;

    try {
      return marked.parse(notice.content) as string;
    } catch (err) {
      console.error('Failed to parse markdown', err);
      return notice.content;
    }
  }, [notice?.content]);

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#1A1A1A] font-Pretendard overflow-x-hidden">
      <Header />

      <main className="flex-grow w-full max-w-4xl mx-auto px-5 sm:px-6 py-10 sm:py-20">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/notices')}
              className="!px-3 !py-2 text-gray-400 hover:text-white flex items-center gap-1.5 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              목록으로
            </Button>
          </div>

          {loading ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-bold">공지사항을 불러오고 있습니다...</p>
            </div>
          ) : notice ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col gap-8"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#CAFE33]/5 blur-[80px] -mr-20 -mt-20 rounded-full pointer-events-none" />
              
              <div className="flex flex-col gap-4 border-b border-white/10 pb-6 relative z-10">
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                  {notice.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 font-semibold">
                  <span className="text-[#CAFE33] font-bold">작성자: {notice.authorName}</span>
                  <span className="w-1 h-1 bg-white/10 rounded-full hidden sm:inline" />
                  <span>등록일: {formatDateTime(notice.createdAt)}</span>
                  {notice.updatedAt !== notice.createdAt && (
                    <>
                      <span className="w-1 h-1 bg-white/10 rounded-full" />
                      <span>수정일: {formatDateTime(notice.updatedAt)}</span>
                    </>
                  )}
                </div>
              </div>

              <div 
                className="text-gray-300 font-medium leading-relaxed min-h-[250px] relative z-10 text-base break-words select-text outline-none prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </motion.div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center">
              <p className="text-gray-500 font-bold">공지사항을 찾을 수 없습니다.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NoticeDetail;
