import { studyApi, studySessionApi } from '@apis';
import { AddAssignmentModal, Button, Footer, Header, StartAttendanceModal } from '@components';
import { useAlert } from '@contexts';
import type { Study, StudySession } from '@types';
import { Logger } from '@utils';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const StudySessionDetail = () => {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useAlert();

  const [study, setStudy] = useState<Study | null>(null);
  const [session, setSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [sessionNumber, setSessionNumber] = useState<number | null>(location.state?.sessionNumber || null);

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const fetchData = async () => {
    if (!id || !sessionId) return;
    setLoading(true);
    try {
      const [studyRes, sessionRes, sessionsRes] = await Promise.all([
        studyApi.getStudy(Number(id)),
        studySessionApi.getStudySession(Number(sessionId)),
        studySessionApi.getStudySessions(Number(id)),
      ]);

      const studyData = studyRes.data || studyRes;
      setStudy(studyData);

      const currentSession = sessionRes.data || sessionRes;
      setSession(currentSession);

      // 세션 번호가 state로 넘어오지 않은 경우 (직접 링크 접근 등)를 대비한 폴백 처리
      if (!sessionNumber) {
        const allSessions = sessionsRes.data?.content ?? sessionsRes;
        const sortedSessions = [...allSessions].sort((a: any, b: any) => a.id - b.id);
        const index = sortedSessions.findIndex((s: any) => s.id === Number(sessionId));
        setSessionNumber(index !== -1 ? index + 1 : null);
      }

      // 권한 체크
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const email = user.email || user.data?.email;
        const memberInfo = studyData.members?.find((m: any) => m.email === email);
        setIsAdmin(memberInfo?.role === 'ADMIN');
        setIsMember(!!memberInfo);
      }
    } catch (err) {
      Logger.error('Failed to fetch session detail', err);
      showAlert('error', '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, sessionId]);

  const handleAttend = async () => {
    if (!session) return;

    // 출석이 활성화된 상태인지 확인
    if (session.attendanceStatus !== 'OPEN' || !session.attendance) {
      showAlert('info', '현재 출석이 가능하지 않습니다.');
      return;
    }

    const now = new Date();
    const startTime = new Date(session.attendance.openTime);
    const endTime = new Date(session.attendance.closeTime);

    if (now < startTime || now > endTime) {
      showAlert('info', '출석 가능 시간이 아닙니다.');
      return;
    }

    try {
      await studySessionApi.attend(session.id);
      showAlert('success', '출석 처리가 완료되었습니다.');
      fetchData(); // 상태 갱신
    } catch (err) {
      showAlert('error', '출석 처리에 실패했습니다.');
    }
  };

  if (loading)
    return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">로딩 중...</div>;
  if (!session)
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">
        세션을 찾을 수 없습니다.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] text-white font-Pretendard flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-12">
        <Button variant="ghost" onClick={() => navigate(`/study/${id}`)} className="mb-6 flex items-center gap-2">
          ← 스터디 상세로 돌아가기
        </Button>

        <div className="bg-[#1f1f1f] rounded-2xl p-8 border border-gray-800 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#CAFE33] mb-2">
                {/* TODO: 백엔드에서 세션 제목 데이터(title)가 추가되면 session.title을 우선적으로 사용하도록 수정 예정 */}
                {sessionNumber ? `${sessionNumber}회차 세션` : '세션 상세 정보'}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              {isAdmin && (
                <>
                  <Button size="lg" onClick={() => setShowAssignmentModal(true)}>
                    과제 출제하기
                  </Button>
                  <Button size="lg" onClick={() => setShowAttendanceModal(true)}>
                    출석 시작하기
                  </Button>
                </>
              )}
              {(isAdmin || isMember) && (
                <Button
                  size="lg"
                  onClick={handleAttend}
                  className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20"
                >
                  출석하기
                </Button>
              )}
            </div>
          </div>

          <div className="py-8 border-t border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-100">출석 시간</h3>
            </div>

            {!session.attendance ? (
              <div className="bg-black/10 border border-dashed border-gray-700 rounded-xl p-12 text-center">
                <p className="text-gray-500">아직 출석이 시작되지 않았습니다.</p>
              </div>
            ) : (
              <div className="bg-black/20 border border-gray-800 p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center sm:block sm:space-y-3">
                  <div>
                    <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">출석 시작</span>
                    <span className="text-lg font-medium text-gray-200">
                      {new Date(session.attendance.openTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="sm:mt-3">
                    <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">출석 마감</span>
                    <span className="text-lg font-medium text-gray-300">
                      {session.attendance.closeTime ? new Date(session.attendance.closeTime).toLocaleString() : '미정'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 과제 진행 현황 영역 */}
          <div className="py-8 border-t border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-100">과제 진행 현황</h3>
              {session.assignment && (
                <p className="text-sm text-gray-400">
                  총 <span className="font-bold text-[#CAFE33]">{session.assignment.problemIds.length}</span>문제
                </p>
              )}
            </div>

            {!session.assignment ? (
              <div className="bg-black/10 border border-dashed border-gray-700 rounded-xl p-12 text-center">
                <p className="text-gray-500">등록된 과제가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 border border-gray-800 rounded-xl p-6 bg-black/20">
                {study?.members.map((member) => {
                  // TODO: 실제 백엔드 연동 시, 해당 회차 멤버별 과제 해결 수 데이터로 대체
                  const totalProblems = session.assignment!.problemIds.length;
                  const solvedCount = 0; // 임시 데이터
                  const progressPercentage = totalProblems === 0 ? 0 : Math.round((solvedCount / totalProblems) * 100);

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
                              {member.role === 'ADMIN' && (
                                <span className="text-[10px] bg-[#CAFE33]/20 text-[#CAFE33] px-1.5 py-0.5 rounded leading-none">
                                  Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-[#CAFE33] leading-none">{progressPercentage}%</span>
                      </div>

                      <div className="w-full">
                        <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                          <div
                            className="bg-[#CAFE33] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
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
            )}
          </div>
        </div>
      </main>

      <Footer />

      {showAttendanceModal && (
        <StartAttendanceModal
          studyId={Number(id)}
          sessionId={Number(sessionId)}
          initialOpenTime={session.startDateTime}
          initialCloseTime={session.endDateTime}
          onClose={() => setShowAttendanceModal(false)}
        />
      )}

      {showAssignmentModal && (
        <AddAssignmentModal
          studyId={Number(id)}
          sessionId={Number(sessionId)}
          onClose={() => setShowAssignmentModal(false)}
        />
      )}
    </div>
  );
};

export default StudySessionDetail;
