import { AxiosInstance } from '@utils';
import type { RepositoryResponse, GitInstallResponse } from '@types';

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
