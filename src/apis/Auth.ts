import type { InfoResponse, JwtResponse, OAuthRequest, UpdateInfoRequest } from '@types';
import { AxiosInstance } from '@utils';

export const authApi = {
  // GET /auth/info
  getAuthInfo: async () => {
    return AxiosInstance.get<InfoResponse>(`/auth/info`);
  },

  // POST /auth/oauth
  oauthRegister: async (data: OAuthRequest) => {
    return AxiosInstance.post<JwtResponse>(`/auth/oauth`, data);
  },

  // PATCH /auth/info
  updateAuthInfo: async (data: UpdateInfoRequest) => {
    return AxiosInstance.patch<InfoResponse>(`/auth/info`, data);
  },
};
