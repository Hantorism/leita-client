import type { NoticePageResponse, NoticeResponse, NoticeRequest } from '@leita/types';
import { AxiosInstance } from '../utils/AxiosInstance';

export const noticeApi = {
  // GET /notices
  getNotices: async (page: number = 0, size: number = 10) => {
    return AxiosInstance.get<NoticePageResponse>(`/notices?page=${page}&size=${size}`);
  },

  // GET /notices/{id}
  getNotice: async (id: number) => {
    return AxiosInstance.get<NoticeResponse>(`/notices/${id}`);
  },

  // Admin: GET /admin/notices
  getAdminNotices: async (page: number = 0, size: number = 10) => {
    return AxiosInstance.get<NoticePageResponse>(`/admin/notices?page=${page}&size=${size}`);
  },

  // Admin: GET /admin/notices/{id}
  getAdminNotice: async (id: number) => {
    return AxiosInstance.get<NoticeResponse>(`/admin/notices/${id}`);
  },

  // Admin: POST /admin/notices
  createNotice: async (data: NoticeRequest) => {
    return AxiosInstance.post<NoticeResponse>(`/admin/notices`, data);
  },

  // Admin: PUT /admin/notices/{id}
  updateNotice: async (id: number, data: NoticeRequest) => {
    return AxiosInstance.put<NoticeResponse>(`/admin/notices/${id}`, data);
  },

  // Admin: DELETE /admin/notices/{id}
  deleteNotice: async (id: number) => {
    return AxiosInstance.delete<void>(`/admin/notices/${id}`);
  },
};
export type NoticeApiType = typeof noticeApi;
