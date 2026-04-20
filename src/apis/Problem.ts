import type { CreateProblemRequest, CreateProblemResponse, DeleteProblemResponse, PopularPeriod, ProblemDetail } from '@types';
import { AxiosInstance, type PagedResponse } from '@utils';

export const problemApi = {
  // GET /problem
  getProblems: async (page: number, size: number, search?: string, filter?: string) => {
    return AxiosInstance.get<PagedResponse<ProblemDetail>>(`/problem`, {
      params: { page, size, search, filter },
    });
  },

  // GET /problem/popular
  getPopularProblems: async (period: PopularPeriod = 'ALL', limit: number = 10) => {
    return AxiosInstance.get<ProblemDetail[]>(`/problem/popular`, {
      params: { period, limit },
    });
  },

  // POST /problem
  createProblem: async (data: CreateProblemRequest) => {

    return AxiosInstance.post<CreateProblemResponse>(`/problem`, data);
  },

  // GET /problem/{id}
  getProblem: async (id: string) => {
    return AxiosInstance.get<ProblemDetail>(`/problem/${id}`);
  },

  // PATCH /problem/{id}
  updateProblem: async (id: string, data: CreateProblemRequest) => {
    return AxiosInstance.patch<CreateProblemResponse>(`/problem/${id}`, data);
  },

  // DELETE /problem/{id}
  deleteProblem: async (id: string) => {
    return AxiosInstance.delete<DeleteProblemResponse>(`/problem/${id}`);
  },
};
