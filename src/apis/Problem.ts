import { AxiosInstance, type PagedResponse } from '@utils';
import type {
  ProblemDetail,
  CreateProblemRequest,
  CreateProblemResponse,
  DeleteProblemResponse,
} from '@types';

export const problemApi = {
  // GET /problem
  getProblems: async (page = 0, size = 10, search?: string, filter?: 'SOLVED' | 'UNSOLVED') => {
    return AxiosInstance.get<PagedResponse<ProblemDetail>>(`/problem`, {
      params: { page, size, search, filter },
    });
  },

  // POST /problem
  createProblem: async (data: CreateProblemRequest) => {
    return AxiosInstance.post<CreateProblemResponse>(`/problem`, data);
  },

  // GET /problem/{id}
  getProblem: async (id: number) => {
    return AxiosInstance.get<ProblemDetail>(`/problem/${id}`);
  },

  // PATCH /problem/{id}
  updateProblem: async (id: number, data: CreateProblemRequest) => {
    return AxiosInstance.patch<CreateProblemResponse>(`/problem/${id}`, data);
  },

  // DELETE /problem/{id}
  deleteProblem: async (id: number) => {
    return AxiosInstance.delete<DeleteProblemResponse>(`/problem/${id}`);
  },
};
