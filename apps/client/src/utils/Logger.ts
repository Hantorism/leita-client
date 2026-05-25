import { Profile } from './Profile';

export const Logger = {
  print: (...args: any[]) => {
    if (Profile.isNotProd()) {
    }
  },
  error: (...args: any[]) => {
    if (Profile.isNotProd()) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (Profile.isNotProd()) {
      console.warn(...args);
    }
  },
};
