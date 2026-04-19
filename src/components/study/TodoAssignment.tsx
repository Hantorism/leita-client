import { studySessionApi } from '@apis';
import { useAssignmentProgress } from '@hooks';
import type { StudySessionDetail } from '@types';
import { getProblemStatusDetail, getSessionAssignmentStatus, Logger, type PagedResponse } from '@utils';
import { useEffect, useMemo, useState } from 'react';

interface TodoAssignmentProps {
  studyId: number;
  sessionId: number;
  currentUserEmail?: string;
}

const TodoAssignment = ({ studyId, sessionId, currentUserEmail }: TodoAssignmentProps) => {
  const [loading, setLoading] = useState(true);
  const [nextSession, setNextSession] = useState<StudySessionDetail | null>(null);
  const [sessionNumber, setSessionNumber] = useState<number | null>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setLoading(true);

        // 1. 세션 정보를 가져와 회차(Index) 계산
        const sessionsRes = await studySessionApi.getStudySessions(studyId);
        const { content: sessions } = sessionsRes as unknown as PagedResponse<any>;

        if (Array.isArray(sessions)) {
          const sorted = [...sessions].sort(
            (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
          );
          const index = sorted.findIndex((s) => s.id === sessionId);
          setSessionNumber(index !== -1 ? index + 1 : null);
        }

        const sessionDetailRes = await studySessionApi.getStudySession(sessionId);
        setNextSession(sessionDetailRes as unknown as StudySessionDetail);
      } catch (err) {
        Logger.error('Failed to fetch session data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [studyId, sessionId]);

  const problemIds = useMemo(() => nextSession?.assignment?.problems?.map((p) => String(p.problemId)) || [], [nextSession]);
  const { problems, progress, loading: hookLoading } = useAssignmentProgress(problemIds);

  if (loading || hookLoading) return null;
  if (!nextSession || !nextSession.assignment || !progress) return null;

  const status = getSessionAssignmentStatus(progress.solvedCount, progress.totalCount, progress.isAttemptedAll);

  return (
    <div className="w-full bg-black/20 border border-gray-800 rounded-xl p-8 mb-8 mt-2 flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-800/50 pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 w-fit">
            <span className="border border-[var(--color-brand)] text-white bg-[var(--color-brand)]/10 px-3 py-1 rounded-full text-sm font-bold shrink-0">
              TODO 과제
            </span>
            <h2 className="text-xl font-bold text-gray-100 flex items-center shrink-0">
              {sessionNumber}회차{nextSession.title ? ` - ${nextSession.title}` : ''}
            </h2>
          </div>

          <div className="flex items-baseline gap-2 pl-1">
            <span className="font-bold text-[var(--color-brand)]">{progress.solvedCount}</span>
            <span className="text-gray-500 font-medium">/</span>
            <span className="text-gray-400">{progress.totalCount} 문제 완료</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-lg font-bold">
          <span className="text-white">과제 상태:</span>
          <span className={status.twColor}>{status.text}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {problems.map((problem, idx) => {
          const probStatus = getProblemStatusDetail(problem.status);

          return (
            <div
              key={`${problem.problemId}-${idx}`}
              onClick={() => window.open(`/problems/${problem.problemId}`, '_blank')}
              className={`
                group cursor-pointer p-4 rounded-lg border transition-all duration-200
                ${probStatus.bgColor} ${probStatus.borderColor} hover:border-white/30
              `}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <h3 className="text-sm font-semibold truncate text-gray-200 group-hover:text-white transition-colors">
                    {problem.problemId}. {problem.title}
                  </h3>
                </div>
                <span className={`text-sm font-bold shrink-0 ${probStatus.twColor}`}>{probStatus.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodoAssignment;
