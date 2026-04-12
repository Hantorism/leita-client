import { authApi } from '@apis';
import { useAlert } from '@contexts';
import { googleLogout, type TokenResponse, useGoogleLogin } from '@react-oauth/google';
import { type User } from '@types';
import { Logger } from '@utils';
import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
}

const Login = ({ user, setUser }: LoginProps) => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (!token) {
      if (storedUser) {
        localStorage.removeItem('user');
      }
      setUser(null);
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Use authApi to validate token and refresh user info
    authApi
      .getAuthInfo()
      .then((res) => {
        if (!isMounted.current) return;
        const userData = res;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      })
      .catch((err: unknown) => {
        Logger.error('Token validation failed:', err);
        const errorResp = (err as any).response;
        if (errorResp?.status === 401) {
          if (isMounted.current) {
            setUser(null);
          }
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
        }
      });
  }, [setUser]);

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse: Omit<TokenResponse, 'error' | 'error_uri' | 'error_description'>) => {
      try {
        const res = await authApi.oauthRegister({ accessToken: tokenResponse.access_token });
        Logger.print(' Google Login Response:', res);

        const accessToken = res.accessToken;
        if (!accessToken) {
          return;
        }

        localStorage.setItem('accessToken', accessToken);

        const userRes = await authApi.getAuthInfo();
        Logger.print(' User Info Response:', userRes);

        const userData = userRes;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        navigate('/');
      } catch (error: unknown) {
        Logger.error(' Google login failed:', error);
        const errorResp = (error as any).response;
        if (errorResp?.status === 401) {
          showAlert('error', '@ajou.ac.kr의 아주대 계정으로 로그인 가능합니다!');
        } else {
          showAlert('error', '로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
        }
      }
    },
    onError: (error) => {
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
          <span className="text-white flex-shrink-0 font-light tracking-wide">Hello, {user.name} 👋</span>
          <button
            className="relative bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] font-light tracking-wide px-5 py-1.5 rounded-full border-none outline-none no-underline font-Pretendard hover:bg-[#ededed] hover:text-[#303030] flex-shrink-0 transition-colors"
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
