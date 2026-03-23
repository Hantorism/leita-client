import { useEffect, Dispatch, SetStateAction } from 'react';
import { Logger, AxiosInstance, Environment } from '@utils';
import { User } from '@types';
import { googleLogout, useGoogleLogin, TokenResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useAlert } from '@contexts';

const API_URL = Environment.API_URL;

interface LoginProps {
	user: User | null;
	setUser: Dispatch<SetStateAction<User | null>>;
}

const Login = ({ user, setUser }: LoginProps) => {
	const navigate = useNavigate();
	const { showAlert } = useAlert();

	useEffect(() => {
		const token = localStorage.getItem('accessToken');
		const storedUser = localStorage.getItem('user');

		if (!token) {
			// 토큰이 없는데 유저 데이터가 남아있으면 즉시 초기화
			if (storedUser) {
				localStorage.removeItem('user');
			}
			setUser(null);
			return;
		}

		// 토큰이 있을 때만 기존 유저 데이터 로드
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}

		// 서버를 통해 현재 토큰이 유효한지 검증 (동시에 최신 유저 정보 갱신)
		AxiosInstance.get(`${API_URL}/auth/info`, {
			headers: { Authorization: `Bearer ${token}` },
		}).then((res: any) => {
			setUser(res.data);
			localStorage.setItem('user', JSON.stringify(res.data));
		}).catch((err: any) => {
			Logger.error('Token validation failed:', err);
			// 토큰 만료 등 권한 에러 발생 시 로그아웃 처리
			if (err.response?.status === 401) {
				setUser(null);
				localStorage.removeItem('user');
				localStorage.removeItem('accessToken');
			}
		});
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

				const userRes = await AxiosInstance.get<User>(`${API_URL}/auth/info`, {
					headers: { Authorization: `Bearer ${accessToken}` },
				});

				Logger.print(' User Info Response:', userRes.data);

				setUser(userRes.data);
				localStorage.setItem('user', JSON.stringify(userRes.data));

				navigate('/');
			} catch (error) {
				Logger.error(' Google login failed:', error);
				if (axios.isAxiosError(error) && (error as AxiosError).response?.status === 401) {
					showAlert('error', '@ajou.ac.kr의 아주대 계정으로 로그인 가능합니다!');
				} else {
					showAlert('error', '로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
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
	};

	return (
		<div className="login-container">
			{user ? (
				<div className="flex items-center gap-2 lg:gap-3 flex-nowrap whitespace-nowrap">
					<span className="text-white flex-shrink-0 font-light tracking-wide">Hello, {user.data.name} 👋</span>
					<button
						className="relative bg-[#303030] text-[#ededed] font-light tracking-wide px-5 py-1.5 rounded-full border-none outline-none no-underline font-Pretendard hover:bg-[#ededed] hover:text-[#303030] flex-shrink-0 transition-colors"
						onClick={logout}
					>
						Logout
					</button>
				</div>
			) : (
				<div className="login-form">
					<button
						className="relative bg-[#303030] text-[#ededed] font-light tracking-wide px-6 py-2 rounded-full border-none outline-none no-underline font-Pretendard hover:bg-[#ededed] hover:text-[#303030] transition-colors"
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
