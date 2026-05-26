import type { InfoResponse } from '@leita/types';
import { Logger } from './Logger';

export const AUTH_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER: 'user',
} as const;

// Helper functions for cookies
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name: string, value: string, maxAgeSeconds: number = 604800) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

export const AuthStorage = {
  getAccessToken: (): string | null => {
    const cookieToken = getCookie(AUTH_KEYS.ACCESS_TOKEN);
    if (cookieToken) return cookieToken;

    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
    }
    return null;
  },

  setAccessToken: (token: string): void => {
    setCookie(AUTH_KEYS.ACCESS_TOKEN, token);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, token);
    }
  },

  getUser: (): InfoResponse | null => {
    const cookieUser = getCookie(AUTH_KEYS.USER);
    if (cookieUser) {
      try {
        return JSON.parse(cookieUser);
      } catch (error) {
        Logger.error('Failed to parse user from cookie', error);
      }
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUser = localStorage.getItem(AUTH_KEYS.USER);
      if (!storedUser) return null;
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        Logger.error('Failed to parse user from localStorage', error);
        return null;
      }
    }
    return null;
  },

  setUser: (user: InfoResponse): void => {
    const userStr = JSON.stringify(user);
    setCookie(AUTH_KEYS.USER, userStr);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(AUTH_KEYS.USER, userStr);
    }
  },

  clear: (): void => {
    deleteCookie(AUTH_KEYS.ACCESS_TOKEN);
    deleteCookie(AUTH_KEYS.USER);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_KEYS.USER);
    }
  },

  // Check if we have basic auth info without validating token expiration
  hasAuthInfo: (): boolean => {
    return !!AuthStorage.getAccessToken();
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
