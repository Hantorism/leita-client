import { studyApi, studySessionApi } from '@apis';
import type { Study, StudyMemberAssignment, StudyMemberAttendance, StudySession } from '@types';
import { Logger } from '@utils';
import { useEffect, useState } from 'react';

interface CompletionAdminProps {
  study: Study;
}

const CompletionAdmin = ({ study }: CompletionAdminProps) => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [attendances, setAttendances] = useState<StudyMemberAttendance[]>([]);
  const [assignments, setAssignments] = useState<StudyMemberAssignment[]>([]);

  const regularMembers = study.members.filter((m) => m.role !== 'ADMIN');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sessionsRes, attRes, asgRes] = await Promise.all([
          studySessionApi.getStudySessions(study.id),
          studyApi.getMemberAttendance(study.id),
          studyApi.getMemberAssignment(study.id),
        ]);

        const sessionsData = sessionsRes.data?.content || sessionsRes || [];
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);

        const attData = attRes.data || attRes || [];
        setAttendances(Array.isArray(attData) ? attData : []);

        const asgData = asgRes.data || asgRes || [];
        setAssignments(Array.isArray(asgData) ? asgData : []);
      } catch (error) {
        Logger.error('Failed to fetch completion data for admin', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [study.id]);

  if (loading) return <div className="text-gray-400 p-6 text-center">전체 수료 정보를 불러오는 중입니다...</div>;
  if (regularMembers.length === 0)
    return <div className="text-gray-500 text-center py-10">스터디에 등록된 멤버가 없습니다.</div>;

  const totalSessions = sessions.length;
  const totalAssignments = sessions.filter((s) => s.assignmentCreated).length;

  const reqText = study.requirement || '';
  const extractPercentage = (text: string, keyword: string) => {
    const regex = new RegExp(`${keyword}.*?(\\d{1,3})%`, 'i');
    const match = text.match(regex);
    if (match) return parseInt(match[1], 10);
    const generalMatch = text.match(/(\\d{1,3})%/);
    if (generalMatch) return parseInt(generalMatch[1], 10);
    return 80; // default 80%
  };

  const attendanceThreshold = extractPercentage(reqText, '출석');
  const assignmentThreshold = extractPercentage(reqText, '과제');

  // Thresholds
  const reqAtt = Math.ceil(totalSessions * (attendanceThreshold / 100));
  const maxAllowedAbsences = study.maxAbsences ?? totalSessions - reqAtt;
  const reqAsg = Math.ceil(totalAssignments * (assignmentThreshold / 100));
  const maxAllowedIncompleteAsg = study.maxIncompleteAsg ?? totalAssignments - reqAsg;

  // Process timeline
  const evaluatedAttendances = sessions.filter((s) => s.attendanceStatus === 'CLOSED').length;
  const pastSessions = sessions.filter((s) => new Date(s.endDateTime) < new Date() && s.assignmentCreated);

  const getWarningText = (remaining: number, type: string) => {
    if (remaining <= 0) return `🚨 미달 (${type} 초과)`;
    if (remaining === 1) return `⚠️ 한 번 더 ${type} 시 수료 불가`;
    return `💡 앞으로 ${remaining}번 더 ${type} 시 수료 불가`;
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      <div className="bg-[#1f1f1f] rounded-xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">👨‍🏫 멤버 수료 현황</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#CAFE33] bg-[#CAFE33]/10 px-3 py-1 rounded-full border border-[#CAFE33]/20">
              총 멤버 {regularMembers.length}명
            </span>
            <div className="flex gap-2">
              <span className="text-[11px] bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-md font-medium">
                결석 {maxAllowedAbsences}회 허용
              </span>
              <span className="text-[11px] bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-md font-medium">
                과제 {maxAllowedIncompleteAsg}회 미제출 허용
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regularMembers.map((member) => {
            const memberAtt = attendances.find((a) => a.user.email === member.email);
            const memberAsg = assignments.find((a) => a.user.email === member.email);

            const validAttendances =
              memberAtt?.attendances?.filter((a) => a.status === 'PRESENT' || a.status === 'LATE') || [];
            const attendanceRate = totalSessions > 0 ? (validAttendances.length / totalSessions) * 100 : 0;

            const completedAssignments = memberAsg?.assignments?.filter((a) => a.isCompleted) || [];
            const assignmentRate = totalAssignments > 0 ? (completedAssignments.length / totalAssignments) * 100 : 0;

            return (
              <div
                key={member.userId}
                className="bg-[#2a2a2a] border border-gray-700/50 rounded-lg p-5 flex flex-col hover:border-gray-500 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4 border-b border-gray-700/50 pb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-gray-200 truncate">{member.name}</span>
                    <span className="text-xs text-gray-500 truncate">{member.email}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">출석률</span>
                    <span className="text-sm font-medium text-white">
                      {Math.round(attendanceRate)}% ({validAttendances.length}/{totalSessions})
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${attendanceRate}%` }}
                    ></div>
                  </div>
                  {totalSessions > 0 && (
                    <span
                      className={`text-[10px] font-medium ${maxAllowedAbsences - Math.max(0, evaluatedAttendances - validAttendances.length) + 1 <= 1 ? 'text-red-400' : 'text-gray-500'}`}
                    >
                      {getWarningText(
                        maxAllowedAbsences - Math.max(0, evaluatedAttendances - validAttendances.length) + 1,
                        '결석',
                      )}
                    </span>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">과제 수행률</span>
                    <span className="text-sm font-medium text-white">
                      {Math.round(assignmentRate)}% ({completedAssignments.length}/{totalAssignments})
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${assignmentRate}%` }}
                    ></div>
                  </div>
                  {totalAssignments > 0 && (
                    <span
                      className={`text-[10px] font-medium ${maxAllowedIncompleteAsg - Math.max(0, pastSessions.length - completedAssignments.length) + 1 <= 1 ? 'text-red-400' : 'text-gray-500'}`}
                    >
                      {getWarningText(
                        maxAllowedIncompleteAsg - Math.max(0, pastSessions.length - completedAssignments.length) + 1,
                        '미완료',
                      )}
                    </span>
                  )}
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
