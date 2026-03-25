import { AxiosInstance } from '@utils';

export const authApi = {
  // GET /auth/info
  getAuthInfo: async () => {
    const response = await AxiosInstance.get(`/auth/info`);
    return response.data;
  },

  // POST /auth/oauth
  oauthRegister: async (accessToken: string) => {
    const response = await AxiosInstance.post(`/auth/oauth`, { accessToken });
    return response.data;
  },
};
