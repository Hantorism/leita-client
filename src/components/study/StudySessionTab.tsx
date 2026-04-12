import { studySessionApi } from '@apis';
import {
  Button,
  CreateStudySessionModal,
  DeleteStudySessionModal,
  TodoAssignment,
  UpdateStudySessionModal,
} from '@components';
import { useAlert } from '@contexts';
import type { Study, StudySession } from '@types';
import { Logger, type PagedResponse } from '@utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface StudySessionTabProps {
  study: Study;
  isMember: boolean;
  isAdmin: boolean;
  currentUserEmail?: string | null;
}

const StudySessionTab = ({ study, isMember, isAdmin, currentUserEmail }: StudySessionTabProps) => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 수정/삭제 관련 상태
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateTargetSession, setUpdateTargetSession] = useState<StudySession | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetSession, setDeleteTargetSession] = useState<StudySession | null>(null);
  const [deleteTargetNumber, setDeleteTargetNumber] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await studySessionApi.getStudySessions(study.id);
      if (!isMounted.current) return;

      const { content: data } = response as unknown as PagedResponse<StudySession>;
      const sortedData = [...data].sort((a: StudySession, b: StudySession) => a.id - b.id);
      setSessions(sortedData);
    } catch (err) {
      Logger.error('Failed to fetch sessions', err);
      if (isMounted.current) {
        setError('세션 목록을 불러오지 못했습니다.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [study.id]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleDeleteSession = async () => {
    if (!deleteTargetSession) return;
    setIsDeleting(true);
    try {
      await studySessionApi.deleteStudySession(deleteTargetSession.id);
      showAlert('success', '세션이 삭제되었습니다.');
      setShowDeleteModal(false);
      setDeleteTargetSession(null);
      fetchSessions();
    } catch (err) {
      Logger.error('Delete Error:', err);
      showAlert('error', '세션 삭제에 실패했습니다.');
    } finally {
      if (isMounted.current) {
        setIsDeleting(false);
      }
    }
  };

  if (loading) return <div className="text-gray-400 mt-4 pl-2">세션 목록을 불러오는 중...</div>;
  if (error)
    return (
      <div className="mt-4 pl-2">
        <p className="text-red-400 text-sm">{error}</p>
        <Button
          variant="ghost"
          onClick={fetchSessions}
          className="mt-2 text-sm underline hover:text-white !px-0 !py-0"
        >
          다시 시도
        </Button>
      </div>
    );

  const now = Date.now();
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
  );

  // A: 시작한 시간이 현재보다 이전인 세션 중 가장 늦은 시간 (가장 최근에 시작된 세션)
  const startedSessions = sortedSessions.filter((s) => new Date(s.startDateTime).getTime() < now);
  const sessionA = startedSessions.length > 0 ? startedSessions[startedSessions.length - 1] : null;

  // B: 시작할 시간이 현재보다 이후인 세션 중 가장 빠른 시간 (현재랑 가장 가까운)
  const upcomingSessions = sortedSessions.filter((s) => new Date(s.startDateTime).getTime() > now);
  const sessionB = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  return (
    <div className="w-full mt-6">
      {currentUserEmail && sessionA && sessionA.assignmentCreated && (
        <TodoAssignment
          studyId={study.id}
          sessionId={sessionA.id}
          currentUserEmail={currentUserEmail}
        />
      )}
      <div className="flex justify-between items-center border-b border-gray-600 pb-3 pl-2">
        <h2 className="text-2xl font-semibold">스터디 세션</h2>
        {isAdmin && (
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            className="rounded-full"
          >
            + 세션 생성
          </Button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.length === 0 ? (
          <p className="text-gray-500 pl-2">등록된 세션이 없습니다.</p>
        ) : (
          sessions.map((session, index) => (
            <div
              key={session.id}
              className="bg-white bg-opacity-5 p-5 rounded-lg flex flex-col lg:flex-row justify-between items-start lg:items-center"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-medium text-[var(--color-brand)]">
                    {index + 1}회차{session.title ? ` - ${session.title}` : ''}
                  </h3>
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setUpdateTargetSession(session);
                          setShowUpdateModal(true);
                        }}
                        className="text-sm !px-2.5 !py-0.5 rounded-full hover:bg-[var(--color-brand)] hover:text-black"
                      >
                        수정
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setDeleteTargetSession(session);
                          setDeleteTargetNumber(index + 1);
                          setShowDeleteModal(true);
                        }}
                        className="text-sm !px-2.5 !py-0.5 rounded-full hover:bg-red-600 hover:text-white"
                      >
                        삭제
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  시작: {new Date(session.startDateTime).toLocaleString()} <br />
                  종료: {new Date(session.endDateTime).toLocaleString()}
                </p>
              </div>

              <div className="mt-4 lg:mt-0 flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    navigate(`/study/${study.id}/session/${session.id}`, { state: { sessionNumber: index + 1 } })
                  }
                >
                  입장하기
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateStudySessionModal
          studyId={study.id}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchSessions}
        />
      )}

      {showUpdateModal && updateTargetSession && (
        <UpdateStudySessionModal
          session={updateTargetSession}
          onClose={() => {
            setShowUpdateModal(false);
            setUpdateTargetSession(null);
          }}
          onUpdated={fetchSessions}
        />
      )}

      {showDeleteModal && deleteTargetSession && (
        <DeleteStudySessionModal
          sessionNumber={deleteTargetNumber}
          isDeleting={isDeleting}
          onConfirm={handleDeleteSession}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteTargetSession(null);
          }}
        />
      )}
    </div>
  );
};

export default StudySessionTab;
