import { AxiosInstance } from '@utils';
import type { InfoResponse, JwtResponse, OAuthRequest } from '@types';

export const authApi = {
  // GET /auth/info
  getAuthInfo: async () => {
    return AxiosInstance.get<InfoResponse>(`/auth/info`);
  },

  // POST /auth/oauth
  oauthRegister: async (data: OAuthRequest) => {
    return AxiosInstance.post<JwtResponse>(`/auth/oauth`, data);
  },
};
