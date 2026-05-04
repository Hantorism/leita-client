import { studyApi } from '@apis';
import { Button } from '@components';
import { useAlert } from '@contexts';
import type { Study, StudyUser } from '@types';
import { getCurrentUserEmail } from '@utils';

interface StudyMemberTabProps {
  study: Study;
  isAdmin: boolean;
  onMemberUpdated: () => void;
}

const StudyMemberTab = ({ study, isAdmin, onMemberUpdated }: StudyMemberTabProps) => {
  const { showAlert } = useAlert();

  const admins = study.members?.filter((m: StudyUser) => m.role === 'ADMIN') || [];
  const members = study.members?.filter((m: StudyUser) => m.role === 'MEMBER') || [];
  const pendings = study.members?.filter((m: StudyUser) => m.role === 'PENDING') || [];

  const currentUserEmail = getCurrentUserEmail();

  const handleApprove = async (email: string) => {
    try {
      await studyApi.approveMember(study.id, email);
      showAlert('success', '멤버 가입을 승인했습니다.');
      onMemberUpdated();
    } catch (err) {
      showAlert('error', '승인 처리에 실패했습니다.');
    }
  };

  const handleDeny = async (email: string) => {
    try {
      await studyApi.denyMember(study.id, email);
      showAlert('success', '멤버 가입을 거절했습니다.');
      onMemberUpdated();
    } catch (err) {
      showAlert('error', '거절 처리에 실패했습니다.');
    }
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* 관리자 섹션 */}
      <div className="bg-[var(--color-bg-surface)] border border-gray-700 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-6">관리자</h2>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {admins.map((admin: StudyUser, i: number) => (
            <li
              key={i}
              className="flex items-center gap-4 bg-black bg-opacity-20 p-5 rounded-lg border border-gray-800 transition-colors"
            >
              <div className="w-12 h-12 shrink-0 rounded-full border-2 border-[var(--color-brand)] bg-gray-700 flex items-center justify-center font-bold text-white uppercase text-lg shadow-sm">
                {admin.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="block font-medium text-lg truncate text-gray-100">{admin.name}</span>
                <span className="block text-sm text-gray-400 truncate">{admin.email}</span>
              </div>
            </li>
          ))}
          {admins.length === 0 && <li className="text-gray-500 text-sm pl-1 col-span-2">관리자가 없습니다.</li>}
        </ul>
      </div>

      {/* 일반 멤버 섹션 */}
      <div className="bg-[var(--color-bg-surface)] border border-gray-700 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-6">일반 멤버</h2>
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {members.map((member: StudyUser, i: number) => (
            <li
              key={i}
              className="flex items-center gap-4 bg-black bg-opacity-20 p-5 rounded-lg border border-gray-800 transition-colors"
            >
              <div className="w-12 h-12 shrink-0 rounded-full bg-gray-600 flex items-center justify-center font-bold text-gray-300 uppercase text-lg">
                {member.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="block font-medium text-lg truncate text-gray-100">{member.name}</span>
                <span className="block text-sm text-gray-400 truncate">{member.email}</span>
              </div>
            </li>
          ))}
          {members.length === 0 && <li className="text-gray-500 text-sm pl-1 col-span-2">일반 멤버가 없습니다.</li>}
        </ul>
      </div>

      {/* 가입 대기 멤버 섹션 (관리자 전용) */}
      {isAdmin && (
        <div className="bg-[var(--color-bg-surface)] border border-gray-700 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-[var(--color-brand)]">가입 대기 멤버</h2>
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendings.map((user: StudyUser, i: number) => (
              <li
                key={i}
                className="flex items-center justify-between gap-4 bg-black bg-opacity-20 p-5 rounded-lg border border-gray-800 hover:border-[var(--color-brand)] hover:border-opacity-50 transition-all duration-300"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-gray-600 flex items-center justify-center font-bold text-gray-200 uppercase text-lg shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="block font-medium text-lg truncate text-gray-100">{user.name}</span>
                    <span className="block text-sm text-gray-400 truncate">{user.email}</span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleDeny(user.email)}
                    className="hover:bg-red-500"
                  >
                    거절
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(user.email)}
                  >
                    승인
                  </Button>
                </div>
              </li>
            ))}
            {pendings.length === 0 && (
              <li className="text-gray-500 text-sm pl-1 col-span-2">가입 대기 중인 멤버가 없습니다.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StudyMemberTab;
