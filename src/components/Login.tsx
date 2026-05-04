import { authApi } from '@apis';
import { useAlert, useAuth } from '@contexts';
import { googleLogout, type TokenResponse, useGoogleLogin } from '@react-oauth/google';
import { Logger } from '@utils';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { user, login, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse: Omit<TokenResponse, 'error' | 'error_uri' | 'error_description'>) => {
      try {
        const res = await authApi.oauthRegister({ accessToken: tokenResponse.access_token });

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
    <div className="login-container relative">
      {user ? (
        <div className="flex items-center gap-2">
          <button
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 hover:border-[#CAFE33] transition-colors focus:outline-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#CAFE33] text-black flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>
            )}
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute top-12 right-0 w-48 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 mb-1 bg-white/5">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                </div>

                <Link
                  to="/mypage"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#CAFE33] transition-colors font-semibold"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  마이페이지
                </Link>

                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-red-400 transition-colors font-semibold"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                >
                  로그아웃
                </button>
              </div>
            </>
          )}
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
