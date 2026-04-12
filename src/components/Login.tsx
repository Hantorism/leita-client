import { authApi } from '@apis';
import { useAlert, useAuth } from '@contexts';
import { googleLogout, type TokenResponse, useGoogleLogin } from '@react-oauth/google';
import { Logger } from '@utils';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { user, login, logout } = useAuth();

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse: Omit<TokenResponse, 'error' | 'error_uri' | 'error_description'>) => {
      try {
        const res = await authApi.oauthRegister({ accessToken: tokenResponse.access_token });
        Logger.print(' Google Login Response:', res);

        const accessToken = res.accessToken;
        if (!accessToken) {
          return;
        }

        await login(accessToken);
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

  const handleLogout = () => {
    googleLogout();
    logout();
  };

  return (
    <div className="login-container">
      {user ? (
        <div className="flex items-center gap-2 lg:gap-3 flex-nowrap whitespace-nowrap">
          <span className="text-white flex-shrink-0 font-light tracking-wide font-Pretendard">Hello, {user.name} 👋</span>
          <button
            className="relative bg-[#303030] text-[#ededed] font-light tracking-wide px-5 py-1.5 rounded-full border-none outline-none no-underline font-Pretendard hover:bg-[#ededed] hover:text-[#303030] flex-shrink-0 transition-colors"
            onClick={handleLogout}
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
