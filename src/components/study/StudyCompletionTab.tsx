import { CompletionAdmin, CompletionMember } from '@components';
import type { Study } from '@types';

interface StudyCompletionTabProps {
  study: Study;
  isAdmin: boolean;
  currentUserEmail: string | null;
}

const StudyCompletionTab = ({ study, isAdmin, currentUserEmail }: StudyCompletionTabProps) => {
  if (isAdmin) {
    return <CompletionAdmin study={study} />;
  }

  if (currentUserEmail) {
    return (
      <CompletionMember
        study={study}
        currentUserEmail={currentUserEmail}
      />
    );
  }

  return <div className="text-gray-400 p-6 text-center">로그인이 필요합니다.</div>;
};

export default StudyCompletionTab;
