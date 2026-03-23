import { useState } from 'react';
import { studyApi } from '@apis';
import { Logger } from '@utils';
import { useAlert } from '@contexts';

interface CreateSessionModalProps {
  studyId: number;
  onClose: () => void;
  onCreated: () => void;
}

const CreateSessionModal = ({ studyId, onClose, onCreated }: CreateSessionModalProps) => {
  const { showAlert } = useAlert();
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');

  const handleSubmit = async () => {
    if (!startDateTime || !endDateTime) {
      showAlert('info', '시작 시간과 종료 시간을 모두 입력해주세요.');
      return;
    }

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      showAlert('info', '종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    try {
      await studyApi.createSession({ studyId, startDateTime, endDateTime });
      showAlert('success', '세션이 성공적으로 생성되었습니다.');
      onCreated();
      onClose();
    } catch (err: any) {
      Logger.error('Failed to create session', err);
      showAlert('error', '세션 생성에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-NanumSquare text-black">
      <div className="bg-gray-100 rounded-xl p-8 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">새 세션 생성</h2>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">시작 시간</label>
          <input
            type="datetime-local"
            className="w-full p-2 border rounded"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">종료 시간</label>
          <input
            type="datetime-local"
            className="w-full p-2 border rounded"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
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

export default CreateSessionModal;
