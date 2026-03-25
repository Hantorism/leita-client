import { AxiosInstance } from '@utils';

export const fileApi = {
  // POST /files/par
  generatePAR: async (objectName: string) => {
    const response = await AxiosInstance.post(`/files/par`, { objectName });
    return response.data;
  },
};
