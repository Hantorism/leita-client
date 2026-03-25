import { AxiosInstance } from '@utils';

export const problemApi = {
  // GET /problem
  getProblems: async (page = 0, size = 10, search?: string, filter?: 'SOLVED' | 'UNSOLVED') => {
    const response = await AxiosInstance.get(`/problem`, { params: { page, size, search, filter } });
    return response.data;
  },

  // POST /problem
  createProblem: async (data: any) => {
    const response = await AxiosInstance.post(`/problem`, data);
    return response.data;
  },

  // GET /problem/{id}
  getProblem: async (id: number) => {
    const response = await AxiosInstance.get(`/problem/${id}`);
    return response.data;
  },

  // PATCH /problem/{id}
  updateProblem: async (id: number, data: any) => {
    const response = await AxiosInstance.patch(`/problem/${id}`, data);
    return response.data;
  },

  // DELETE /problem/{id}
  deleteProblem: async (id: number) => {
    const response = await AxiosInstance.delete(`/problem/${id}`);
    return response.data;
  },
};
