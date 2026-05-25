import { studySessionApi } from '@leita/api';
import { Modal } from '@components';
import { useAlert } from '@contexts';
import { extractErrorMessage, Logger } from '@utils';
import { useState } from 'react';

interface CreateAttendanceModalProps {
  studyId: number;
  sessionId: number;
  initialOpenTime: string;
  initialCloseTime: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateAttendanceModal = ({
  studyId,
  sessionId,
  initialOpenTime,
  initialCloseTime,
  onClose,
  onSuccess,
}: CreateAttendanceModalProps) => {
  const { showAlert } = useAlert();

  const formatForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [openTime, setOpenTime] = useState(formatForInput(initialOpenTime));

  const getDefaultCloseTime = (startTimeStr: string) => {
    if (!startTimeStr) return '';
    const date = new Date(startTimeStr);
    date.setHours(date.getHours() + 1);
    return formatForInput(date.toISOString());
  };

  const [closeTime, setCloseTime] = useState(getDefaultCloseTime(initialOpenTime));
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
      onSuccess?.();
      onClose();
    } catch (err) {
      Logger.error('Failed to start attendance check', err);
      showAlert('error', '출석 체크 시작에 실패했습니다: ' + extractErrorMessage(err));
    }
  };

  return (
    <Modal
      title="출석 체크 시작"
      onClose={onClose}
      buttons={[
        { text: '출석 시작', variant: 'primary', onClick: handleSubmit },
        { text: '취소', variant: 'secondary', onClick: onClose },
      ]}
    >
      <div className="space-y-5 text-white">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">출석 시작 시간</label>
          <input
            type="datetime-local"
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-brand)] transition-colors [color-scheme:dark]"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">출석 마감 시간</label>
          <input
            type="datetime-local"
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-brand)] transition-colors [color-scheme:dark]"
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
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-brand)] transition-colors pr-10"
              value={lateThresholdMinutes}
              onChange={(e) => setLateThresholdMinutes(e.target.value ? Number(e.target.value) : 0)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">분</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateAttendanceModal;
