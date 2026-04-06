import { studyApi, studySessionApi } from '@apis';
import type { Study, StudyMemberAssignment, StudyMemberAttendance, StudySession } from '@types';
import { Logger } from '@utils';
import { useEffect, useState } from 'react';

interface CompletionMemberProps {
  study: Study;
  currentUserEmail: string;
}

const CompletionMember = ({ study, currentUserEmail }: CompletionMemberProps) => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [attendance, setAttendance] = useState<StudyMemberAttendance | null>(null);
  const [assignment, setAssignment] = useState<StudyMemberAssignment | null>(null);

  const me = study.members.find((m) => m.email.toLowerCase().trim() === currentUserEmail.toLowerCase().trim());

  useEffect(() => {
    const fetchData = async () => {
      if (!me) return;
      setLoading(true);
      try {
        const [sessionsRes, attRes, asgRes] = await Promise.all([
          studySessionApi.getStudySessions(study.id),
          studyApi.getMemberAttendance(study.id, undefined, me.userId),
          studyApi.getMemberAssignment(study.id, undefined, me.userId),
        ]);

        const sessionsData = sessionsRes.data?.content || sessionsRes || [];
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);

        const attData = attRes.data || attRes || [];
        const myAtt = Array.isArray(attData) ? attData.find((a: any) => a.user.email === me.email) : null;
        setAttendance(myAtt || null);

        const asgData = asgRes.data || asgRes || [];
        const myAsg = Array.isArray(asgData) ? asgData.find((a: any) => a.user.email === me.email) : null;
        setAssignment(myAsg || null);
      } catch (error) {
        Logger.error('Failed to fetch completion data for member', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [study.id, me]);

  if (!me) return <div className="text-gray-400 p-6">접근 권한이 없습니다.</div>;
  if (loading) return <div className="text-gray-400 p-6 text-center">수료 정보를 불러오는 중입니다...</div>;

  // Calculate metrics
  const totalSessions = sessions.length;
  const attendedRecords = attendance?.attendances || [];
  const validAttendances = attendedRecords.filter((a) => a.status === 'PRESENT' || a.status === 'LATE');
  const attendanceRate = totalSessions > 0 ? (validAttendances.length / totalSessions) * 100 : 0;

  const totalAssignments = sessions.filter((s) => s.assignmentCreated).length;
  const assignmentRecords = assignment?.assignments || [];
  const completedAssignments = assignmentRecords.filter((a) => a.isCompleted);
  const assignmentRate = totalAssignments > 0 ? (completedAssignments.length / totalAssignments) * 100 : 0;

  // Calculate specific thresholds dynamically
  const reqText = study.requirement || '';
  const extractPercentage = (text: string, keyword: string) => {
    const regex = new RegExp(`${keyword}.*?(\\d{1,3})%`, 'i');
    const match = text.match(regex);
    if (match) return parseInt(match[1], 10);
    const generalMatch = text.match(/(\d{1,3})%/);
    if (generalMatch) return parseInt(generalMatch[1], 10);
    return 80; // default 80%
  };

  const attendanceThreshold = extractPercentage(reqText, '출석');
  const assignmentThreshold = extractPercentage(reqText, '과제');

  // Attendance Warnings
  const reqAtt = Math.ceil(totalSessions * (attendanceThreshold / 100));
  const maxAllowedAbsences = study.maxAbsences ?? totalSessions - reqAtt;
  const evaluatedAttendances = sessions.filter((s) => s.attendanceStatus === 'CLOSED').length;
  const currentAbsences = Math.max(0, evaluatedAttendances - validAttendances.length);
  const remainingAbsencesBeforeFail = maxAllowedAbsences - currentAbsences + 1;

  // Assignment Warnings
  const reqAsg = Math.ceil(totalAssignments * (assignmentThreshold / 100));
  const maxAllowedIncompleteAsg = study.maxIncompleteAsg ?? totalAssignments - reqAsg;
  const pastSessions = sessions.filter((s) => new Date(s.endDateTime) < new Date() && s.assignmentCreated);
  const currentIncompleteAsg = Math.max(0, pastSessions.length - completedAssignments.length);
  const remainingIncompleteAsgBeforeFail = maxAllowedIncompleteAsg - currentIncompleteAsg + 1;

  const getWarningText = (remaining: number, type: '결석' | '과제 미완료') => {
    if (remaining <= 0) return `🚨 이미 수료 기준을 미달했습니다. (${type} 초과)`;
    if (remaining === 1) return `⚠️ 한 번 더 ${type} 시 수료가 불가합니다.`;
    return `💡 앞으로 ${remaining}번 더 ${type} 시 수료가 불가합니다.`;
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      <div className="bg-[#1f1f1f] rounded-xl border border-gray-700/50 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-6">
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">🎓 나의 수료 현황</h2>
          <div className="flex gap-2">
            <span className="text-[11px] bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-md font-medium">
              결석 {maxAllowedAbsences}회 허용
            </span>
            <span className="text-[11px] bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-md font-medium">
              과제 {maxAllowedIncompleteAsg}회 미제출 허용
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 출석 게이지 */}
          <div className="bg-[#2a2a2a] rounded-lg p-5 border border-gray-700/50 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-300 font-medium mb-1">출석률</h3>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold text-white">{Math.round(attendanceRate)}%</span>
                <span className="text-gray-500 text-sm mb-1">
                  ({validAttendances.length} / {totalSessions})
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 mt-auto overflow-hidden border border-gray-900">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${attendanceRate}%` }}
              ></div>
            </div>
            {totalSessions > 0 && (
              <p
                className={`mt-3 text-xs font-medium ${remainingAbsencesBeforeFail <= 1 ? 'text-red-400' : 'text-gray-400'}`}
              >
                {getWarningText(remainingAbsencesBeforeFail, '결석')}
              </p>
            )}
          </div>

          {/* 과제 게이지 */}
          <div className="bg-[#2a2a2a] rounded-lg p-5 border border-gray-700/50 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-300 font-medium mb-1">과제 수행률</h3>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold text-white">{Math.round(assignmentRate)}%</span>
                <span className="text-gray-500 text-sm mb-1">
                  ({completedAssignments.length} / {totalAssignments})
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 mt-auto overflow-hidden border border-gray-900">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${assignmentRate}%` }}
              ></div>
            </div>
            {totalAssignments > 0 && (
              <p
                className={`mt-3 text-xs font-medium ${remainingIncompleteAsgBeforeFail <= 1 ? 'text-red-400' : 'text-gray-400'}`}
              >
                {getWarningText(remainingIncompleteAsgBeforeFail, '과제 미완료')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionMember;
