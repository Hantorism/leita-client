import { judgeApi, studyApi, studySessionApi } from '@apis';
import { Button } from '@components';
import { useAlert } from '@contexts';
import { useAssignmentProgress } from '@hooks';
import type { Study, StudySession } from '@types';
import {
  formatDate,
  formatDateTime,
  getCurrentUserEmail,
  getProblemStatusDetail,
  getSessionAssignmentStatus,
  Logger,
  type PagedResponse,
} from '@utils';
import { useEffect, useMemo, useRef, useState } from 'react';

// ── Searchable Dropdown Helper ──
const SearchableDropdown = ({ options, value, onChange, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt: any) => opt.label.toLowerCase().includes(search.toLowerCase()));
  const selectedOption = options.find((opt: any) => opt.value === value);

  return (
    <div
      className="relative w-full"
      ref={ref}
    >
      <div
        className="bg-[var(--color-bg-surface)] border border-gray-600 rounded-lg p-2.5 flex justify-between items-center cursor-pointer text-sm font-medium"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
        }}
      >
        <span className="truncate pr-2 text-gray-200">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="text-gray-400 text-sm text-opacity-50">▼</span>
      </div>
      {isOpen && (
        <div className="absolute top-12 left-0 w-full bg-[var(--color-bg-surface)] border border-gray-600 rounded-lg shadow-2xl z-40 max-h-60 flex flex-col overflow-hidden">
          <input
            type="text"
            className="bg-[var(--color-bg-card)] text-white p-2.5 border-b border-gray-600 text-sm outline-none placeholder-gray-500"
            placeholder="검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <div className="overflow-y-auto custom-scrollbar flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt: any) => (
                <div
                  key={opt.value}
                  className="p-2.5 hover:bg-[#3A3A3A] cursor-pointer text-sm truncate text-gray-300 transition-colors"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-500 text-sm text-center">결과 없음</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── StudyProgressDetail Component ──
interface StudyProgressDetailProps {
  study: Study;
  selectedMemberEmail: string;
  onMemberChange: (email: string) => void;
  selectedSessionId: number | '';
  onSessionChange: (id: number) => void;
  sessions: StudySession[];
}

const StudyProgressDetail = ({
  study,
  selectedMemberEmail,
  onMemberChange,
  selectedSessionId,
  onSessionChange,
  sessions,
}: StudyProgressDetailProps) => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  // Data states
  const [sessionDetail, setSessionDetail] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceInfo, setAttendanceInfo] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);

  const currentLoggedInEmail = getCurrentUserEmail();
  const isAdmin = study.members.find((m) => m.email.toLowerCase().trim() === currentLoggedInEmail)?.role === 'ADMIN';

  const assignmentProblemIds = useMemo(() => assignment?.problems?.map((p: any) => p.problemId) || [], [assignment]);
  const hookData = useAssignmentProgress(assignmentProblemIds);
  const isCurrentUser = selectedMemberEmail === currentLoggedInEmail;

  useEffect(() => {
    if (selectedSessionId === '' || !selectedMemberEmail) return;

    const fetchSessionData = async () => {
      setLoading(true);
      try {
        const currentSession = sessions.find((s) => s.id === selectedSessionId);
        setSessionDetail(currentSession || null);

        if (currentSession?.attendanceStatus === 'OPEN' || currentSession?.attendanceStatus === 'CLOSED') {
          try {
            const attRes = await studySessionApi.getAttendance(Number(selectedSessionId));
            const attData = attRes as any;
            setAttendanceInfo(attData);
            setAttendanceRecords(attData?.records || []);
          } catch {
            setAttendanceInfo(null);
            setAttendanceRecords([]);
          }
        } else {
          setAttendanceInfo(null);
          setAttendanceRecords([]);
        }

        // Always try fetching assignment data to ensure sync
        try {
          const asgRes = await studySessionApi.getAssignment(Number(selectedSessionId));
          const asgData = asgRes as any;
          setAssignment(asgData);

          // Fetch actual solving status for the selected member
          const memberRes = study.members
            .filter((m) => m.role !== 'ADMIN')
            .find((m) => m.email === selectedMemberEmail);

          if (memberRes && !isCurrentUser) {
            // If it's another member, use studyApi (Admin view)
            const statusRes = await studyApi.getMemberAssignment(study.id, Number(selectedSessionId), memberRes.userId);
            const statusData = statusRes as any;
            const memberStatus = statusData[0]?.assignments?.find(
              (a: any) => a.sessionId === Number(selectedSessionId),
            );

            if (memberStatus) {
              setAssignment((prev: any) => ({
                ...prev,
                problems: memberStatus.problems || [],
                status: memberStatus.status,
              }));
            }
          }
        } catch {
          setAssignment(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSessionData();
  }, [selectedSessionId, selectedMemberEmail, sessions]);

  const sortedSessionsForDropdown = [...sessions].sort(
    (a: any, b: any) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime(),
  );
  const sessionOptions = sortedSessionsForDropdown.map((s) => {
    const originalIdx = sessions.findIndex((orig) => orig.id === s.id);
    return {
      value: s.id,
      label: `${originalIdx + 1}회차 세션 (${formatDate(s.startDateTime)})`,
    };
  });

  const memberOptions = study.members
    .filter((m) => m.role !== 'ADMIN')
    .map((m) => ({
      value: m.email,
      label: `${m.name} (${m.email})`,
    }));

  const userAttRecord = attendanceRecords.find((r) => r.userEmail === selectedMemberEmail);
  const userAttendanceStatus = userAttRecord
    ? userAttRecord.status
    : !sessionDetail?.attendanceStatus
      ? '미진행'
      : '결석/미출석';

  const handleUpdateAttendance = async (newStatus: string) => {
    if (!isAdmin || !selectedSessionId) return;

    const targetMember = study.members.find((m) => m.email === selectedMemberEmail);
    if (!targetMember) return;

    try {
      const res = await studySessionApi.updateMemberAttendance(Number(selectedSessionId), targetMember.memberId, {
        status: newStatus as any,
      });
      const updatedAttData = res as any;
      setAttendanceRecords(updatedAttData?.records || []);
      setAttendanceInfo(updatedAttData);
      showAlert('success', '출석 정보가 변경되었습니다.');
    } catch (err) {
      Logger.error('Failed to update attendance', err);
      showAlert('error', '출석 정보 변경에 실패했습니다.');
    }
  };

  const handleUpdateAssignmentStatus = async (statusLabel: string) => {
    if (!isAdmin || !selectedSessionId) return;

    const statusMap: Record<string, string> = {
      완료: 'COMPLETED',
      '부분 완료': 'PARTIAL',
      미완료: 'INCOMPLETE',
    };

    const targetMember = study.members.find((m) => m.email === selectedMemberEmail);
    if (!targetMember) return;

    try {
      const res = await studySessionApi.updateMemberAssignment(Number(selectedSessionId), targetMember.memberId, {
        status: statusMap[statusLabel] as any,
      });
      const updatedAsgData = res as any;
      setAssignment(updatedAsgData);
      showAlert('success', `과제 평가가 '${statusLabel}'로 변경되었습니다.`);
    } catch (err) {
      Logger.error('Failed to update assignment status', err);
      showAlert('error', '과제 평가 변경에 실패했습니다.');
    }
  };

  const getProblemStatus = (problemId: string) => {
    if (!assignment) return 'UNATTEMPTED';

    if (isCurrentUser) {
      const prob = hookData.problems.find((p) => p.problemId === problemId);
      return prob?.status || 'UNATTEMPTED';
    }

    const problemStatus = assignment.problems?.find((p: any) => p.problemId === problemId);
    if (!problemStatus || !problemStatus.result) return 'UNATTEMPTED';
    if (problemStatus.result === 'CORRECT') return 'CORRECT';
    return 'WRONG';
  };

  const isNotSelected = !selectedMemberEmail || selectedSessionId === '';
  const assignmentStatus = assignment
    ? getSessionAssignmentStatus(
        isCurrentUser
          ? hookData.progress.solvedCount
          : assignment.problems?.filter((p: any) => p.result === 'CORRECT')?.length || 0,
        isCurrentUser ? hookData.progress.totalCount : assignment.problems?.length || 0,
        isCurrentUser
          ? hookData.progress.isAttemptedAll
          : assignment.problems?.every((p: any) => p.result !== null) || false,
      )
    : null;

  return (
    <div className="bg-[var(--color-bg-main)] border border-gray-700/50 rounded-2xl w-full shadow-2xl text-white flex flex-col h-[600px] overflow-hidden mb-8 animate-fadeIn">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50 bg-[var(--color-bg-card)] flex flex-col lg:flex-row justify-between items-center gap-3 shrink-0">
        <h2 className="text-xl font-bold text-[var(--color-brand)] shrink-0">상세 현황</h2>
        <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
          <div className="w-full lg:w-[260px]">
            <SearchableDropdown
              options={sessionOptions}
              value={selectedSessionId}
              onChange={onSessionChange}
              placeholder="세션을 선택하세요"
            />
          </div>
          <div className="w-full lg:w-[260px]">
            <SearchableDropdown
              options={memberOptions}
              value={selectedMemberEmail}
              onChange={onMemberChange}
              placeholder="멤버를 선택하세요"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-row p-6 gap-6 bg-[var(--color-bg-main)]">
        {/* Attendance Section */}
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-gray-700/50 p-6 flex flex-col overflow-y-auto custom-scrollbar w-80 shrink-0">
          <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-200">
            <span className="text-xl">⏱️</span> 출석 현황
          </h3>
          {isNotSelected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <span className="text-4xl mb-4 opacity-20">🖱️</span>
              <p className="text-gray-500 text-sm leading-relaxed">
                상단의 드롭다운이나 하단의 표에서
                <br />
                <span className="text-gray-400 font-semibold">회차와 멤버를 선택</span>해주세요.
              </p>
            </div>
          ) : loading ? (
            <div className="text-gray-500 text-sm text-center py-10">데이터 로딩 중...</div>
          ) : !attendanceInfo ? (
            <div className="text-gray-500 text-sm py-10 text-center flex flex-col items-center justify-center h-full">
              <span className="text-4xl mb-4 opacity-30">⏰</span>
              출석이 시작되지 않았습니다.
            </div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col font-Pretendard">
              {attendanceInfo && (
                <div className="bg-black/30 rounded-lg p-4 border border-gray-700/30 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-gray-500 text-xs mb-1">출석 시작 시간</span>
                      <span className="text-gray-300">{formatDateTime(attendanceInfo.openTime)}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-sm mb-1">출석 마감 시간</span>
                      <span className="text-gray-300">
                        {attendanceInfo.closeTime ? formatDateTime(attendanceInfo.closeTime) : '미정'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-3">유저 출석 상태</h4>
                <div className="flex items-center gap-3 bg-black/30 p-4 rounded-lg border border-gray-700/30">
                  <div
                    className={`px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1.5 border
										${
                      userAttendanceStatus === 'PRESENT'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : userAttendanceStatus === 'LATE'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : userAttendanceStatus === '미진행'
                            ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                  >
                    {userAttendanceStatus === 'PRESENT'
                      ? '출석 ✅'
                      : userAttendanceStatus === 'LATE'
                        ? '지각 ⚠️'
                        : userAttendanceStatus === '미진행'
                          ? '진행 전 ⏳'
                          : '결석 ❌'}
                  </div>
                </div>
              </div>
              {isAdmin && (
                <div className="pt-4 border-t border-gray-700/50 mt-auto">
                  <h4 className="text-sm font-semibold text-[var(--color-brand)] mb-3">🛠️ 출석 상태 변경</h4>
                  <div className="flex gap-2">
                    <Button
                      className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors border ${userAttendanceStatus === 'PRESENT' ? 'bg-green-500 text-black border-green-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                      onClick={() => handleUpdateAttendance('PRESENT')}
                    >
                      출석
                    </Button>
                    <Button
                      className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors border ${userAttendanceStatus === 'LATE' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                      onClick={() => handleUpdateAttendance('LATE')}
                    >
                      지각
                    </Button>
                    <Button
                      className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors border ${userAttendanceStatus === 'ABSENT' || (!userAttRecord && sessionDetail?.attendanceStatus) ? 'bg-red-500 text-white border-red-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                      onClick={() => handleUpdateAttendance('ABSENT')}
                    >
                      결석
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Assignment Section */}
        <div className="flex-1 bg-[var(--color-bg-card)] rounded-xl border border-gray-700/50 p-6 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-200">
              <span className="text-xl">📚</span> 과제 현황
            </h3>
            {assignmentStatus && (
              <span className={`text-sm font-bold ${assignmentStatus.twColor}`}>{assignmentStatus.text}</span>
            )}
          </div>
          {isNotSelected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <span className="text-4xl mb-4 opacity-20">📑</span>
              <p className="text-gray-500 text-sm leading-relaxed">
                선택하신 회차의
                <br />
                <span className="text-gray-400 font-semibold">과제 및 문제 풀이 현황</span>이 나타납니다.
              </p>
            </div>
          ) : loading ? (
            <div className="text-gray-500 text-sm text-center py-10">데이터 로딩 중...</div>
          ) : !assignment ? (
            <div className="text-gray-500 text-sm py-10 text-center flex flex-col items-center justify-center h-full">
              <span className="text-4xl mb-4 opacity-30">📁</span>
              등록된 과제가 없습니다.
            </div>
          ) : (
            <div className="space-y-5 flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">포함된 문제 목록</h4>
                <div className="grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar flex-1 pr-1 content-start">
                  {hookData.problems.length === 0 ? (
                    <div className="col-span-2 text-gray-500 text-sm text-center py-5">문제가 없습니다.</div>
                  ) : (
                    hookData.problems.map((prob, idx) => {
                      const status = getProblemStatus(prob.problemId);
                      const probStatus = getProblemStatusDetail(status);

                      return (
                        <div
                          key={`${prob.problemId}-${idx}`}
                          onClick={() => window.open(`/problems/${prob.problemId}`, '_blank')}
                          className={`
                            group cursor-pointer p-4 rounded-lg border transition-all duration-200
                            ${probStatus.bgColor} ${probStatus.borderColor} hover:border-white/30
                          `}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                              <h3 className="text-sm font-semibold truncate text-gray-200 group-hover:text-white transition-colors">
                                {prob.problemId}. {prob.title}
                              </h3>
                            </div>
                            <span className={`text-sm font-bold shrink-0 ${probStatus.twColor}`}>
                              {probStatus.text}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              {isAdmin && (
                <div className="pt-4 border-t border-gray-700/50 mt-auto shrink-0">
                  <h4 className="text-sm font-semibold text-[var(--color-brand)] mb-3">🛠️ 과제 결과 부여</h4>
                  <div className="flex gap-2">
                    <Button
                      className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors border ${assignment.status === 'COMPLETED' ? 'bg-green-500 text-black border-green-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                      onClick={() => handleUpdateAssignmentStatus('완료')}
                    >
                      완료
                    </Button>
                    <Button
                      className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors border ${assignment.status === 'PARTIAL' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                      onClick={() => handleUpdateAssignmentStatus('부분 완료')}
                    >
                      부분 완료
                    </Button>
                    <Button
                      className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors border ${assignment.status === 'INCOMPLETE' ? 'bg-red-500 text-white border-red-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                      onClick={() => handleUpdateAssignmentStatus('미완료')}
                    >
                      미완료
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main StudyProgressTab Component ──
interface StudyProgressTabProps {
  study: Study;
}

interface SessionProgress {
  id: number;
  startDateTime: string;
  attendanceStatus: string | null | undefined;
  assignmentCreated: boolean;
  attendanceRecords: Record<string, string>;
  problemIds: string[];
  assignmentRecords: Record<
    string,
    { solvedCount: number; totalCount: number; status: string | null; isAttemptedAll: boolean }
  >;
}

const StudyProgressTab = ({ study }: StudyProgressTabProps) => {
  const { showAlert } = useAlert();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [sessionsProgress, setSessionsProgress] = useState<SessionProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const topRef = useRef<HTMLDivElement>(null);

  const currentUserEmail = useMemo(() => getCurrentUserEmail() || '', []);

  const [selectedMemberEmail, setSelectedMemberEmail] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<number | ''>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch sessions, all member attendances, and all member assignments in parallel
        const [sessionsRes, attendancesRes, assignmentsRes] = await Promise.all([
          studySessionApi.getStudySessions(study.id, 0, 100),
          studyApi.getMemberAttendance(study.id),
          studyApi.getMemberAssignment(study.id),
        ]);

        const sessionsData = (sessionsRes as unknown as PagedResponse<StudySession>).content;
        const sortedSessions = [...sessionsData].sort((a, b) => a.id - b.id);
        setSessions(sortedSessions);

        const memberAttendances = attendancesRes as unknown as any[];
        const memberAssignments = assignmentsRes as unknown as any[];

        // 2. Build progress data from the bulk responses
        const progressData: SessionProgress[] = sortedSessions.map((sec) => {
          const attendanceRecords: Record<string, string> = {};
          
          // Extract attendance for this session from all members' data
          memberAttendances.forEach((memberRecord) => {
            const sessionAtt = memberRecord.attendances?.find((a: any) => a.sessionId === sec.id);
            if (sessionAtt) {
              attendanceRecords[memberRecord.user.email] = sessionAtt.status;
            }
          });

          const assignmentRecords: Record<
            string,
            { solvedCount: number; totalCount: number; status: string | null; isAttemptedAll: boolean }
          > = {};
          
          let problemIds: string[] = [];

          // Extract assignment for this session from all members' data
          memberAssignments.forEach((memberRecord) => {
            const sessionAsg = memberRecord.assignments?.find((a: any) => a.sessionId === sec.id);
            if (sessionAsg) {
              if (problemIds.length === 0 && sessionAsg.problems) {
                problemIds = sessionAsg.problems.map((p: any) => p.problemId);
              }
              
              assignmentRecords[memberRecord.user.email] = {
                solvedCount: sessionAsg.solvedCount,
                totalCount: sessionAsg.totalCount,
                status: sessionAsg.status,
                isAttemptedAll: sessionAsg.problems?.every((p: any) => p.result !== null) || false,
              };
            }
          });

          return {
            id: sec.id,
            startDateTime: sec.startDateTime,
            attendanceStatus: sec.attendanceStatus,
            assignmentCreated: !!sec.assignmentCreated,
            attendanceRecords,
            problemIds,
            assignmentRecords,
          };
        });

        setSessionsProgress(progressData);
      } catch (err) {
        Logger.error('Failed to fetch study progress', err);
        showAlert('error', '현황을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [study.id, showAlert]);

  // 탭 로드 시 자동 스크롤 제거 (사용자 요청: 탭 진입 시에는 이동하지 않음)

  const scrollToDetail = () => {
    const nav = document.getElementById('study-tabs-nav');
    nav?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getCellStyles = (session: SessionProgress, email: string) => {
    const attStatus = session.attendanceRecords[email];

    let attColor = '#262626'; // 기본 회색 (출석 미시작 또는 미체크)
    if (session.attendanceStatus) {
      if (attStatus === 'PRESENT')
        attColor = '#22c55e'; // 정상 출석: 초록
      else if (attStatus === 'LATE')
        attColor = '#eab308'; // 지각: 노랑
      else if (attStatus === 'ABSENT') attColor = '#ef4444'; // 명시적 결석: 빨강
    }

    let asgnColor = '#262626'; // 기본 회색 (과제 없음)
    if (session.assignmentCreated && session.assignmentRecords[email]) {
      const record = session.assignmentRecords[email];
      const status = getSessionAssignmentStatus(record.solvedCount, record.totalCount, record.isAttemptedAll);
      asgnColor = status.color;
    } else if (session.attendanceStatus) {
      asgnColor = '#262626'; // 과제 없음 상태도 회색으로 통일
    }

    return {
      background: `linear-gradient(135deg, ${attColor} 50%, ${asgnColor} 50%)`,
    };
  };

  const sortedMembers = study.members
    .filter((m) => m.role !== 'ADMIN')
    .sort((a, b) => {
      const aEmail = a.email?.toLowerCase().trim();
      const bEmail = b.email?.toLowerCase().trim();
      if (aEmail === currentUserEmail) return -1;
      if (bEmail === currentUserEmail) return 1;
      return 0;
    });

  if (loading) return <div className="text-center text-gray-400 py-10">데이터를 불러오는 중입니다...</div>;

  return (
    <div
      className="w-full flex flex-col font-Pretendard"
      ref={topRef}
    >
      <StudyProgressDetail
        study={study}
        sessions={sessions}
        selectedMemberEmail={selectedMemberEmail}
        onMemberChange={(email) => {
          setSelectedMemberEmail(email);
          scrollToDetail();
        }}
        selectedSessionId={selectedSessionId}
        onSessionChange={(id) => {
          setSelectedSessionId(id);
          scrollToDetail();
        }}
      />

      <div className="w-full animate-fadeIn bg-[var(--color-bg-card)] border border-gray-700/50 rounded-2xl p-6 overflow-hidden">
        <div className="flex border border-gray-700/50 rounded-lg overflow-hidden">
          <div className="w-32 flex-shrink-0 bg-[var(--color-bg-card)] border-r border-gray-700/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-[64px]">
                  <th className="px-4 text-gray-400 font-semibold text-sm border-b border-gray-700">멤버</th>
                </tr>
              </thead>
              <tbody>
                {sortedMembers.map((member) => (
                  <tr
                    key={member.userId}
                    className="h-[64px]"
                  >
                    <td className="px-3 border-b border-gray-700/50 max-w-[128px]">
                      <div className="flex flex-col justify-center w-full min-w-0">
                        <span
                          className="block text-white font-medium text-sm truncate leading-tight w-full"
                          title={member.name}
                        >
                          {member.name}
                        </span>
                        <span
                          className="block text-gray-400 text-sm truncate leading-tight mt-0.5 w-full"
                          title={member.email}
                        >
                          {member.email}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex-grow overflow-x-auto custom-scrollbar bg-[var(--color-bg-main)]">
            <table className="w-full text-center border-collapse min-max">
              <thead>
                <tr className="h-[64px]">
                  {sessionsProgress.map((sec: any, idx: number) => (
                    <th
                      key={sec.id}
                      className="px-4 text-gray-400 font-semibold text-sm border-b border-gray-700 min-w-[70px]"
                    >
                      {idx + 1}회차
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedMembers.map((member) => {
                  const isSelectedMember = member.email === selectedMemberEmail;
                  return (
                    <tr
                      key={member.userId}
                      className={`h-[64px] transition-colors ${isSelectedMember ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                      {sessionsProgress.map((sec: any) => {
                        const isSelectedCell = isSelectedMember && sec.id === selectedSessionId;
                        return (
                          <td
                            key={sec.id}
                            className="px-3 border-b border-gray-700/50"
                          >
                            <div className="flex justify-center">
                              <div
                                onClick={() => {
                                  setSelectedMemberEmail(member.email);
                                  setSelectedSessionId(sec.id);
                                  scrollToDetail();
                                }}
                                style={{ ...getCellStyles(sec, member.email), backgroundClip: 'padding-box' }}
                                className={`w-8 h-8 rounded-md border border-gray-700/50 overflow-hidden transition-all cursor-pointer hover:scale-110 ${isSelectedCell ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a] scale-105 shadow-[0_0_10px_rgba(255,255,255,0.4)]' : ''}`}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {sessionsProgress.length === 0 && (
          <div className="text-center text-gray-500 py-10">진행된 세션이 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default StudyProgressTab;
