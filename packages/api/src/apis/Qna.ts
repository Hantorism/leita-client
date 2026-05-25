import type { QnaPageResponse, QnaResponse, QnaRequest, QnaReplyRequest } from '@leita/types';
import { AxiosInstance } from '../utils/AxiosInstance';

export const qnaApi = {
  // GET /qna
  getAllQnas: async (page: number = 0, size: number = 10) => {
    return AxiosInstance.get<QnaPageResponse>(`/qna?page=${page}&size=${size}`);
  },

  // GET /qna/my
  getMyQnas: async (page: number = 0, size: number = 10) => {
    return AxiosInstance.get<QnaPageResponse>(`/qna/my?page=${page}&size=${size}`);
  },

  // GET /qna/{id}
  getQna: async (id: number) => {
    return AxiosInstance.get<QnaResponse>(`/qna/${id}`);
  },

  // POST /qna
  createQna: async (data: QnaRequest) => {
    return AxiosInstance.post<QnaResponse>(`/qna`, data);
  },

  // PUT /qna/{id}
  updateQna: async (id: number, data: QnaRequest) => {
    return AxiosInstance.put<QnaResponse>(`/qna/${id}`, data);
  },

  // DELETE /qna/{id}
  deleteQna: async (id: number) => {
    return AxiosInstance.delete<void>(`/qna/${id}`);
  },

  // Admin: GET /admin/qna
  getAdminQnas: async (page: number = 0, size: number = 10) => {
    return AxiosInstance.get<QnaPageResponse>(`/admin/qna?page=${page}&size=${size}`);
  },

  // Admin: GET /admin/qna/{id}
  getAdminQna: async (id: number) => {
    return AxiosInstance.get<QnaResponse>(`/admin/qna/${id}`);
  },

  // Admin: POST /admin/qna/{id}/reply
  replyQna: async (id: number, data: QnaReplyRequest) => {
    return AxiosInstance.post<QnaResponse>(`/admin/qna/${id}/reply`, data);
  },
};
export type QnaApiType = typeof qnaApi;
