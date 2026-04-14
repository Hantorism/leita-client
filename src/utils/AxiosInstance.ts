import axios, { type AxiosError, type AxiosRequestConfig, type AxiosInstance as OriginalAxiosInstance } from 'axios';
import { AuthStorage, notifyAuthChange } from './Auth';
import { Environment } from './Environment';

const API_URL = Environment.API_URL;

interface TypedAxiosInstance extends Omit<OriginalAxiosInstance, 'get' | 'post' | 'put' | 'patch' | 'delete'> {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

export const AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}) as TypedAxiosInstance;

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements?: number;
  currentPage?: number;
  size?: number;
}

export const extractErrorMessage = (err: unknown, defaultMessage: string = '알 수 없는 오류'): string => {
  if (err instanceof Error) {
    const error = err as any;
    return error.response?.data?.message || err.message || defaultMessage;
  }
  return typeof err === 'string' ? err : defaultMessage;
};

AxiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = AuthStorage.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

AxiosInstance.interceptors.response.use(
  (res) => {
    const rawData = res.data;
    const data = rawData.data ?? rawData;

    if (data && typeof data === 'object' && ('content' in data || 'totalPages' in data)) {
      return {
        content: data.content ?? (Array.isArray(data) ? data : []),
        totalPages: data.totalPages ?? 1,
        totalElements: data.totalElements,
        currentPage: data.currentPage ?? data.number, // 서버 필드 명 대응 (number -> currentPage)
        size: data.size,
      };
    }

    return data;
  },
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      AuthStorage.clear();
      notifyAuthChange('LOGOUT');
    }
    return Promise.reject(err);
  },
);
