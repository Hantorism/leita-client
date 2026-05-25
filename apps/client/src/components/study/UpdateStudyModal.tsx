import { studyApi } from '@leita/api';
import { Modal } from '@components';
import { useAlert } from '@contexts';
import type { Study } from '@leita/types';
import { extractErrorMessage, Logger } from '@utils';
import { useState } from 'react';

interface UpdateStudyModalProps {
  study: Study;
  onClose: () => void;
  onUpdated: () => void;
}

const UpdateStudyModal = ({ study, onClose, onUpdated }: UpdateStudyModalProps) => {
  const { showAlert } = useAlert();
  const [title, setTitle] = useState(study.title);
  const [description, setDescription] = useState(study.description);
  const [requirement, setRequirement] = useState(study.requirement || '');
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };
  const [startDate, setStartDate] = useState(formatDate(study.startDate));
  const [endDate, setEndDate] = useState(formatDate(study.endDate));

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !startDate || !endDate) {
      showAlert('info', '모든 필드를 입력해주세요.');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      showAlert('info', '스터디 종료일은 시작일보다 늦어야 합니다.');
      return;
    }

    const payload = { title, description, requirement: requirement || null, startDate, endDate };

    try {
      await studyApi.updateStudy(study.id, payload);
      showAlert('success', '수정 완료되었습니다!');
      onClose();
      onUpdated();
    } catch (err) {
      Logger.error('Update Error:', err);
      showAlert('error', '수정 실패: ' + extractErrorMessage(err));
    }
  };

  return (
    <Modal
      title="스터디 수정"
      onClose={onClose}
      buttons={[
        { text: '스터디 수정', variant: 'primary', onClick: handleSubmit },
        { text: '취소', variant: 'secondary', onClick: onClose },
      ]}
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">스터디 이름</label>
          <input
            className="w-full px-4 py-2.5 bg-[var(--color-bg-surface)] border border-gray-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-brand)]/50 transition"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">상세 설명</label>
          <textarea
            className="w-full px-4 py-2.5 bg-[var(--color-bg-surface)] border border-gray-700/50 rounded-xl text-white placeholder-gray-600 resize-none focus:outline-none focus:border-[var(--color-brand)]/50 transition"
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">수료 조건 (선택)</label>
          <input
            className="w-full px-4 py-2.5 bg-[var(--color-bg-surface)] border border-gray-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-brand)]/50 transition"
            placeholder="예: 출석 80%, 과제 80%"
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">시작일</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-[var(--color-bg-surface)] border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-[var(--color-brand)]/50 transition text-sm [color-scheme:dark]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">종료일</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-[var(--color-bg-surface)] border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-[var(--color-brand)]/50 transition text-sm [color-scheme:dark]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UpdateStudyModal;
