import type { JudgeData, ReviewRequest, RunRequest, RunResponse, SubmitRequest, SubmitResponse } from '@types';
import { AxiosInstance } from '@utils';

export const judgeApi = {
  // POST /judge/submit/{problemId}
  submitCode: async (problemId: string, data: SubmitRequest) => {
    return AxiosInstance.post<SubmitResponse>(`/judge/submit/${problemId}`, data);
  },

  // POST /judge/run/{problemId}
  runCode: async (problemId: string, data: RunRequest) => {
    return AxiosInstance.post<RunResponse[]>(`/judge/run/${problemId}`, data);
  },

  // GET /judge
  getJudges: async (problemId?: string) => {
    return AxiosInstance.get<JudgeData[]>(`/judge`, { params: { problemId } });
  },

  // GET /judge/{judgeId}
  getJudgeDetail: async (judgeId: number) => {
    return AxiosInstance.get(`/judge/${judgeId}`);
  },

  // POST /judge/auto-commit
  addReview: async (data: ReviewRequest) => {
    return AxiosInstance.post(`/judge/auto-commit`, data);
  },
};
