import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { authApi, AuthStorage } from '@leita/api';
import type { InfoResponse } from '@leita/types';
import { Loader } from '@leita/ui';
import Sidebar from './Sidebar';
import { useGoogleLogin } from '@react-oauth/google';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<InfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  const checkAdmin = async () => {
    try {
      setLoading(true);
      const res = await authApi.getAuthInfo();
      const info = res as unknown as InfoResponse;

      if (info && info.role === 'ADMIN') {
        setAdminUser(info);
        setUnauthorized(false);
      } else {
        setAdminUser(info);
        setUnauthorized(true);
      }
    } catch (err) {
      console.error('Failed to get auth info in admin console', err);
      setAdminUser(null);
      setUnauthorized(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdmin();
  }, [navigate]);

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await authApi.oauthRegister({ accessToken: tokenResponse.access_token });
        const accessToken = res.accessToken;

        if (accessToken) {
          AuthStorage.setAccessToken(accessToken);
          await checkAdmin();
        } else {
          alert('로그인 처리 중 오류가 발생했습니다.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Google login failed:', error);
        alert('로그인에 실패했습니다. 올바른 계정인지 확인해 주세요.');
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      alert('구글 로그인 중 문제가 발생했습니다.');
    },
  });

  const handleLogout = () => {
    AuthStorage.clear();
    setAdminUser(null);
    setUnauthorized(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Case 1: 로그인했지만 ADMIN 권한 없음
  if (unauthorized && adminUser) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-red-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full bg-[#161616]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-10 shadow-2xl space-y-8 text-center relative z-10">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            ⚠️
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-black tracking-tight">접근 권한이 없습니다</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              이 페이지는 관리자 전용 서비스입니다.<br />
              현재 계정(<span className="text-white font-semibold">{adminUser.email}</span>)은 관리자 권한이 없습니다.
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-5 py-3.5 bg-[#CAFE33] hover:bg-[#b9e82c] text-black transition-all rounded-xl text-sm font-bold text-center active:scale-[0.98]"
            >
              메인 서비스로 돌아가기
            </a>
            <button
              onClick={handleLogout}
              className="w-full px-5 py-3.5 border border-white/10 hover:border-red-500/20 hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-all rounded-xl text-sm font-bold active:scale-[0.98]"
            >
              다른 계정으로 로그인
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: 비로그인 상태
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#CAFE33]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full bg-[#161616]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-10 shadow-2xl space-y-8 relative z-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-2">
              <span className="text-[#CAFE33] text-2xl font-black">L</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              LEITA 운영 콘솔
            </h1>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              LEITA 서비스 관리를 위한 어드민 콘솔입니다.<br />
              승인된 관리자 계정으로 로그인해 주세요.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => signInWithGoogle()}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black hover:bg-[#CAFE33] hover:text-black transition-all duration-300 rounded-2xl text-base font-bold shadow-lg shadow-white/5 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.3C17.65 1.58 15.02 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.78 2.93c.88-2.64 3.38-4.39 6.72-4.39z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-1.99 3.4-4.92 3.4-8.55z" />
                <path fill="#FBBC05" d="M5.28 14.77c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.5 7.44C.54 9.36 0 11.55 0 13.8s.54 4.44 1.5 6.36l3.78-2.93z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.02.68-2.33 1.09-3.96 1.09-3.34 0-5.84-1.75-6.72-4.39L1.8 16.85C3.69 20.7 7.65 23 12 23z" />
              </svg>
              Google 계정으로 로그인
            </button>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-6 py-4 border border-white/5 hover:border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-300 rounded-2xl text-sm font-semibold active:scale-[0.98]"
            >
              메인 서비스로 가기
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: 어드민 로그인 및 권한 확인 완료
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121212] text-white font-sans">
      <Sidebar adminUser={adminUser} onLogout={handleLogout} />

      {/* Content View — 헤더 없이 전체 높이 사용 */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 relative scrollbar-hide min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
