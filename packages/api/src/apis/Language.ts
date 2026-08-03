import { AxiosInstance } from '../utils/AxiosInstance';
import type { LanguageRequest, LanguageResponse } from '@leita/types';

export const languageApi = {
  // 공개 API (클라이언트가 지원 언어 목록 동적 fetch할 때 사용)
  getLanguages: async (): Promise<LanguageResponse[]> => {
    return AxiosInstance.get<LanguageResponse[]>('/languages');
  },

  // 어드민 API (언어 CRUD)
  getAdminLanguages: async (): Promise<LanguageResponse[]> => {
    return AxiosInstance.get<LanguageResponse[]>('/admin/languages');
  },

  createLanguage: async (data: LanguageRequest): Promise<LanguageResponse> => {
    return AxiosInstance.post<LanguageResponse>('/admin/languages', data);
  },

  updateLanguage: async (id: number, data: LanguageRequest): Promise<LanguageResponse> => {
    return AxiosInstance.put<LanguageResponse>(`/admin/languages/${id}`, data);
  },

  deleteLanguage: async (id: number): Promise<void> => {
    return AxiosInstance.delete<void>(`/admin/languages/${id}`);
  },
};
