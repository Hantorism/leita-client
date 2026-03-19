import { Environment } from '@utils/Environment';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = Environment.API_URL;

export const AxiosInstance = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

AxiosInstance.interceptors.request.use(
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

AxiosInstance.interceptors.response.use(
	res => res,
	(err: AxiosError) => {
		if (err.response?.status === 401) {
			localStorage.removeItem('user');
			localStorage.removeItem('accessToken');
			Cookies.remove('accessToken');
			Cookies.remove('refreshToken');
		}
		return Promise.reject(err);
	},
);
