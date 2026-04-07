import { problemApi, studySessionApi } from '@apis';
import { Button, Modal } from '@components';
import { useAlert } from '@contexts';
import { Logger } from '@utils';
import { useEffect, useState } from 'react';

interface Problem {
  problemId: number;
  title: string;
}

interface UpdateAssignmentModalProps {
  studyId: number;
  sessionId: number;
  initialData: {
    title: string;
    description?: string;
    problemIds: number[];
  };
  onClose: () => void;
  onSuccess?: () => void;
}

const UpdateAssignmentModal = ({ studyId, sessionId, initialData, onClose, onSuccess }: UpdateAssignmentModalProps) => {
  const { showAlert } = useAlert();
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description || '');

  const [searchQuery, setSearchQuery] = useState('');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // 초기 문제 로드
  useEffect(() => {
    const fetchInitialProblems = async () => {
      if (initialData.problemIds && initialData.problemIds.length > 0) {
        try {
          const res = await Promise.all(
            initialData.problemIds.map((pid: number) => problemApi.getProblem(pid).catch(() => null)),
          );
          const initialProbs = res
            .map((p) => p?.data || p)
            .filter((p) => p && p.problemId)
            .map((p) => ({ problemId: p.problemId, title: p.title }));
          setSelectedProblems(initialProbs);
        } catch (err) {
          Logger.error('Failed to fetch initial assignment problems', err);
        }
      }
    };
    fetchInitialProblems();
  }, [initialData.problemIds]);

  // 검색 로직
  useEffect(() => {
    let isMounted = true;
    const fetchProblems = async () => {
      try {
        setIsSearching(true);
        const res = await problemApi.getProblems(currentPage, pageSize, searchQuery);
        if (isMounted) {
          const content = res.data?.content || res.content || [];
          const total = res.data?.totalPages || res.totalPages || 1;
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

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const handleSelectProblem = (problem: Problem) => {
    if (!selectedProblems.some((p) => p.problemId === problem.problemId)) {
      setSelectedProblems([...selectedProblems, problem]);
    }
  };

  const handleRemoveProblem = (problemId: number) => {
    setSelectedProblems(selectedProblems.filter((p) => p.problemId !== problemId));
  };

  const handleSubmit = async () => {
    if (!title.trim() || selectedProblems.length === 0) {
      showAlert('info', '과제 제목과 문제를 1개 이상 선택해주세요.');
      return;
    }

    const problemIds = selectedProblems.map((p) => p.problemId);

    try {
      await studySessionApi.updateAssignment(sessionId, {
        title,
        description,
        problemIds,
      });
      showAlert('success', '과제가 수정되었습니다.');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      Logger.error('Failed to update assignment', err);
      showAlert('error', '과제 수정에 실패했습니다.');
    }
  };

  return (
    <Modal
      title="과제 수정"
      onClose={onClose}
      buttons={[
        { text: '과제 수정', variant: 'primary', onClick: handleSubmit },
        { text: '취소', variant: 'secondary', onClick: onClose },
      ]}
    >
      <div className="space-y-5 text-white">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">과제 제목</label>
          <input
            type="text"
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#CAFE33] transition-colors"
            placeholder="예: 1주차 기본 알고리즘"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">설명</label>
          <textarea
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#CAFE33] transition-colors min-h-[80px]"
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
                className="flex items-center gap-2 px-3 py-1.5 bg-[#CAFE33] text-black rounded-full text-sm font-semibold max-w-full"
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
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#CAFE33] transition-colors mb-2"
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
                      <span className="text-xs text-gray-500 font-semibold shrink-0">선택됨</span>
                    ) : (
                      <Button
                        variant="ghost"
                        className="!px-0 !py-0 text-[#CAFE33] hover:text-[#CAFE33] hover:bg-transparent shrink-0 hover:underline bg-transparent shadow-none border-none font-semibold"
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
            <div className="flex flex-col items-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                  className="!px-2 !py-1 text-xs text-gray-400 hover:text-white disabled:opacity-20 bg-transparent shadow-none border-none"
                >
                  이전
                </Button>

                {Array.from({ length: totalPages }, (_, i) => {
                  const isPageActive = currentPage === i;
                  return (
                    <Button
                      key={i}
                      variant="ghost"
                      onClick={() => setCurrentPage(i)}
                      className={`!px-2.5 !py-1 text-xs rounded-md min-w-[28px] ${
                        isPageActive
                          ? '!bg-[#CAFE33] !text-black font-bold !opacity-100 hover:!bg-[#CAFE33] hover:!text-black transition-none scale-110 shadow-[0_0_10px_rgba(202,255,51,0.3)]'
                          : 'text-gray-500 hover:text-white hover:bg-white/10 bg-transparent shadow-none border-none'
                      }`}
                    >
                      {i + 1}
                    </Button>
                  );
                })}

                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="!px-2 !py-1 text-xs text-gray-400 hover:text-white disabled:opacity-20 bg-transparent shadow-none border-none"
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UpdateAssignmentModal;
