import { useState, useEffect } from 'react';
import { studyApi } from '@apis';
import { StudySession, Study } from '@types';
import { Logger } from '@utils';
import { CreateSessionModal, StartAttendanceModal, AddAssignmentModal } from '@components';
import { useAlert } from '@contexts';

interface StudySessionListProps {
  study: Study;
  isMember: boolean;
  isAdmin: boolean;
}

const StudySessionList = ({ study, isMember, isAdmin }: StudySessionListProps) => {
  const { showAlert } = useAlert();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState<number | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await studyApi.getStudySessions(study.id);
      // 응답 구조에 따라 유연하게 처리
      const data = response.data.content ?? response;
      setSessions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Logger.error('Failed to fetch sessions', err);
      setError('세션 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [study.id]);

  const handleAttend = async (session: StudySession) => {
    const now = new Date();
    const startTime = new Date(session.startDateTime);
    const endTime = new Date(session.endDateTime);

    if (now < startTime || now > endTime) {
      showAlert('info', '출석 시간이 아닙니다.');
      return;
    }

    try {
      await studyApi.attend(session.id);
      showAlert('success', '출석 처리가 완료되었습니다.');
    } catch (err) {
      showAlert('error', '출석 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) return <div className="text-gray-400 mt-4 pl-2">세션 목록을 불러오는 중...</div>;
  if (error) return (
    <div className="mt-4 pl-2">
      <p className="text-red-400 text-sm">{error}</p>
      <button
        onClick={fetchSessions}
        className="mt-2 text-xs text-gray-400 underline hover:text-white transition"
      >
        다시 시도
      </button>
    </div>
  );

  return (
    <div className="w-full mt-6">
      <div className="flex justify-between items-center border-b border-gray-600 pb-3 pl-2">
        <h2 className="text-2xl font-semibold">스터디 세션</h2>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-1.5 bg-[#CAFF33] text-black text-sm font-bold rounded-full hover:bg-[#b0e82e]"
          >
            Create Session
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {sessions.length === 0 ? (
          <p className="text-gray-500 pl-2">등록된 세션이 없습니다.</p>
        ) : (
          sessions.map((session, index) => (
            <div key={session.id} className="bg-white bg-opacity-5 p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 className="text-lg font-medium text-[#CAFF33]">{index + 1}회차 세션</h3>
                <p className="text-sm text-gray-400 mt-1">
                  시작: {new Date(session.startDateTime).toLocaleString()} <br />
                  종료: {new Date(session.endDateTime).toLocaleString()}
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                {isAdmin && (
                  <button
                    onClick={() => setShowAssignmentModal(session.id)}
                    className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600"
                  >
                    + Assignment
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setShowAttendanceModal(session.id)}
                    className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600"
                  >
                    Start Attendance
                  </button>
                )}
                {(isAdmin || isMember) && (
                  <button
                    onClick={() => handleAttend(session)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500"
                  >
                    Attend
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateSessionModal
          studyId={study.id}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchSessions}
        />
      )}

      {showAttendanceModal !== null && (() => {
        const currentSession = sessions.find(s => s.id === showAttendanceModal);
        return (
          <StartAttendanceModal
            studyId={study.id}
            sessionId={showAttendanceModal}
            initialOpenTime={currentSession?.startDateTime || ''}
            initialCloseTime={currentSession?.endDateTime || ''}
            onClose={() => setShowAttendanceModal(null)}
          />
        );
      })()}

      {showAssignmentModal !== null && (
        <AddAssignmentModal
          studyId={study.id}
          sessionId={showAssignmentModal}
          onClose={() => setShowAssignmentModal(null)}
        />
      )}
    </div>
  );
};

export default StudySessionList;
