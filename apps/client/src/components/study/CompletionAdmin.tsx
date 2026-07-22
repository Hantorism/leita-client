import type { Study, StudyCompletionResponse } from '@leita/types';
import { Icon } from '@iconify/react';

interface CompletionAdminProps {
  study: Study;
  completionData: StudyCompletionResponse;
}

const CompletionAdmin = ({ study, completionData }: CompletionAdminProps) => {
  const { memberCompletions, attendanceThreshold, assignmentThreshold } = completionData;

  if (memberCompletions.length === 0)
    return <div className="text-gray-500 text-center py-10">스터디에 등록된 멤버가 없습니다.</div>;

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      <div className="bg-[var(--color-bg-card)] rounded-xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Icon icon="mdi:account-school" className="text-xl text-[var(--color-brand)]" /> 멤버 수료 현황
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--color-brand)] bg-[var(--color-brand)]/10 px-3 py-1 rounded-full border border-[var(--color-brand)]/20">
              총 멤버 {memberCompletions.length}명
            </span>
            <div className="flex gap-2">
              <span className="text-sm bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-md font-medium">
                출석 기준 {attendanceThreshold}%
              </span>
              <span className="text-sm bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-md font-medium">
                과제 기준 {assignmentThreshold}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberCompletions.map((member) => {
            return (
              <div
                key={member.userId}
                className={`bg-[var(--color-bg-surface)] border rounded-lg p-5 flex flex-col hover:border-gray-500 transition-colors ${member.isCompleted ? 'border-[#CAFE33]/30' : 'border-gray-700/50'}`}
              >
                <div className="flex items-center justify-between mb-4 border-b border-gray-700/50 pb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-gray-200 truncate">{member.name}</span>
                      <span className="text-sm text-gray-500 truncate">{member.email}</span>
                    </div>
                  </div>
                  {member.isCompleted && (
                    <span className="shrink-0 bg-[#CAFE33] text-black text-[10px] font-black px-2 py-1 rounded uppercase">Completed</span>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">출석률</span>
                    <span className={`text-sm font-medium ${member.attendanceRate >= attendanceThreshold ? 'text-green-400' : 'text-white'}`}>
                      {member.attendanceRate}% ({member.attendanceCount}/{member.totalSessions})
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${member.attendanceRate}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-400">과제 수행률</span>
                    <span className={`text-sm font-medium ${member.assignmentRate >= assignmentThreshold ? 'text-blue-400' : 'text-white'}`}>
                      {member.assignmentRate}% ({member.completedAssignments}/{member.totalAssignments})
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${member.assignmentRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompletionAdmin;
