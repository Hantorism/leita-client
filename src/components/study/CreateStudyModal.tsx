import { studyApi } from '@apis';
import { Modal } from '@components';
import { useAlert } from '@contexts';
import { Logger } from '@utils';
import { useState } from 'react';

interface CreateStudyModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreateStudyModal = ({ onClose, onCreated }: CreateStudyModalProps) => {
  const { showAlert } = useAlert();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirement, setRequirement] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !requirement.trim() || !startDate || !endDate) {
      showAlert('info', '모든 필드를 입력해주세요.');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      showAlert('info', '스터디 종료일은 시작일보다 늦어야 합니다.');
      return;
    }

    const payload = { title, description, requirement, startDate, endDate };

    try {
      await studyApi.createStudy(payload);
      showAlert('success', '생성 완료되었습니다!');
      onClose();
      onCreated();
    } catch (err: any) {
      Logger.error('API Error:', err);
      showAlert('error', '생성 실패: ' + (err.response?.data?.message || err.message || '알 수 없는 오류'));
    }
  };

  return (
    <Modal
      title="스터디 생성"
      onClose={onClose}
      buttons={[
        { text: '스터디 생성', variant: 'primary', onClick: handleSubmit },
        { text: '취소', variant: 'secondary', onClick: onClose },
      ]}
    >
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">스터디 이름</label>
          <input
            className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#CAFE33]/50 transition"
            placeholder="예: 알고리즘 정복 스터디"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">상세 설명</label>
          <textarea
            className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700/50 rounded-xl text-white placeholder-gray-600 resize-none focus:outline-none focus:border-[#CAFE33]/50 transition"
            placeholder="스터디의 자세한 설명을 적어주세요."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">모집 조건</label>
          <input
            className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#CAFE33]/50 transition"
            placeholder="예: C언어 경험자"
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">시작일</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-[#CAFE33]/50 transition text-sm [color-scheme:dark]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">종료일</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-[#CAFE33]/50 transition text-sm [color-scheme:dark]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateStudyModal;
