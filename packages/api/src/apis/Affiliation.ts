import { AxiosInstance } from '../utils/AxiosInstance';
import type { AffiliationRequest, AffiliationResponse } from '@leita/types';

export const affiliationApi = {
  getAffiliations: async (): Promise<AffiliationResponse[]> => {
    return AxiosInstance.get<AffiliationResponse[]>('/admin/affiliations');
  },

  createAffiliation: async (data: AffiliationRequest): Promise<AffiliationResponse> => {
    return AxiosInstance.post<AffiliationResponse>('/admin/affiliations', data);
  },

  updateAffiliation: async (id: number, data: AffiliationRequest): Promise<AffiliationResponse> => {
    return AxiosInstance.put<AffiliationResponse>(`/admin/affiliations/${id}`, data);
  },

  deleteAffiliation: async (id: number): Promise<void> => {
    return AxiosInstance.delete<void>(`/admin/affiliations/${id}`);
  },
};
