import { useState } from 'react';
import { studyApi } from '@apis';
import { Logger } from '@utils';

interface CreateAssignmentModalProps {
  studyId: number;
  sessionId: number;
  onClose: () => void;
}

const CreateAssignmentModal = ({ studyId, sessionId, onClose }: CreateAssignmentModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemIdsInput, setProblemIdsInput] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !problemIdsInput.trim()) {
      alert('과제 제목과 문제 ID를 입력해주세요.');
      return;
    }

    const problemIds = problemIdsInput.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));

    if (problemIds.length === 0) {
      alert('유효한 문제 ID를 쉼표(,)로 구분하여 입력해주세요.');
      return;
    }

    try {
      await studyApi.createAssignment(studyId, sessionId, {
        title,
        description,
        problemIds
      });
      alert('과제가 성공적으로 등록되었습니다.');
      onClose();
    } catch (err: any) {
      Logger.error('Failed to create assignment', err);
      // The backend may not be fully implemented yet, avoid crash
      alert('과제 생성에 실패했습니다. (백엔드 API 미구현 가능성)');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-NanumSquare text-black">
      <div className="bg-gray-100 rounded-xl p-8 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">과제 등록</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">과제 제목</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="예: 1주차 기본 알고리즘"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">설명</label>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="상세 설명 (선택)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">문제 ID 목록 (쉼표로 구분)</label>
          <input
            type="text"
            placeholder="예: 10001, 10002, 10003"
            className="w-full p-2 border rounded"
            value={problemIdsInput}
            onChange={(e) => setProblemIdsInput(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4 font-Pretendard">
          <button
            className="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-full hover:text-[#CAFF33]"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;
