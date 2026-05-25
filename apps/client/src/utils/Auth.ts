import type { InfoResponse } from '@leita/types';
import { Logger } from './Logger';

export const AUTH_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER: 'user',
} as const;

export const AuthStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, token);
  },

  getUser: (): InfoResponse | null => {
    const storedUser = localStorage.getItem(AUTH_KEYS.USER);
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      Logger.error('Failed to parse user from localStorage', error);
      return null;
    }
  },

  setUser: (user: InfoResponse): void => {
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
  },

  clear: (): void => {
    localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
  },

  // Check if we have basic auth info without validating token expiration
  hasAuthInfo: (): boolean => {
    return !!localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
  },
};

// Event system to notify components about auth changes from outside React (e.g. Axios interceptors)
export const AUTH_EVENT = 'leita-auth-event';
export const AuthAction = {
  LOGOUT: 'LOGOUT',
} as const;

export type AuthActionType = keyof typeof AuthAction;

export const notifyAuthChange = (action: AuthActionType) => {
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { action } }));
};
