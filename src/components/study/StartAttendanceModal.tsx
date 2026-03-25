import { useState } from 'react';
import { studyApi, studySessionApi } from '@apis';
import { Logger } from '@utils';
import { useAlert } from '@contexts';

interface StartAttendanceModalProps {
  studyId: number;
  sessionId: number;
  initialOpenTime: string;
  initialCloseTime: string;
  onClose: () => void;
}

const StartAttendanceModal = ({
  studyId,
  sessionId,
  initialOpenTime,
  initialCloseTime,
  onClose
}: StartAttendanceModalProps) => {
  const { showAlert } = useAlert();
  // datetime-local input requires YYYY-MM-DDTHH:mm format
  const formatForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [openTime, setOpenTime] = useState(formatForInput(initialOpenTime));
  const [closeTime, setCloseTime] = useState(formatForInput(initialCloseTime));
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState<number>(10);

  const handleSubmit = async () => {
    if (!openTime || !closeTime) {
      showAlert('info', '출석 시작 시간과 마감 시간을 모두 입력해주세요.');
      return;
    }

    if (new Date(openTime) >= new Date(closeTime)) {
      showAlert('info', '종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    try {
      await studySessionApi.openAttendance(sessionId, {
        openTime: new Date(openTime).toISOString(),
        closeTime: new Date(closeTime).toISOString(),
        lateThresholdMinutes,
      });
      showAlert('success', '출석 체크가 시작되었습니다.');
      onClose();
    } catch (err: any) {
      Logger.error('Failed to start attendance check', err);
      showAlert('error', '출석 체크 시작에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 transition-all duration-300 animate-fadeIn">
      <div className="bg-[#2A2A2A] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl overflow-hidden">
        <h2 className="text-2xl font-bold mb-6 text-[#CAFF33]">출석 체크 시작</h2>

        <div className="space-y-5 text-white">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">출석 시작 시간</label>
            <input
              type="datetime-local"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#CAFF33] transition-colors"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">출석 마감 시간</label>
            <input
              type="datetime-local"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#CAFF33] transition-colors"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">지각 기준 시간 (출석 시작 후)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#CAFF33] transition-colors pr-10"
                value={lateThresholdMinutes}
                onChange={(e) => setLateThresholdMinutes(e.target.value ? Number(e.target.value) : 0)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">분</span>
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
            Start Check
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartAttendanceModal;
