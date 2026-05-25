import type { GitInstallResponse, RepositoryResponse } from '@leita/types';
import { AxiosInstance } from '../utils/AxiosInstance';

export const gitApi = {
  // GET /git/repositories
  getInstalledRepositories: async () => {
    return AxiosInstance.get<RepositoryResponse[]>(`/git/repositories`);
  },

  // GET /git/install
  getGitInstallationUrl: async () => {
    return AxiosInstance.get<GitInstallResponse>(`/git/install`);
  },
};
