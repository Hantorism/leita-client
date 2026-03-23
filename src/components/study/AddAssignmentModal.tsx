import { useState } from 'react';
import { studyApi } from '@apis';
import { Logger } from '@utils';
import { useAlert } from '@contexts';

interface AddAssignmentModalProps {
  studyId: number;
  sessionId: number;
  onClose: () => void;
}

const AddAssignmentModal = ({ studyId, sessionId, onClose }: AddAssignmentModalProps) => {
  const { showAlert } = useAlert();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemIdsInput, setProblemIdsInput] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !problemIdsInput.trim()) {
      showAlert('info', '과제 제목과 문제 ID를 입력해주세요.');
      return;
    }

    const problemIds = problemIdsInput.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));

    if (problemIds.length === 0) {
      showAlert('info', '유효한 문제 ID를 쉼표(,)로 구분하여 입력해주세요.');
      return;
    }

    try {
      await studyApi.createAssignment(sessionId, {
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

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">문제 ID 목록 (쉼표 구분)</label>
            <input
              type="text"
              placeholder="예: 10001, 10002"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#CAFF33] transition-colors"
              value={problemIdsInput}
              onChange={(e) => setProblemIdsInput(e.target.value)}
            />
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
