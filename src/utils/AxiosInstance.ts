import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

instance.interceptors.response.use(
  res => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      // 로그아웃 로직이 여기선 직접 접근 불가 -> 브라우저 리다이렉트
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    }
    return Promise.reject(err);
  }
);

export default instance;