import { AxiosInstance } from '@utils';

export const gitApi = {
  // GET /git/repositories
  getInstalledRepositories: async () => {
    const response = await AxiosInstance.get(`/git/repositories`);
    return response.data;
  },

  // GET /git/install
  getGitInstallationUrl: async () => {
    const response = await AxiosInstance.get(`/git/install`);
    return response.data;
  },
};
