import type { GeneratePARRequest, GeneratePARResponse } from '@leita/types';
import { AxiosInstance } from '../utils/AxiosInstance';

export const fileApi = {
  // POST /files/par
  generatePAR: async (data: GeneratePARRequest) => {
    return AxiosInstance.post<GeneratePARResponse>(`/files/par`, data);
  },
};
