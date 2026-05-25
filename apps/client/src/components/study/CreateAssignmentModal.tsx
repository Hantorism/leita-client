import { problemApi, studySessionApi } from '@leita/api';
import { Button, Modal, Pagination } from '@components';
import { useAlert } from '@contexts';
import type { ProblemDetail } from '@leita/types';
import { Logger, type PagedResponse } from '@utils';
import { useEffect, useState } from 'react';

interface CreateAssignmentModalProps {
  studyId: number;
  sessionId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateAssignmentModal = ({ studyId, sessionId, onClose, onSuccess }: CreateAssignmentModalProps) => {
  const { showAlert } = useAlert();
  const [description, setDescription] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [problems, setProblems] = useState<ProblemDetail[]>([]);

  // ✅ 검색어가 변경되면 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);
  const [selectedProblems, setSelectedProblems] = useState<ProblemDetail[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let isMounted = true;
    const fetchProblems = async () => {
      try {
        setIsSearching(true);
        const res = await problemApi.getProblems(currentPage, pageSize, searchQuery);
        if (isMounted) {
          const { content, totalPages: total } = res as unknown as PagedResponse<ProblemDetail>;
          setProblems(content);
          setTotalPages(total);
        }
      } catch (err) {
        Logger.error('Failed to fetch problems', err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProblems();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, currentPage]);

  // 검색어가 바뀌면 페이지를 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const handleSelectProblem = (problem: ProblemDetail) => {
    if (!selectedProblems.some((p) => p.problemId === problem.problemId)) {
      setSelectedProblems([...selectedProblems, problem]);
    }
  };

  const handleRemoveProblem = (problemId: string) => {
    setSelectedProblems(selectedProblems.filter((p) => p.problemId !== problemId));
  };

  const handleSubmit = async () => {
    if (selectedProblems.length === 0) {
      showAlert('info', '문제를 1개 이상 선택해주세요.');
      return;
    }

    const problemIds = selectedProblems.map((p) => p.problemId);

    try {
      await studySessionApi.createAssignment(sessionId, {
        description: description || null,
        problemIds,
        startDateTime: null,
        endDateTime: new Date().toISOString(),
      });
      showAlert('success', '과제가 성공적으로 등록되었습니다.');
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      Logger.error('Failed to create assignment', err);
      showAlert('error', '과제 생성에 실패했습니다.');
    }
  };

  return (
    <Modal
      title="과제 등록"
      onClose={onClose}
      buttons={[
        { text: '과제 출제', variant: 'primary', onClick: handleSubmit },
        { text: '취소', variant: 'secondary', onClick: onClose },
      ]}
    >
      <div className="space-y-5 text-white">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">설명</label>
          <textarea
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-brand)] transition-colors min-h-[80px]"
            placeholder="상세 설명 (선택 사항)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">선택된 문제</label>
          <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-3 bg-black/40 border border-white/10 rounded-lg overflow-y-auto max-h-[120px]">
            {selectedProblems.length === 0 && (
              <span className="text-gray-500 text-sm">선택된 문제가 없습니다. 아래에서 검색하여 추가해주세요.</span>
            )}
            {selectedProblems.map((p) => (
              <div
                key={p.problemId}
                className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-brand)] text-black rounded-full text-sm font-semibold max-w-full"
              >
                <span className="truncate">
                  {p.problemId}. {p.title}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => handleRemoveProblem(p.problemId)}
                  className="!px-0 !py-0 text-black/60 hover:text-black hover:bg-transparent ml-1 shrink-0 bg-transparent shadow-none border-none"
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">문제 검색</label>
          <input
            type="text"
            placeholder="문제 번호 또는 제목으로 검색..."
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-brand)] transition-colors mb-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="bg-black/40 border border-white/10 rounded-lg h-40 overflow-y-auto w-full text-sm scrollbar-hide">
            {isSearching ? (
              <div className="p-3 text-gray-400 text-center">조회 중...</div>
            ) : problems.length === 0 ? (
              <div className="p-3 text-gray-400 text-center">검색 결과가 없습니다.</div>
            ) : (
              problems.map((p) => {
                const isSelected = selectedProblems.some((selected) => selected.problemId === p.problemId);
                return (
                  <div
                    key={p.problemId}
                    className={`p-3 border-b border-white/5 flex justify-between items-center transition-colors ${
                      isSelected
                        ? 'bg-white/10 text-gray-300 cursor-default'
                        : 'hover:bg-white/5 cursor-pointer text-white'
                    }`}
                    onClick={() => !isSelected && handleSelectProblem(p)}
                  >
                    <span className="truncate pr-4 font-Pretendard">
                      {p.problemId}. {p.title}
                    </span>
                    {isSelected ? (
                      <span className="text-sm text-gray-500 font-semibold shrink-0">선택됨</span>
                    ) : (
                      <Button
                        variant="ghost"
                        className="!px-0 !py-0 text-[var(--color-brand)] hover:text-[var(--color-brand)] hover:bg-transparent shrink-0 hover:underline bg-transparent shadow-none border-none font-semibold"
                      >
                        추가
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination UI */}
          {totalPages > 0 && !isSearching && problems.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              className="mt-4"
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CreateAssignmentModal;
