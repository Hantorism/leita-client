import type { GeneratePARRequest, GeneratePARResponse } from '@types';
import { AxiosInstance } from '@utils';

export const fileApi = {
  // POST /files/par
  generatePAR: async (data: GeneratePARRequest) => {
    return AxiosInstance.post<GeneratePARResponse>(`/files/par`, data);
  },
};
