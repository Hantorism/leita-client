import { AxiosInstance } from '@utils';

export const judgeApi = {
  // POST /judge/submit/{problemId}
  submitCode: async (problemId: number, data: { code: string; language: string }) => {
    const response = await AxiosInstance.post(`/judge/submit/${problemId}`, data);
    return response.data;
  },

  // POST /judge/run/{problemId}
  runCode: async (problemId: number, data: { code: string; language: string; testCases: any[] }) => {
    const response = await AxiosInstance.post(`/judge/run/${problemId}`, data);
    return response.data;
  },

  // GET /judge
  getJudges: async (problemId?: number) => {
    const response = await AxiosInstance.get(`/judge`, { params: { problemId } });
    return response.data;
  },

  // POST /judge/auto-commit
  addReview: async (data: { submitId: number; description: string; commitMessage: string; repositoryName: string }) => {
    const response = await AxiosInstance.post(`/judge/auto-commit`, data);
    return response.data;
  },
};
