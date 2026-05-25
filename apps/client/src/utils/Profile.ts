import { Environment } from './Environment';

const PROFILE = Environment.PROFILE;

export const Profile = {
  isLocal: () => {
    if (PROFILE === 'local') {
      return true;
    }
  },
  isDev: () => {
    if (PROFILE === 'dev') {
      return true;
    }
  },
  isProd: () => {
    if (PROFILE === 'prod') {
      return true;
    }
  },
  isNotProd: () => {
    if (PROFILE !== 'prod') {
      return true;
    }
  },
};
