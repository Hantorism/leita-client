import { Logger } from './Logger';

export const getCurrentUserEmail = (): string | null => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser);
    return user?.data?.email?.toLowerCase().trim() || null;
  } catch (error) {
    Logger.error('Failed to parse user from localStorage', error);
    return null;
  }
};
