import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { noticeApi } from '@leita/api';
import { usePaginatedList } from '@hooks';
import type { NoticeResponse } from '@leita/types';
import { formatDateTime } from '@utils';
import { Button, Pagination, Loader } from '@leita/ui';
import { marked } from 'marked';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

/** 주어진 문자열이 HTML인지 마크다운인지 판별합니다. */
const isHtmlContent = (s: string) => /^\s*<[a-z0-9]+/i.test(s);

/** 마크다운 또는 HTML 문자열을 안전하게 HTML 문자열로 변환합니다. */
const toHtml = (s: string): string => {
  if (!s) return '';
  if (isHtmlContent(s)) return s;
  try {
    return marked.parse(s) as string;
  } catch {
    return s;
  }
};

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] text-white',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync value from outside if it changes (e.g. initial load of edit mode)
  // value가 raw 마크다운일 경우 HTML로 변환 후 주입합니다.
  useEffect(() => {
    if (!editor) return;
    const html = toHtml(value);
    if (editor.getHTML() !== html) {
      editor.commands.setContent(html || '');
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 relative select-text">
      {/* Subtle Floating Toolbar */}
      <div className="flex flex-wrap gap-1.5 pb-4 mb-4 border-b border-white/5 text-gray-400">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-white/5 hover:text-white transition-colors ${editor.isActive('bold') ? 'bg-white/10 text-[#CAFE33]' : ''}`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-white/5 hover:text-white transition-colors ${editor.isActive('italic') ? 'bg-white/10 text-[#CAFE33]' : ''}`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-white/5 hover:text-white transition-colors ${editor.isActive('strike') ? 'bg-white/10 text-[#CAFE33]' : ''}`}
        >
          Strike
        </button>
        <div className="w-[1px] h-5 bg-white/10 self-center mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-white/5 hover:text-white transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-white/10 text-[#CAFE33]' : ''}`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-white/5 hover:text-white transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-white/10 text-[#CAFE33]' : ''}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-white/5 hover:text-white transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-white/10 text-[#CAFE33]' : ''}`}
        >
          H3
        </button>
        <div className="w-[1px] h-5 bg-white/10 self-center mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-white/5 hover:text-white transition-colors ${editor.isActive('bulletList') ? 'bg-white/10 text-[#CAFE33]' : ''}`}
        >
          Bullet List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-white/5 hover:text-white transition-colors ${editor.isActive('orderedList') ? 'bg-white/10 text-[#CAFE33]' : ''}`}
        >
          Ordered List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-white/5 hover:text-white transition-colors ${editor.isActive('codeBlock') ? 'bg-white/10 text-[#CAFE33]' : ''}`}
        >
          Code Block
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="min-h-[300px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

const NoticeManagement: React.FC = () => {
  const [view, setView] = useState<ViewMode>('list');
  const [selectedNotice, setSelectedNotice] = useState<NoticeResponse | null>(null);
  const fetcher = useCallback((page: number) => noticeApi.getAdminNotices(page, 10), []);
  const {
    items: notices,
    currentPage,
    totalPages,
    loading,
    goToPage,
    refresh,
  } = usePaginatedList(fetcher);

  // Form states
  const [targetId, setTargetId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleDetailOpen = (notice: NoticeResponse) => {
    setSelectedNotice(notice);
    setView('detail');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) return;
    try {
      await noticeApi.deleteNotice(id);
      alert('공지사항이 성공적으로 삭제되었습니다.');
      refresh();
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
      goToPage(0);
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
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">본문 내용 (Notion 스타일 Markdown 에디터)</label>
            <MarkdownEditor value={content} onChange={setContent} />
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

  if (view === 'detail' && selectedNotice) {
    const htmlContent = toHtml(selectedNotice.content);

    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setView('list')}
            className="!px-4 !py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold border border-white/5"
          >
            목록으로
          </Button>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => handleEditOpen(selectedNotice)}
              className="!px-4 !py-2 bg-[#CAFE33]/10 hover:bg-[#CAFE33]/20 text-[#CAFE33] rounded-xl text-sm font-bold border border-[#CAFE33]/10"
            >
              수정하기
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                if (window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
                  try {
                    await noticeApi.deleteNotice(selectedNotice.id);
                    alert('공지사항이 삭제되었습니다.');
                    setView('list');
                    goToPage(0);
                  } catch (err) {
                    console.error('Failed to delete notice', err);
                  }
                }
              }}
              className="!px-4 !py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-bold border border-red-500/10"
            >
              삭제
            </Button>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col gap-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#CAFE33]/5 blur-[80px] -mr-20 -mt-20 rounded-full pointer-events-none" />

          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              {selectedNotice.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 font-semibold">
              <span className="text-[#CAFE33] font-bold">작성자: {selectedNotice.authorName}</span>
              <span className="w-1 h-1 bg-white/10 rounded-full hidden sm:inline" />
              <span>등록일: {formatDateTime(selectedNotice.createdAt)}</span>
              {selectedNotice.updatedAt !== selectedNotice.createdAt && (
                <>
                  <span className="w-1 h-1 bg-white/10 rounded-full" />
                  <span>수정일: {formatDateTime(selectedNotice.updatedAt)}</span>
                </>
              )}
            </div>
          </div>

          <div 
            className="text-gray-300 font-medium leading-relaxed min-h-[250px] relative z-10 text-base break-words select-text outline-none prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
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
          <Loader text="공지사항을 가져오고 있습니다..." />
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
                      <td 
                        onClick={() => handleDetailOpen(notice)}
                        className="px-6 py-5 text-sm font-bold text-gray-300 hover:text-[#CAFE33] cursor-pointer transition-colors"
                      >
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
                          onClick={() => handleDetailOpen(notice)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          상세
                        </button>
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
                  onPageChange={(page) => goToPage(page)}
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
