import { judgeApi, problemApi } from '@apis';
import type { ProblemDetail } from '@types';
import { useEffect, useState } from 'react';

export type AssignmentStatus = 'CORRECT' | 'WRONG' | 'UNATTEMPTED';

export interface AssignmentProblem extends ProblemDetail {
  status: AssignmentStatus;
}

export interface AssignmentProgress {
  problems: AssignmentProblem[];
  progress: {
    solvedCount: number;
    totalCount: number;
    isAttemptedAll: boolean;
  };
  loading: boolean;
}

export const useAssignmentProgress = (problemIds: string[]): AssignmentProgress => {
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<AssignmentProblem[]>([]);
  const [progress, setProgress] = useState({
    solvedCount: 0,
    totalCount: problemIds.length,
    isAttemptedAll: false,
  });

  useEffect(() => {
    // 문제 목록이 없을 경우 초기화 후 바로 종료
    if (!problemIds || problemIds.length === 0) {
      setLoading(false);
      setProblems([]);
      setProgress({ solvedCount: 0, totalCount: 0, isAttemptedAll: false });
      return;
    }

    const fetchProgressData = async () => {
      try {
        setLoading(true);

        // 1. 문제 상세 정보 병렬 조회 (제목 등)
        const fetchedProblems = await Promise.all(
          problemIds.map((id) =>
            problemApi
              .getProblem(id)
              .then((res) => res as unknown as ProblemDetail)
              .catch(() => ({ problemId: id, title: `문제 ${id}` }) as unknown as ProblemDetail),
          ),
        );

        // 2. 사용자의 풀이 현황 조회 및 상태 주입
        // 추후 getMemberAssignment api로 수정 예정
        const judgeRes = await judgeApi.getJudges();
        const myJudges = (judgeRes as unknown as any[]) || [];

        let solvedCount = 0;
        let attemptedCount = 0;

        const problemsWithStatus: AssignmentProblem[] = fetchedProblems.map((p) => {
          const myProblemJudges = myJudges.filter((j: any) => j.problemId === p.problemId);
          let status: AssignmentStatus = 'UNATTEMPTED';

          if (myProblemJudges.length > 0) {
            attemptedCount++;
            if (myProblemJudges.some((j: any) => j.result === 'CORRECT')) {
              status = 'CORRECT';
              solvedCount++;
            } else {
              status = 'WRONG';
            }
          }

          return { ...p, status };
        });

        setProblems(problemsWithStatus);
        setProgress({
          solvedCount,
          totalCount: problemIds.length,
          isAttemptedAll: attemptedCount === problemIds.length,
        });
      } catch (error) {
        console.error('Failed to fetch assignment progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [JSON.stringify(problemIds)]);

  return {
    problems,
    progress,
    loading,
  };
};
