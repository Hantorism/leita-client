import { studySessionApi } from '@apis';
import { Modal } from '@components';
import { useAlert } from '@contexts';
import { extractErrorMessage, Logger } from '@utils';
import { useState } from 'react';

interface CreateStudySessionModalProps {
  studyId: number;
  onClose: () => void;
  onCreated: () => void;
}

const CreateStudySessionModal = ({ studyId, onClose, onCreated }: CreateStudySessionModalProps) => {
  const { showAlert } = useAlert();

  const formatForInput = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDateTime, setStartDateTime] = useState(formatForInput(new Date()));
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
      await studySessionApi.createStudySession({
        studyId,
        title,
        description: description || null,
        startDateTime: new Date(startDateTime).toISOString(),
        endDateTime: new Date(endDateTime).toISOString(),
      });
      showAlert('success', '세션이 성공적으로 생성되었습니다.');
      onCreated();
      onClose();
    } catch (err) {
      Logger.error('Failed to create session', err);
      showAlert('error', '세션 생성에 실패했습니다: ' + extractErrorMessage(err));
    }
  };

  return (
    <Modal
      title="새 세션 생성"
      onClose={onClose}
      buttons={[
        { text: '세션 생성', variant: 'primary', onClick: handleSubmit },
        { text: '취소', variant: 'secondary', onClick: onClose },
      ]}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">세션 제목</label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-[var(--color-brand)]/50 transition"
            placeholder="예: 1회차 세션"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">설명 (선택)</label>
          <textarea
            className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-[var(--color-brand)]/50 transition resize-none h-20"
            placeholder="세션에 대한 설명을 입력하세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">시작 시간</label>
          <input
            type="datetime-local"
            className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-[var(--color-brand)]/50 transition [color-scheme:dark]"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">종료 시간</label>
          <input
            type="datetime-local"
            className="w-full px-4 py-3 bg-[var(--color-bg-surface)] border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-[var(--color-brand)]/50 transition [color-scheme:dark]"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CreateStudySessionModal;
