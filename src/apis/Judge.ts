import { AxiosInstance } from '@utils';
import type { 
  JudgeData, 
  SubmitRequest, 
  SubmitResponse, 
  RunRequest, 
  RunResponse, 
  ReviewRequest 
} from '@types';

export const judgeApi = {
  // POST /judge/submit/{problemId}
  submitCode: async (problemId: number, data: SubmitRequest) => {
    return AxiosInstance.post<SubmitResponse>(`/judge/submit/${problemId}`, data);
  },

  // POST /judge/run/{problemId}
  runCode: async (problemId: number, data: RunRequest) => {
    return AxiosInstance.post<RunResponse[]>(`/judge/run/${problemId}`, data);
  },

  // GET /judge
  getJudges: async (problemId?: number) => {
    return AxiosInstance.get<JudgeData[]>(`/judge`, { params: { problemId } });
  },

  // POST /judge/auto-commit
  addReview: async (data: ReviewRequest) => {
    return AxiosInstance.post(`/judge/auto-commit`, data);
  },
};
