import { AuthStorage } from './Auth';

export const getCurrentUserEmail = (): string | null => {
  const user = AuthStorage.getUser();
  return user?.email?.toLowerCase().trim() || null;
};
