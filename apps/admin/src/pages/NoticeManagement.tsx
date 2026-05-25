import React, { useEffect, useState } from 'react';
import { noticeApi } from '@leita/api';
import type { NoticeResponse } from '@leita/types';
import { formatDateTime } from '@utils';
import { Button, Pagination } from '@leita/ui';

type ViewMode = 'list' | 'create' | 'edit';

const NoticeManagement: React.FC = () => {
  const [view, setView] = useState<ViewMode>('list');
  const [notices, setNotices] = useState<NoticeResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Form states
  const [targetId, setTargetId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchNotices = async (page = 0) => {
    try {
      setLoading(true);
      const res = await noticeApi.getAdminNotices(page, 10);
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

  const handleCreateOpen = () => {
    setTargetId(null);
    setTitle('');
    setContent('');
    setView('create');
  };

  const handleEditOpen = (notice: NoticeResponse) => {
    setTargetId(notice.id);
    setTitle(notice.title);
    setContent(notice.content);
    setView('edit');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) return;
    try {
      await noticeApi.deleteNotice(id);
      alert('공지사항이 성공적으로 삭제되었습니다.');
      fetchNotices(currentPage);
    } catch (err) {
      console.error('Failed to delete notice', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    try {
      setSubmitting(true);
      if (view === 'edit' && targetId !== null) {
        await noticeApi.updateNotice(targetId, { title, content });
        alert('공지사항이 수정되었습니다.');
      } else {
        await noticeApi.createNotice({ title, content });
        alert('공지사항이 등록되었습니다.');
      }
      setView('list');
      fetchNotices(0);
    } catch (err) {
      console.error('Failed to submit notice', err);
      alert('등록/수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (view === 'create' || view === 'edit') {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">
            {view === 'edit' ? '공지사항 수정' : '신규 공지사항 등록'}
          </h1>
          <Button
            variant="ghost"
            onClick={() => setView('list')}
            className="!px-4 !py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold border border-white/5"
          >
            뒤로가기
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지사항 제목을 입력해 주세요."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#CAFE33] transition-all font-semibold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">본문 내용 (HTML 지원)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="HTML 테그를 활용하여 공지사항 내용을 상세하게 작성해 주세요."
              rows={12}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#CAFE33] transition-all font-mono font-medium resize-y"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 border-t border-white/5 pt-6">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setView('list')}
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
              {submitting ? '저장 중...' : '공지 저장하기'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white">공지사항 관리</h1>
          <p className="text-gray-500 font-medium">사용자에게 서비스 업데이트 및 소식을 전하는 공지사항을 관리합니다.</p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreateOpen}
          className="!rounded-xl !py-3.5 !px-6 shadow-lg shadow-[#CAFE33]/10 font-bold"
        >
          공지사항 등록
        </Button>
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
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest w-20">ID</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">제목</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest w-32">작성자</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest w-44">작성일시</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right w-40">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {notices.map((notice) => (
                    <tr
                      key={notice.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-5 text-sm font-bold text-gray-500 font-JetBrain">
                        #{notice.id}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-gray-300 line-clamp-1">
                        {notice.title}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-gray-400">
                        {notice.authorName}
                      </td>
                      <td className="px-6 py-5 text-xs font-medium text-gray-500">
                        {formatDateTime(notice.createdAt).split(' (')[0]}
                      </td>
                      <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditOpen(notice)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold border border-red-500/10 transition-all"
                        >
                          삭제
                        </button>
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
  );
};

export default NoticeManagement;
