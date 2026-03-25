import { useState, useEffect } from 'react';
import { studyApi, studySessionApi, problemApi } from '@apis';
import { Logger } from '@utils';
import { useAlert } from '@contexts';

interface Problem {
  problemId: number;
  title: string;
}

interface AddAssignmentModalProps {
  studyId: number;
  sessionId: number;
  onClose: () => void;
}

const AddAssignmentModal = ({ studyId, sessionId, onClose }: AddAssignmentModalProps) => {
  const { showAlert } = useAlert();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProblems = async () => {
      try {
        setIsSearching(true);
        const res = await problemApi.getProblems(0, 20, searchQuery);
        if (isMounted) {
          const content = res.data?.content || res.content || [];
          setProblems(content);
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
  }, [searchQuery]);

  const handleSelectProblem = (problem: Problem) => {
    if (!selectedProblems.some(p => p.problemId === problem.problemId)) {
      setSelectedProblems([...selectedProblems, problem]);
    }
  };

  const handleRemoveProblem = (problemId: number) => {
    setSelectedProblems(selectedProblems.filter(p => p.problemId !== problemId));
  };

  const handleSubmit = async () => {
    if (!title.trim() || selectedProblems.length === 0) {
      showAlert('info', '과제 제목과 문제를 1개 이상 선택해주세요.');
      return;
    }

    const problemIds = selectedProblems.map(p => p.problemId);

    try {
      await studySessionApi.createAssignment(sessionId, {
        title,
        description,
        problemIds
      });
      showAlert('success', '과제가 성공적으로 등록되었습니다.');
      onClose();
    } catch (err: any) {
      Logger.error('Failed to create assignment', err);
      showAlert('error', '과제 생성에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 transition-all duration-300 animate-fadeIn">
      <div className="bg-[#2A2A2A] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-[#CAFF33]">과제 등록</h2>
        
        <div className="space-y-5 text-white">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">과제 제목</label>
            <input
              type="text"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#CAFF33] transition-colors"
              placeholder="예: 1주차 기본 알고리즘"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">설명</label>
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#CAFF33] transition-colors min-h-[100px]"
              placeholder="상세 설명 (선택 사항)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Selected Problems */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">선택된 문제</label>
            <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-3 bg-black/40 border border-white/10 rounded-lg overflow-y-auto max-h-[120px]">
              {selectedProblems.length === 0 && (
                <span className="text-gray-500 text-sm">선택된 문제가 없습니다. 아래에서 검색하여 추가해주세요.</span>
              )}
              {selectedProblems.map((p) => (
                <div key={p.problemId} className="flex items-center gap-2 px-3 py-1.5 bg-[#CAFF33] text-black rounded-full text-sm font-semibold max-w-full">
                  <span className="truncate">{p.problemId}. {p.title}</span>
                  <button onClick={() => handleRemoveProblem(p.problemId)} className="text-black/60 hover:text-black font-bold ml-1 shrink-0">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Problem Search */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">문제 검색</label>
            <input
              type="text"
              placeholder="문제 번호 또는 제목으로 검색..."
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#CAFF33] transition-colors mb-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <div className="bg-black/40 border border-white/10 rounded-lg h-40 overflow-y-auto w-full text-sm">
              {isSearching ? (
                <div className="p-3 text-gray-400 text-center">조회 중...</div>
              ) : problems.length === 0 ? (
                <div className="p-3 text-gray-400 text-center">검색 결과가 없습니다.</div>
              ) : (
                problems.map((p) => {
                  const isSelected = selectedProblems.some(selected => selected.problemId === p.problemId);
                  return (
                    <div
                      key={p.problemId}
                      className={`p-3 border-b border-white/5 flex justify-between items-center transition-colors ${
                        isSelected ? 'bg-white/10 text-gray-300 cursor-default' : 'hover:bg-white/5 cursor-pointer text-white'
                      }`}
                      onClick={() => !isSelected && handleSelectProblem(p)}
                    >
                      <span className="truncate pr-4 font-NanumSquare">{p.problemId}. {p.title}</span>
                      {isSelected ? (
                        <span className="text-xs text-gray-500 font-semibold shrink-0">선택됨</span>
                      ) : (
                        <button className="text-[#CAFF33] text-xs font-bold shrink-0 hover:underline">추가</button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            className="px-6 py-2.5 bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2.5 bg-[#CAFF33] text-black font-bold rounded-full hover:bg-[#b0e82e] transition shadow-lg shadow-[#CAFF33]/15"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAssignmentModal;
