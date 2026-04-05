import { problemApi, studySessionApi } from '@apis';
import { Button } from '@components';
import { useAlert } from '@contexts';
import { type Study, type StudySession, StudyUser } from '@types';
import { Logger } from '@utils';
import { useEffect, useRef, useState } from 'react';

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
    <div className="relative w-full" ref={ref}>
      <div
        className="bg-[#2A2A2A] border border-gray-600 rounded-lg p-2.5 flex justify-between items-center cursor-pointer text-sm font-medium"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
        }}
      >
        <span className="truncate pr-2 text-gray-200">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="text-gray-400 text-xs text-opacity-50">▼</span>
      </div>
      {isOpen && (
        <div className="absolute top-12 left-0 w-full bg-[#2A2A2A] border border-gray-600 rounded-lg shadow-2xl z-40 max-h-60 flex flex-col overflow-hidden">
          <input
            type="text"
            className="bg-[#1f1f1f] text-white p-2.5 border-b border-gray-600 text-sm outline-none placeholder-gray-500"
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
  const [assignment, setAssignment] = useState<any>(null);
  const [assignmentProblems, setAssignmentProblems] = useState<any[]>([]);

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const currentLoggedInEmail = currentUser?.data?.email?.toLowerCase().trim();
  const isAdmin = study.members.find((m) => m.email.toLowerCase().trim() === currentLoggedInEmail)?.role === 'ADMIN';

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
            setAttendanceRecords(attRes.data?.records || attRes.records || []);
          } catch {
            setAttendanceRecords([]);
          }
        } else {
          setAttendanceRecords([]);
        }

        if (currentSession?.assignmentCreated) {
          try {
            const asgRes = await studySessionApi.getAssignment(Number(selectedSessionId));
            const asgData = asgRes.data || asgRes;
            setAssignment(asgData);

            if (asgData.problemIds && asgData.problemIds.length > 0) {
              const problemsRes = await Promise.all(
                asgData.problemIds.map((pid: number) => problemApi.getProblem(pid).catch(() => null))
              );
              setAssignmentProblems(problemsRes.map((p) => p?.data || p).filter(Boolean));
            } else if (asgData.problems) {
              setAssignmentProblems(asgData.problems);
            } else {
              setAssignmentProblems([]);
            }
          } catch {
            setAssignment(null);
            setAssignmentProblems([]);
          }
        } else {
          setAssignment(null);
          setAssignmentProblems([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSessionData();
  }, [selectedSessionId, selectedMemberEmail, sessions]);

  const sortedSessionsForDropdown = [...sessions].sort(
    (a: any, b: any) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime()
  );
  const sessionOptions = sortedSessionsForDropdown.map((s) => {
    const originalIdx = sessions.findIndex((orig) => orig.id === s.id);
    return {
      value: s.id,
      label: `${originalIdx + 1}회차 세션 (${new Date(s.startDateTime).toLocaleDateString()})`,
    };
  });

  const memberOptions = study.members.map((m) => ({
    value: m.email,
    label: `${m.name} (${m.email})`,
  }));

  const userAttRecord = attendanceRecords.find((r) => r.userEmail === selectedMemberEmail);
  const userAttendanceStatus = userAttRecord
    ? userAttRecord.status
    : sessionDetail?.attendanceStatus === 'BEFORE'
      ? '미진행'
      : '결석/미출석';

  const handleUpdateAttendance = (newStatus: string) => {
    if (!isAdmin) return;
    showAlert('success', '출석 정보가 변경되었습니다. (UI 전용 - API 미연동)');
    setAttendanceRecords((prev) => {
      const exists = prev.find((r) => r.userEmail === selectedMemberEmail);
      if (exists) {
        return prev.map((r) => (r.userEmail === selectedMemberEmail ? { ...r, status: newStatus } : r));
      } else {
        return [...prev, { userEmail: selectedMemberEmail, status: newStatus }];
      }
    });
  };

  const handleUpdateAssignmentPass = (passed: boolean) => {
    if (!isAdmin) return;
    showAlert('success', `과제 평가가 '${passed ? 'Pass' : 'Fail'}'로 변경되었습니다. (UI 전용 - API 미연동)`);
  };

  const getMockProblemStatus = (problemId: number) => {
    const hash = selectedMemberEmail.length + problemId + Number(selectedSessionId);
    if (hash % 3 === 0) return 'CORRECT';
    if (hash % 3 === 1) return 'WRONG';
    return 'UNATTEMPTED';
  };

  const isNotSelected = !selectedMemberEmail || selectedSessionId === '';

  return (
    <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-2xl w-full shadow-2xl text-white flex flex-col h-[600px] overflow-hidden mb-8 animate-fadeIn">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50 bg-[#1f1f1f] flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
        <h2 className="text-xl font-bold text-[#CAFE33] shrink-0">상세 현황</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-[260px]">
            <SearchableDropdown
              options={sessionOptions}
              value={selectedSessionId}
              onChange={onSessionChange}
              placeholder="세션을 선택하세요"
            />
          </div>
          <div className="w-full sm:w-[260px]">
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
      <div className="flex-1 overflow-hidden flex flex-row p-6 gap-6 bg-[#171717]">
        {/* Attendance Section */}
        <div className="bg-[#1f1f1f] rounded-xl border border-gray-700/50 p-6 flex flex-col overflow-y-auto custom-scrollbar w-80 shrink-0">
          <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-200">
            <span className="text-xl">⏱️</span> 출석 정보
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
          ) : !sessionDetail ? (
            <div className="text-gray-500 text-sm py-10 text-center">세션 정보가 없습니다.</div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col font-Pretendard">
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700/30 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-gray-500 text-xs mb-1">시작 시간</span>
                    <span className="text-gray-300">{new Date(sessionDetail.startDateTime).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs mb-1">종료 시간</span>
                    <span className="text-gray-300">{new Date(sessionDetail.endDateTime).toLocaleString()}</span>
                  </div>
                </div>
              </div>
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
                      ? '출석 완료 ✅'
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
                  <h4 className="text-sm font-semibold text-[#CAFE33] mb-3">🛠️ [관리자] 출석 상태 변경</h4>
                  <div className="flex gap-2">
                    <Button
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${userAttendanceStatus === 'PRESENT' ? 'bg-green-500 text-black border-green-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                      onClick={() => handleUpdateAttendance('PRESENT')}
                    >
                      출석
                    </Button>
                    <Button
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${userAttendanceStatus === 'LATE' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                      onClick={() => handleUpdateAttendance('LATE')}
                    >
                      지각
                    </Button>
                    <Button
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${userAttendanceStatus === 'ABSENT' || (!userAttRecord && sessionDetail?.attendanceStatus !== 'BEFORE') ? 'bg-red-500 text-white border-red-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
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
        <div className="flex-1 bg-[#1f1f1f] rounded-xl border border-gray-700/50 p-6 flex flex-col overflow-y-auto custom-scrollbar">
          <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-200">
            <span className="text-xl">📚</span> 과제 현황
          </h3>
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
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700/30 shrink-0">
                <h4 className="font-semibold text-lg text-white mb-1">{assignment.title}</h4>
                {assignment.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{assignment.description}</p>
                )}
              </div>
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <h4 className="text-xs font-semibold text-gray-400 mb-3">포함된 문제 목록</h4>
                <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                  {assignmentProblems.length === 0 ? (
                    <div className="text-gray-500 text-xs text-center py-5">문제가 없습니다.</div>
                  ) : (
                    assignmentProblems.map((prob) => {
                      const status = getMockProblemStatus(prob.problemId);
                      return (
                        <div
                          key={prob.problemId}
                          className="flex items-center justify-between gap-3 bg-[#2a2a2a] p-3 rounded-lg border border-gray-700/50"
                        >
                          <div className="min-w-0 pr-4 flex-1">
                            <div className="text-xs font-medium text-gray-200 truncate">
                              {prob.problemId}. {prob.title}
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center">
                            {status === 'CORRECT' && (
                              <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded border border-green-500/30">
                                정답
                              </span>
                            )}
                            {status === 'WRONG' && (
                              <span className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded border border-red-500/30">
                                오답
                              </span>
                            )}
                            {status === 'UNATTEMPTED' && (
                              <span className="px-2 py-1 bg-gray-600/20 text-gray-300 text-[10px] font-bold rounded border border-gray-600/40">
                                미시도
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              {isAdmin && (
                <div className="pt-4 border-t border-gray-700/50 mt-auto shrink-0">
                  <h4 className="text-sm font-semibold text-[#CAFE33] mb-3">🛠️ [관리자] 과제 결과 부여</h4>
                  <div className="flex gap-2">
                    <Button className="flex-1 py-2 text-xs rounded-lg" onClick={() => handleUpdateAssignmentPass(true)}>
                      ✅ Pass
                    </Button>
                    <Button
                      className="flex-1 py-2 text-xs rounded-lg bg-gray-800 text-gray-300 border-gray-700"
                      onClick={() => handleUpdateAssignmentPass(false)}
                    >
                      ❌ Fail
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
  attendanceStatus: string;
  assignmentCreated: boolean;
  attendanceRecords: Record<string, string>;
  problemIds: number[];
}

const StudyProgressTab = ({ study }: StudyProgressTabProps) => {
  const { showAlert } = useAlert();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [sessionsProgress, setSessionsProgress] = useState<SessionProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const topRef = useRef<HTMLDivElement>(null);

  const [selectedMemberEmail, setSelectedMemberEmail] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<number | ''>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await studySessionApi.getStudySessions(study.id, 0, 100);
        const data = res.data?.content || res.content || [];
        setSessions(data);

        const progressData: SessionProgress[] = await Promise.all(
          data.map(async (sec: any) => {
            const attendanceRecords: Record<string, string> = {};
            if (sec.attendanceStatus === 'OPEN' || sec.attendanceStatus === 'CLOSED') {
              try {
                const attRes = await studySessionApi.getAttendance(sec.id);
                const records = attRes.data?.records || attRes.records || [];
                records.forEach((r: any) => {
                  attendanceRecords[r.userEmail] = r.status;
                });
              } catch (e) {
                Logger.error('Failed to fetch attendance for session', sec.id);
              }
            }

            let problemIds: number[] = [];
            if (sec.assignmentCreated) {
              try {
                const asgRes = await studySessionApi.getAssignment(sec.id);
                const asgData = asgRes.data || asgRes;
                problemIds = asgData.problemIds || asgData.problems?.map((p: any) => p.id) || [];
              } catch (e) {
                Logger.error('Failed to fetch assignment for session', sec.id);
              }
            }

            return {
              id: sec.id,
              startDateTime: sec.startDateTime,
              attendanceStatus: sec.attendanceStatus,
              assignmentCreated: sec.assignmentCreated,
              attendanceRecords,
              problemIds,
            };
          })
        );

        progressData.sort((a, b) => a.id - b.id);
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
    const isAttended = attStatus === 'PRESENT' || attStatus === 'LATE';
    const isAbsent = attStatus === 'ABSENT';

    // Mock assignment completion logic
    const hash = email.length + session.id;
    const isAssignmentCompleted = session.assignmentCreated && hash % 2 === 0;

    let attColor = '#262626'; // BEFORE (기본 회색)
    if (session.attendanceStatus !== 'BEFORE') {
      if (attStatus === 'PRESENT')
        attColor = '#22c55e'; // 정상 출석: 초록
      else if (attStatus === 'LATE')
        attColor = '#eab308'; // 지각: 노랑
      else attColor = '#ef4444'; // 결석 및 미체크: 빨강
    }

    let asgnColor = '#262626'; // BEFORE
    if (session.assignmentCreated) {
      if (session.problemIds.length === 0) {
        asgnColor = '#3A3A3A'; // 과제가 있지만 문제가 없는 경우
      } else {
        // Mock aggregation logic matching the detail view
        const statuses = session.problemIds.map((pid) => {
          const hash = email.length + pid + session.id;
          const mod = hash % 3;
          return mod === 0 ? 'CORRECT' : mod === 1 ? 'WRONG' : 'UNATTEMPTED';
        });

        const hasUnattempted = statuses.includes('UNATTEMPTED');
        const allCorrect = statuses.every((s) => s === 'CORRECT');

        if (allCorrect) {
          asgnColor = '#22c55e'; // 통과 (모두 정답): 초록
        } else if (!hasUnattempted) {
          asgnColor = '#eab308'; // 중간 (미시도 없음): 노랑/주황
        } else {
          asgnColor = '#ef4444'; // 불통과 (미시도 존재): 빨강
        }
      }
    } else if (session.attendanceStatus !== 'BEFORE') {
      asgnColor = '#3A3A3A'; // 과제 없음
    }

    return {
      background: `linear-gradient(135deg, ${attColor} 50%, ${asgnColor} 50%)`,
    };
  };

  const currentUserEmail = (() => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    return user?.data?.email?.toLowerCase().trim();
  })();

  const sortedMembers = [...study.members].sort((a, b) => {
    const aEmail = a.email?.toLowerCase().trim();
    const bEmail = b.email?.toLowerCase().trim();
    if (aEmail === currentUserEmail) return -1;
    if (bEmail === currentUserEmail) return 1;
    return 0;
  });

  if (loading) return <div className="text-center text-gray-400 py-10">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="w-full flex flex-col font-Pretendard" ref={topRef}>
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

      <div className="w-full animate-fadeIn bg-[#1f1f1f] border border-gray-700/50 rounded-2xl p-6 overflow-hidden">
        <div className="flex border border-gray-700/50 rounded-lg overflow-hidden">
          <div className="w-32 flex-shrink-0 bg-[#1f1f1f] border-r border-gray-700/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-[64px]">
                  <th className="px-4 text-gray-400 font-semibold text-sm border-b border-gray-700">멤버</th>
                </tr>
              </thead>
              <tbody>
                {sortedMembers.map((member) => (
                  <tr key={member.userId} className="h-[64px]">
                    <td className="px-3 border-b border-gray-700/50 max-w-[128px]">
                      <div className="flex flex-col justify-center w-full min-w-0">
                        <span
                          className="block text-white font-medium text-sm truncate leading-tight w-full"
                          title={member.name}
                        >
                          {member.name}
                        </span>
                        <span
                          className="block text-gray-400 text-[10px] truncate leading-tight mt-0.5 w-full"
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

          <div className="flex-grow overflow-x-auto custom-scrollbar bg-[#1a1a1a]">
            <table className="w-full text-center border-collapse min-max">
              <thead>
                <tr className="h-[64px]">
                  {sessionsProgress.map((sec: any, idx: number) => (
                    <th
                      key={sec.id}
                      className="px-4 text-gray-400 font-semibold text-xs border-b border-gray-700 min-w-[70px]"
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
                          <td key={sec.id} className="px-3 border-b border-gray-700/50">
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
