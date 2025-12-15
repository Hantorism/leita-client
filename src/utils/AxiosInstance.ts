import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import Environment from './Environment';

const API_URL = Environment.API_URL;

const instance = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

instance.interceptors.request.use(
	config => {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	error => {
		return Promise.reject(error);
	},
);

instance.interceptors.response.use(
	res => res,
	(err: AxiosError) => {
		if (err.response?.status === 401) {
			// 로그아웃 로직이 여기선 직접 접근 불가 -> 브라우저 리다이렉트
			localStorage.removeItem('user');
			localStorage.removeItem('accessToken'); // 'token' 대신 'accessToken' 제거
			Cookies.remove('accessToken');
			Cookies.remove('refreshToken');
		}
		return Promise.reject(err);
	},
);

export default instance;
