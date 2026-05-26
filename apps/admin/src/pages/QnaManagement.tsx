import React, { useEffect, useState, useCallback } from 'react';
import { qnaApi } from '@leita/api';
import { usePaginatedList } from '@hooks';
import type { QnaResponse } from '@leita/types';
import { formatDateTime } from '@utils';
import { Button, Pagination } from '@leita/ui';

const QnaManagement: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNANSWERED'>('UNANSWERED');

  // Detail & Answer state
  const [selectedQna, setSelectedQna] = useState<QnaResponse | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const fetcher = useCallback(async (page: number) => {
    const res = await qnaApi.getAdminQnas(page, 10);
    let content = res.content || [];
    if (filterMode === 'UNANSWERED') {
      content = content.filter(q => !q.answer);
    }
    return {
      content,
      totalPages: res.totalPages || 1,
    };
  }, [filterMode]);

  const {
    items: qnas,
    currentPage,
    totalPages,
    loading,
    goToPage,
    refresh,
  } = usePaginatedList(fetcher, [filterMode]);

  const handleSelectQna = (qna: QnaResponse) => {
    setSelectedQna(qna);
    setAnswerContent(qna.answer || '');
  };

  const handleBackToList = () => {
    setSelectedQna(null);
    setAnswerContent('');
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQna) return;
    if (!answerContent.trim()) {
      alert('답변 내용을 입력해 주세요.');
      return;
    }

    try {
      setSubmittingAnswer(true);
      await qnaApi.replyQna(selectedQna.id, { answer: answerContent });
      alert('답변이 성공적으로 등록되었습니다.');
      handleBackToList();
      refresh();
    } catch (err) {
      console.error('Failed to reply to Q&A', err);
      alert('답변 등록에 실패했습니다.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  if (selectedQna) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Q&A 답변 등록 및 상세</h1>
          <Button
            variant="ghost"
            onClick={handleBackToList}
            className="!px-4 !py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold border border-white/5"
          >
            뒤로가기
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Question card */}
          <div className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#CAFE33]/5 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col gap-3 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded bg-white/10 text-gray-400 text-xs font-black font-JetBrain">Q</span>
                <h2 className="text-xl font-bold text-white leading-snug">{selectedQna.title}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 text-xs font-semibold text-gray-500">
                <span>질문자: {selectedQna.authorName} ({selectedQna.authorEmail})</span>
                <span className="w-1 h-1 bg-white/10 rounded-full" />
                <span>등록일시: {formatDateTime(selectedQna.createdAt)}</span>
              </div>
            </div>

            <div className="text-gray-300 font-medium leading-relaxed whitespace-pre-wrap select-text text-sm">
              {selectedQna.content}
            </div>
          </div>

          {/* Answer Form card */}
          <div className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-8">
            <form onSubmit={handleAnswerSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#CAFE33] text-black text-xs font-black font-JetBrain">A</span>
                  <h3 className="text-lg font-bold text-[#CAFE33]">답변 작성</h3>
                </div>
                <textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="사용자의 질문에 대한 친절한 답변 내용을 작성해 주세요."
                  rows={8}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#CAFE33] transition-all font-semibold resize-y text-sm"
                />
              </div>

              <div className="flex justify-end gap-4 border-t border-white/5 pt-6">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={handleBackToList}
                  className="rounded-xl font-bold bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={submittingAnswer}
                  className="rounded-xl font-bold shadow-lg shadow-[#CAFE33]/10"
                >
                  {submittingAnswer ? '전송 중...' : selectedQna.answer ? '답변 수정하기' : '답변 등록하기'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white">Q&A 문의 관리</h1>
          <p className="text-gray-500 font-medium">사용자들이 등록한 질문 내역과 어드민의 1:1 답변을 관리합니다.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5 shrink-0 self-stretch sm:self-auto">
          {[
            { key: 'UNANSWERED', label: '미답변 문의' },
            { key: 'ALL', label: '전체 문의' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterMode(key as 'ALL' | 'UNANSWERED')}
              className={`px-4 py-2 text-xs font-black rounded-lg transition-all duration-300 ${
                filterMode === key
                  ? 'bg-white/10 text-[#CAFE33] shadow-md'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
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
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest w-20">ID</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">제목</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest w-44">작성자 (이메일)</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest w-28">상태</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest w-40">등록일시</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right w-28">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {qnas.map((qna) => (
                    <tr
                      key={qna.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-5 text-sm font-bold text-gray-500 font-JetBrain">
                        #{qna.id}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-gray-300 line-clamp-1">
                        {qna.title}
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-gray-400">
                        <span className="block text-white font-bold">{qna.authorName}</span>
                        <span className="block text-xs text-gray-600 font-JetBrain">{qna.authorEmail}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                          qna.answer 
                            ? 'bg-[#CAFE33]/10 text-[#CAFE33] border border-[#CAFE33]/20' 
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {qna.answer ? '답변완료' : '미답변'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-xs font-medium text-gray-500">
                        {formatDateTime(qna.createdAt).split(' (')[0]}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleSelectQna(qna)}
                          className="px-3 py-1.5 bg-[#CAFE33] hover:bg-[#b9e82c] text-black rounded-lg text-xs font-bold transition-all"
                        >
                          {qna.answer ? '상세/수정' : '답변작성'}
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
                  onPageChange={(page) => goToPage(page)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-gray-500 font-bold">처리할 Q&A 문의가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QnaManagement;
