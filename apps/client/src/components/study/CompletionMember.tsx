import type { Study, StudyCompletionResponse } from '@leita/types';

interface CompletionMemberProps {
  study: Study;
  currentUserEmail: string;
  completionData: StudyCompletionResponse;
}

const CompletionMember = ({ study, currentUserEmail, completionData }: CompletionMemberProps) => {
  const { memberCompletions, attendanceThreshold, assignmentThreshold } = completionData;

  const myData = memberCompletions.find(
    (m) => m.email.toLowerCase().trim() === currentUserEmail.toLowerCase().trim()
  );

  if (!myData) return <div className="text-gray-400 p-6">접근 권한이 없거나 멤버 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      <div className="bg-[var(--color-bg-card)] rounded-xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">🎓 나의 수료 현황</h2>
            {myData.isCompleted && (
              <span className="bg-[#CAFE33] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Completed</span>
            )}
          </div>
          <div className="flex gap-2">
            <span className="text-sm bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-md font-medium">
              출석 기준 {attendanceThreshold}%
            </span>
            <span className="text-sm bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-md font-medium">
              과제 기준 {assignmentThreshold}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 출석 게이지 */}
          <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-gray-700/50 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-300 font-medium mb-1">출석률</h3>
              <div className="flex items-end gap-2 mb-3">
                <span className={`text-3xl font-bold ${myData.attendanceRate >= attendanceThreshold ? 'text-[#CAFE33]' : 'text-white'}`}>
                  {myData.attendanceRate}%
                </span>
                <span className="text-gray-500 text-sm mb-1">
                  ({myData.attendanceCount} / {myData.totalSessions})
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 mt-auto overflow-hidden border border-gray-900">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${myData.attendanceRate}%` }}
              ></div>
            </div>
          </div>

          {/* 과제 게이지 */}
          <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-gray-700/50 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-300 font-medium mb-1">과제 수행률</h3>
              <div className="flex items-end gap-2 mb-3">
                <span className={`text-3xl font-bold ${myData.assignmentRate >= assignmentThreshold ? 'text-[#CAFE33]' : 'text-white'}`}>
                  {myData.assignmentRate}%
                </span>
                <span className="text-gray-500 text-sm mb-1">
                  ({myData.completedAssignments} / {myData.totalAssignments})
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 mt-auto overflow-hidden border border-gray-900">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${myData.assignmentRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionMember;
