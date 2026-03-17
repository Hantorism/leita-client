import React, { useState } from 'react';
import { studyApi } from '@apis';
import { Logger } from '@utils';

interface AttendanceCheckModalProps {
  studyId: number;
  sessionId: number;
  onClose: () => void;
}

const AttendanceCheckModal: React.FC<AttendanceCheckModalProps> = ({ studyId, sessionId, onClose }) => {
  const [openTime, setOpenTime] = useState(new Date().toISOString().slice(0, 16));
  const [closeTime, setCloseTime] = useState('');
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState<number | ''>('');

  const handleSubmit = async () => {
    if (!openTime || !closeTime || lateThresholdMinutes === '') {
      alert('모든 입력값을 채워주세요.');
      return;
    }

    if (new Date(openTime) >= new Date(closeTime)) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    try {
      await studyApi.startAttendanceCheck(studyId, sessionId, {
        openTime: new Date(openTime).toISOString(),
        closeTime: new Date(closeTime).toISOString(),
        lateThresholdMinutes: Number(lateThresholdMinutes),
      });
      alert('출석 체크가 시작되었습니다.');
      onClose();
    } catch (err: any) {
      Logger.error('Failed to start attendance check', err);
      alert('출석 체크 시작에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-NanumSquare text-black">
      <div className="bg-gray-100 rounded-xl p-8 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">출석 체크 시작</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">출석 시작 시간</label>
          <input
            type="datetime-local"
            className="w-full p-2 border rounded"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">출석 마감 시간</label>
          <input
            type="datetime-local"
            className="w-full p-2 border rounded"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">지각 기준 시간 (마감 전 몇 분까지 지각인가요?)</label>
          <input
            type="number"
            min="0"
            placeholder="지각 기준 시간(분) 예: 10"
            className="w-full p-2 border rounded"
            value={lateThresholdMinutes}
            onChange={(e) => setLateThresholdMinutes(e.target.value ? Number(e.target.value) : '')}
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
            Start Check
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCheckModal;
