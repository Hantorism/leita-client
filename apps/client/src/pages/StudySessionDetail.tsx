import { studyApi, studySessionApi } from '@leita/api';
import {
  Button,
  CreateAssignmentModal,
  CreateAttendanceModal,
  Footer,
  Header,
  UpdateAssignmentModal,
  UpdateAttendanceModal,
} from '@components';
import { useAlert } from '@contexts';
import { Icon } from '@iconify/react';
import type {
  AttendanceCheck,
  AttendanceRecord,
  Study,
  StudyMemberAssignment,
  StudyMemberAttendance,
  StudySession,
  StudySessionDetail,
} from '@leita/types';
import {
  formatDateTime,
  getCurrentUserEmail,
  Logger,
  type PagedResponse,
  extractErrorMessage,
  getProblemStatusDetail,
} from '@utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const StudySessionDetailPage = () => {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useAlert();

  const [study, setStudy] = useState<Study | null>(null);
  const [session, setSession] = useState<StudySessionDetail | null>(null);
  const [memberAssignments, setMemberAssignments] = useState<StudyMemberAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [sessionNumber, setSessionNumber] = useState<number | null>(location.state?.sessionNumber || null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [lateTimeLeft, setLateTimeLeft] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const isMounted = useRef(true);

  const [showCreateAttendanceModal, setShowCreateAttendanceModal] = useState(false);
  const [showUpdateAttendanceModal, setShowUpdateAttendanceModal] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showUpdateAssignmentModal, setShowUpdateAssignmentModal] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id || !sessionId) return;
    setLoading(true);
    try {
      const [studyRes, sessionRes, sessionsRes, assignmentsRes, roleRes] = await Promise.all([
        studyApi.getStudy(Number(id)),
        studySessionApi.getStudySession(Number(sessionId)),
        studySessionApi.getStudySessions(Number(id)),
        studyApi.getMemberAssignment(Number(id), Number(sessionId)),
        studyApi.getMyRole(Number(id))
      ]);

      if (!isMounted.current) return;

      const studyData = studyRes as unknown as Study;
      setStudy(studyData);

      const currentSession = sessionRes as unknown as StudySessionDetail;
      setSession(currentSession);

      const assignmentsData = (assignmentsRes as unknown as StudyMemberAssignment[]) || [];
      setMemberAssignments(assignmentsData);

      if (!sessionNumber) {
        const { content: allSessions } = sessionsRes as unknown as PagedResponse<StudySession>;
        const sortedSessions = [...allSessions].sort((a: StudySession, b: StudySession) => a.id - b.id);
        const index = sortedSessions.findIndex((s: StudySession) => s.id === Number(sessionId));
        setSessionNumber(index !== -1 ? index + 1 : null);
      }

      const role = roleRes as unknown as any;
      setIsAdmin(role.role === 'ADMIN');
      setIsMember(role.role === 'MEMBER');

      const email = getCurrentUserEmail();
      if (email) {
        setCurrentUserEmail(email);
      }
    } catch (err) {
      Logger.error('Failed to fetch session detail', err);
      showAlert('error', '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id, sessionId, sessionNumber, showAlert]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  useEffect(() => {
    if (!session?.attendance?.closeTime || session.attendance.status !== 'OPEN') {
      setTimeLeft(null);
      setLateTimeLeft(null);
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const openTime = new Date(session.attendance!.openTime).getTime();
      const closeTime = new Date(session.attendance!.closeTime!).getTime();
      const lateThreshold = session.attendance!.lateThresholdMinutes || 0;
      const lateTime = openTime + lateThreshold * 60 * 1000;

      const diff = closeTime - now;
      const lateDiff = lateTime - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        setLateTimeLeft('EXPIRED');
        clearInterval(timer);
        return;
      }

      const formatTime = (ms: number) => {
        if (ms <= 0) return 'EXPIRED';
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      };

      setTimeLeft(formatTime(diff));
      setLateTimeLeft(formatTime(lateDiff));
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.attendance]);

  const handleAttend = async () => {
    if (!session) return;

    try {
      await studySessionApi.attend(session.id);
      showAlert('success', '출석 처리가 완료되었습니다.');
      fetchData();
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showAlert('error', msg || '출석 처리에 실패했습니다.');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center text-white">
        로딩 중...
      </div>
    );
  if (!session)
    return (
      <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center text-white">
        세션을 찾을 수 없습니다.
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] text-white font-Pretendard flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="bg-[var(--color-bg-card)] rounded-2xl p-8 border border-gray-800 shadow-xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-brand)] mb-2">
                {sessionNumber ? `${sessionNumber}회차` : ''}
                {session.title ? ` - ${session.title}` : !sessionNumber ? '세션 상세 정보' : ''}
              </h1>
              {session.description && (
                <p className="text-gray-400 text-sm mt-2 whitespace-pre-wrap">{session.description}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {isMember && (
                <Button
                  size="lg"
                  onClick={handleAttend}
                  className="bg-blue-600 hover:bg-blue-500 rounded-full !px-5 hover:!bg-[var(--color-brand)] hover:!text-black"
                >
                  출석하기
                </Button>
              )}
            </div>
          </div>

          <div className="py-8 border-t border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-100">출석 시간</h3>
              {isAdmin && (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() =>
                    session.attendance ? setShowUpdateAttendanceModal(true) : setShowCreateAttendanceModal(true)
                  }
                  className="rounded-full !px-5 hover:!bg-[var(--color-brand)] hover:!text-black"
                >
                  {session.attendance ? '출석 수정하기' : '출석 시작하기'}
                </Button>
              )}
            </div>

            {!session.attendance ? (
              <div className="bg-black/10 border border-dashed border-gray-700 rounded-xl p-12 text-center">
                <p className="text-gray-500">출석이 시작되지 않았습니다.</p>
              </div>
            ) : (
              <div className="bg-black/20 border border-gray-800 p-6 rounded-xl">
                <div className="flex flex-col lg:flex-row justify-start items-center gap-40">
                  {/* Left: Start/Close Times (Vertical Stack) */}
                  <div className="flex flex-col gap-4 w-full lg:w-[280px] shrink-0">
                    <div>
                      <span className="block text-sm text-gray-500 uppercase tracking-wider mb-1">출석 시작</span>
                      <span className="text-lg font-medium text-gray-300">
                        {formatDateTime(session.attendance.openTime)}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-gray-800 lg:border-t-0 lg:pt-0">
                      <span className="block text-sm text-gray-500 uppercase tracking-wider mb-1">출석 마감</span>
                      <span className="text-lg font-medium text-gray-300">
                        {session.attendance.closeTime ? formatDateTime(session.attendance.closeTime) : '미정'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Personal Status / Countdown */}
                  {isMember && (timeLeft !== null ||
                  session.attendance.records.some(
                    (r: AttendanceRecord) => r.userEmail === currentUserEmail && r.attendedAt,
                  )) ? (
                    <div className="flex flex-col items-start w-full lg:w-auto shrink-0 font-Pretendard tabular-nums">
                      <span className="block text-sm text-gray-500 uppercase tracking-wider mb-1">
                        {session.attendance.records.some(
                          (r: AttendanceRecord) => r.userEmail === currentUserEmail && r.attendedAt,
                        )
                          ? '출석 상태'
                          : ''}
                      </span>
                      {(() => {
                        const myAttendance = session.attendance?.records.find(
                          (r: AttendanceRecord) => r.userEmail === currentUserEmail,
                        );

                        // 1. 출석 한 경우
                        if (myAttendance?.attendedAt) {
                          return (
                            <div className="flex flex-col">
                              <span
                                className={`text-lg ${myAttendance.status === 'LATE' ? 'text-orange-500' : 'text-green-500'}`}
                              >
                                {myAttendance.status === 'LATE' ? '지각' : '정상 출석'}
                              </span>
                              <span className="text-sm text-gray-400">{formatDateTime(myAttendance.attendedAt)}</span>
                            </div>
                          );
                        }

                        // 2. 출석 안 한 경우
                        if (timeLeft === 'EXPIRED') {
                          return (
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500 font-medium">현재 상태</span>
                              <span className="text-lg text-red-500">미출석</span>
                            </div>
                          );
                        }

                        return (
                          <div className="flex flex-col gap-3">
                            {/* 지각 시간 체크 */}
                            {lateTimeLeft === 'EXPIRED' ? (
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-500 font-medium">현재 상태</span>
                                <span className="text-lg text-orange-500">지각</span>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-500 font-medium">남은 지각 시간</span>
                                <span className="text-lg text-white">{lateTimeLeft}</span>
                              </div>
                            )}

                            {/* 출석 시간 체크 */}
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500 font-medium">남은 출석 시간</span>
                              <span className="text-lg text-white">{timeLeft}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : null}
                </div>

                {/* attendance order list */}
                {session.attendance.records.some((r: any) => r.attendedAt) && (
                  <div className="mt-10 pt-8 border-t border-gray-800/50">
                    <h4 className="text-sm font-semibold text-gray-400 mb-6 flex items-center gap-2">
                      <Icon icon="solar:medal-ribbon-bold" className="text-amber-400 text-lg" /> 출석 순서
                    </h4>
                    <div className="flex flex-nowrap overflow-x-auto custom-scrollbar gap-x-12 pb-6 px-1">
                      {[...(session.attendance.records || [])]
                        .filter((r) => {
                          if (!r.attendedAt) return false;
                          const member = study?.members.find((m) => m.userId === r.userId);
                          return member?.role !== 'ADMIN';
                        })
                        .map((record, index) => {
                          const isLate = record.status === 'LATE';
                          const attendedDate = new Date(record.attendedAt!);

                          return (
                            <div
                              key={record.id}
                              className="flex items-center gap-4 group animate-fadeIn flex-shrink-0"
                            >
                              <div className="relative">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2
                                    ${
                                      index === 0
                                        ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                                        : index === 1
                                          ? 'bg-gray-300/10 border-gray-400/50 text-gray-300'
                                          : index === 2
                                            ? 'bg-orange-700/10 border-orange-700/50 text-orange-600'
                                            : 'bg-black/40 border-gray-700 text-gray-500'
                                    }`}
                                >
                                  {index + 1}
                                </div>
                                {index < 3 && (
                                  <span className="absolute -top-1 -right-1">
                                    <Icon
                                      icon="solar:medal-star-bold"
                                      className={
                                        index === 0
                                          ? 'text-yellow-400 size-4'
                                          : index === 1
                                            ? 'text-gray-300 size-4'
                                            : 'text-amber-600 size-4'
                                      }
                                    />
                                  </span>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                                    {record.userName}
                                  </span>
                                  {isLate && (
                                    <span className="text-sm bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded font-bold border border-orange-500/20">
                                      지각
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500 tabular-nums">
                                  {attendedDate.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="py-8 border-t border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-100">과제 진행 현황</h3>
              <div className="flex items-center gap-4">
                {session.assignment && (
                  <p className="text-sm text-gray-400">
                    총 <span className="font-bold text-[var(--color-brand)]">{session.assignment.problems.length}</span>
                    문제
                  </p>
                )}
                {isAdmin && (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() =>
                      session.assignment ? setShowUpdateAssignmentModal(true) : setShowCreateAssignmentModal(true)
                    }
                    className="rounded-full !px-5 hover:!bg-[var(--color-brand)] hover:!text-black"
                  >
                    {session.assignment ? '과제 수정하기' : '과제 출제하기'}
                  </Button>
                )}
              </div>
            </div>

            {!session.assignment ? (
              <div className="bg-black/10 border border-dashed border-gray-700 rounded-xl p-12 text-center">
                <p className="text-gray-500">등록된 과제가 없습니다.</p>
              </div>
            ) : isAdmin ? (
              /* Admin View: Grid of all members */
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-5 border border-gray-800 rounded-xl p-6 bg-black/20">
                {study?.members
                  .filter((member) => member.role !== 'ADMIN')
                  .map((member) => {
                    const memberAsgRecord = memberAssignments.find((ma) => ma.user.email === member.email);
                    const asgDetail = memberAsgRecord?.assignments?.[0];

                    const totalProblems = asgDetail?.totalCount || session.assignment?.problems.length || 0;
                    const solvedCount = asgDetail?.solvedCount || 0;
                    const progressPercentage =
                      totalProblems === 0 ? 0 : Math.round((solvedCount / totalProblems) * 100);

                    return (
                      <div
                        key={member.userId}
                        className="bg-black/40 border border-gray-800 p-5 rounded-xl flex flex-col gap-4"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300">
                              {member.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-gray-200 leading-none">{member.name}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-[var(--color-brand)] leading-none">
                            {progressPercentage}%
                          </span>
                        </div>

                        <div className="w-full">
                          <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                            <div
                              className="bg-[var(--color-brand)] h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-500">진행률</span>
                            <span className="text-gray-400 font-medium">
                              <span className="text-gray-200">{solvedCount}</span> / {totalProblems} 문제
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              /* Member View: List of problems to solve */
              <div className="flex flex-col gap-5 border border-gray-800 rounded-xl p-8 bg-black/20">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-300">포함된 문제 목록</h4>
                  {session.assignment.status && (
                    <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold">
                      상태: <span className="text-[var(--color-brand)]">{
                        session.assignment.status === 'COMPLETED' ? '완료' : 
                        session.assignment.status === 'PARTIAL' ? '부분 완료' : '미완료'
                      }</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.assignment.problems.map((prob) => {
                    const probStatus = getProblemStatusDetail(prob.result || 'UNATTEMPTED');
                    return (
                      <div
                        key={prob.problemId}
                        onClick={() => window.open(`/problems/${prob.problemId}`, '_blank')}
                        className={`group cursor-pointer p-5 rounded-[1.5rem] border transition-all duration-300 active:scale-[0.98] flex items-center justify-between ${probStatus.bgColor} ${probStatus.borderColor} hover:border-white/30`}
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Problem {prob.problemId}</span>
                          <h5 className="text-lg font-black text-gray-200 group-hover:text-white transition-colors truncate">
                            {prob.title}
                          </h5>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className={`text-sm font-black uppercase tracking-tighter ${probStatus.twColor}`}>
                            {probStatus.text}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#CAFE33] group-hover:text-black transition-all">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {showCreateAttendanceModal && (
        <CreateAttendanceModal
          studyId={Number(id)}
          sessionId={Number(sessionId)}
          initialOpenTime={session.startDateTime}
          initialCloseTime={session.endDateTime}
          onSuccess={fetchData}
          onClose={() => setShowCreateAttendanceModal(false)}
        />
      )}

      {showUpdateAttendanceModal && session.attendance && (
        <UpdateAttendanceModal
          studyId={Number(id)}
          sessionId={Number(sessionId)}
          initialOpenTime={session.attendance.openTime}
          initialCloseTime={session.attendance.closeTime || ''}
          initialLateThreshold={session.attendance.lateThresholdMinutes}
          onSuccess={fetchData}
          onClose={() => setShowUpdateAttendanceModal(false)}
        />
      )}

      {showCreateAssignmentModal && (
        <CreateAssignmentModal
          studyId={Number(id)}
          sessionId={Number(sessionId)}
          onSuccess={fetchData}
          onClose={() => setShowCreateAssignmentModal(false)}
        />
      )}

      {showUpdateAssignmentModal && session.assignment && (
        <UpdateAssignmentModal
          studyId={Number(id)}
          sessionId={Number(sessionId)}
          initialData={{
            description: session.assignment.description || undefined,
            problemIds: session.assignment.problems.map((p) => String(p.problemId)),
          }}
          onSuccess={fetchData}
          onClose={() => setShowUpdateAssignmentModal(false)}
        />
      )}
    </div>
  );
};

export default StudySessionDetailPage;
