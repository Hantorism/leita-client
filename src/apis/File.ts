import { AxiosInstance } from '@utils';
import type { GeneratePARRequest, GeneratePARResponse } from '@types';

export const fileApi = {
  // POST /files/par
  generatePAR: async (data: GeneratePARRequest) => {
    return AxiosInstance.post<GeneratePARResponse>(`/files/par`, data);
  },
};
