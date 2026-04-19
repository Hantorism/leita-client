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
      showAlert('success', '가입 요청을 전송했습니다. 관리자의 승인을 기다려주세요.');
      onClose();
    } catch (err) {
      Logger.error('Failed to join study:', err);
      showAlert('error', '가입 요청 중 오류가 발생했습니다: ' + extractErrorMessage(err));
    }
  };

  return (
    <Modal
      title=""
      onClose={onClose}
      buttons={[
        { text: '가입 신청하기', variant: 'primary', onClick: handleJoin },
        { text: '나중에 할래요', variant: 'secondary', onClick: onClose },
      ]}
    >
      <div className="flex flex-col gap-8 py-4">
        {/* 헤더 섹션 */}
        <div className="flex flex-col gap-3 text-center">
          <div className="mx-auto w-16 h-16 rounded-[1.5rem] bg-[#CAFE33]/10 flex items-center justify-center mb-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CAFE33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            Join Study
          </h2>
          <p className="text-[#CAFE33] font-bold text-lg tracking-tight line-clamp-1 px-4">
            {study.title}
          </p>
        </div>

        {/* 정보 섹션 */}
        <div className="flex flex-col gap-4">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Description</h4>
            <p className="text-gray-300 text-sm leading-relaxed font-medium">
              {study.description || '스터디에 대한 상세 설명이 없습니다.'}
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Requirement</h4>
            <div className="flex items-start gap-3">
              <div className="mt-1 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CAFE33" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-gray-200 text-sm font-bold">
                {study.requirement || '누구나 참여 가능합니다.'}
              </p>
            </div>
          </div>
        </div>

        {/* 안내 문구 */}
        <p className="text-center text-xs text-gray-600 font-medium">
          가입 신청 후 관리자가 승인하면 스터디 활동이 가능합니다.
        </p>
      </div>
    </Modal>
  );
};

export default JoinStudyModal;
