import { studyApi } from '@apis';
import { Modal } from '@components';
import { useAlert } from '@contexts';
import { extractErrorMessage, Logger } from '@utils';

interface JoinStudyModalProps {
  study: any;
  onClose: () => void;
}

const JoinStudyModal = ({ study, onClose }: JoinStudyModalProps) => {
  if (!study) return null;
  const { showAlert } = useAlert();

  const handleJoin = async () => {
    try {
      await studyApi.joinStudy(study.id);
      showAlert('success', '가입 요청을 전송했습니다.');
      onClose();
    } catch (err) {
      Logger.error('Failed to join study:', err);
      showAlert('error', '가입 요청 중 오류가 발생했습니다: ' + extractErrorMessage(err));
    }
  };

  return (
    <Modal
      title={study.title}
      onClose={onClose}
      buttons={[
        { text: '가입 신청', variant: 'primary', onClick: handleJoin },
        { text: '취소', variant: 'secondary', onClick: onClose },
      ]}
    >
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">{study.description}</p>
        <div className="bg-[var(--color-bg-surface)] rounded-xl p-4 text-left">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1 font-bold">모집 조건</p>
          <p className="text-sm text-gray-200">{study.requirement || '제한 없음'}</p>
        </div>
      </div>
    </Modal>
  );
};

export default JoinStudyModal;
