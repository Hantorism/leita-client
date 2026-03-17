import React, { useEffect } from 'react';
import { googleLogout, useGoogleLogin, TokenResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios, { AxiosError } from 'axios';
import { Logger, AxiosInstance, Environment } from '../utils';
import { User } from '../types/User';

const API_URL = Environment.API_URL;

interface LoginProps {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const Login = ({ user, setUser }: LoginProps) => {
	const navigate = useNavigate();

	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}

		const token = localStorage.getItem('token');
		if (token) {
			AxiosInstance.get(`${API_URL}/auth/info`, {
				headers: { Authorization: `Bearer ${token}` },
			}).then((res) => {
				setUser(res.data);
			}).catch((err) => {
				// 토큰 검증에 실패해도 자동으로 로그아웃하지 않음
				Logger.error('Token validation failed:', err);
			});
		}
	}, [setUser]);

	const signInWithGoogle = useGoogleLogin({
		onSuccess: async (tokenResponse: Omit<TokenResponse, 'error' | 'error_uri' | 'error_description'>) => {
			try {
				const res = await AxiosInstance.post(`${API_URL}/auth/oauth`, {
					accessToken: tokenResponse.access_token,
				}, {
					headers: {
						'Content-Type': 'application/json',
					},
				});

				Logger.print(' Google Login Response:', res.data);

				const accessToken = res.data.data.accessToken;
				if (!accessToken) {
					return;
				}

				localStorage.setItem('accessToken', accessToken);
				Cookies.set('accessToken', accessToken, { expires: 1 });

				const userRes = await AxiosInstance.get<User>(`${API_URL}/auth/info`, {
					headers: { Authorization: `Bearer ${accessToken}` },
				});

				Logger.print(' User Info Response:', userRes.data);

				setUser(userRes.data);
				localStorage.setItem('user', JSON.stringify(userRes.data));
				if (userRes.data.email) {
					localStorage.setItem('email', userRes.data.email);
				}

				navigate('/');
			} catch (error) {
				Logger.error(' Google login failed:', error);
				if (axios.isAxiosError(error) && (error as AxiosError).response?.status === 401) {
					alert('🚨 @ajou.ac.kr의 아주대 계정으로 로그인 가능합니다!');
				} else {
					alert('🚨 로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
				}
			}
		},
		onError:   (error) => {
			Logger.error(' Google login error:', error);
		},
	});

	const logout = () => {
		googleLogout();
		setUser(null);
		localStorage.removeItem('user');
		localStorage.removeItem('accessToken');
		localStorage.removeItem('accessToken');
		Cookies.remove('accessToken');
		Cookies.remove('refreshToken');
	};

	return (
		<div className="login-container">
			{user ? (
				<div className="flex items-center gap-3">
					<span className="text-white text-sm">Hello, {user.data.name} 👋</span>
					<button
						className="relative bg-[#303030] text-[#ededed] font-light px-5 py-1 rounded-full border-none outline-none no-underline font-Pretendard hover:bg-[#ededed] hover:text-[#303030]"
						onClick={logout}
					>
						Logout
					</button>
				</div>
			) : (
				<div className="login-form">
					<button
						className="relative bg-[#303030] text-[#ededed] font-light px-5 py-1 rounded-full border-none outline-none no-underline font-Pretendard hover:bg-[#ededed] hover:text-[#303030]"
						onClick={() => signInWithGoogle()}
					>
						Sign in with Google
					</button>
				</div>
			)}
		</div>
	);
};

export default Login;
