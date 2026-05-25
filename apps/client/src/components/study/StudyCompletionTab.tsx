import { studyApi } from '@leita/api';
import { CompletionAdmin, CompletionMember, Button } from '@components';
import { useAlert } from '@contexts';
import type { Study, StudyCompletionResponse } from '@leita/types';
import { Logger } from '@utils';
import { useEffect, useState } from 'react';

interface StudyCompletionTabProps {
  study: Study;
  isAdmin: boolean;
  currentUserEmail: string | null;
  onRequirementUpdated?: () => void;
}

const StudyCompletionTab = ({ study, isAdmin, currentUserEmail, onRequirementUpdated }: StudyCompletionTabProps) => {
  const { showAlert } = useAlert();
  const [completionData, setCompletionData] = useState<StudyCompletionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [newRequirement, setNewRequirement] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCompletion = async () => {
    setLoading(true);
    try {
      const data = await studyApi.getCompletionStatus(study.id);
      setCompletionData(data);
    } catch (error) {
      Logger.error('Failed to fetch completion status', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletion();
  }, [study.id]);

  const handleUpdateRequirement = async () => {
    if (!newRequirement.trim()) {
      showAlert('info', '수료 조건을 입력해주세요.');
      return;
    }
    setIsUpdating(true);
    try {
      await studyApi.updateStudy(study.id, {
        ...study,
        requirement: newRequirement,
      });
      showAlert('success', '수료 조건이 저장되었습니다.');
      fetchCompletion();
      onRequirementUpdated?.();
    } catch (error) {
      Logger.error('Failed to update requirement', error);
      showAlert('error', '수료 조건 저장에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="text-gray-400 p-6 text-center">수료 정보를 불러오는 중...</div>;

  if (completionData && !completionData.hasRequirement) {
    if (isAdmin) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-bg-card)] rounded-[2rem] border border-dashed border-white/10 gap-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">수료 조건이 설정되지 않았습니다</h3>
            <p className="text-gray-500">멤버들의 수료 여부를 계산하기 위해 조건을 입력해주세요.</p>
          </div>
          <div className="w-full max-w-md px-6">
            <input
              type="text"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#CAFE33]/50 transition mb-4"
              placeholder="예: 출석 80%, 과제 80%"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
            />
            <Button
              variant="primary"
              className="w-full py-3 rounded-xl font-bold"
              onClick={handleUpdateRequirement}
              disabled={isUpdating}
            >
              {isUpdating ? '저장 중...' : '수료 조건 저장'}
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-bg-card)] rounded-[2rem] border border-dashed border-white/10">
        <p className="text-gray-500 text-xl font-bold text-center px-6">
          스터디장이 아직 수료 조건을 설정하지 않았습니다.<br/>설정 전까지는 수료 현황을 확인할 수 없습니다.
        </p>
      </div>
    );
  }

  if (isAdmin) {
    return <CompletionAdmin study={study} completionData={completionData!} />;
  }

  if (currentUserEmail) {
    return (
      <CompletionMember
        study={study}
        currentUserEmail={currentUserEmail}
        completionData={completionData!}
      />
    );
  }

  return <div className="text-gray-400 p-6 text-center">로그인이 필요합니다.</div>;
};

export default StudyCompletionTab;
