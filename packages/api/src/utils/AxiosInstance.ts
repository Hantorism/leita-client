import axios, { type AxiosError, type AxiosRequestConfig, type AxiosInstance as OriginalAxiosInstance } from 'axios';
import { AuthStorage, notifyAuthChange } from './Auth';

const API_BASE_PATH = '/api';

interface TypedAxiosInstance extends Omit<OriginalAxiosInstance, 'get' | 'post' | 'put' | 'patch' | 'delete'> {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

export const AxiosInstance = axios.create({
  baseURL: API_BASE_PATH,
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

    // totalPages가 숫자로 명시적으로 존재할 때만 페이지 응답으로 처리합니다.
    // 'content' 필드만으로는 판별하지 않습니다 — QnaResponse·NoticeResponse도 content(string) 필드를 가지기 때문입니다.
    if (data && typeof data === 'object' && typeof data.totalPages === 'number') {
      return {
        content: data.content ?? (Array.isArray(data) ? data : []),
        totalPages: data.totalPages ?? 1,
        totalElements: data.totalElements,
        currentPage: data.currentPage ?? data.number,
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
