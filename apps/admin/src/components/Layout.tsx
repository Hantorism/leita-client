import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { authApi } from '@leita/api';
import type { InfoResponse } from '@leita/types';
import { Loader } from '@leita/ui';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<InfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setLoading(true);
        const res = await authApi.getAuthInfo();
        const info = res as unknown as InfoResponse;
        
        // Ensure user has ADMIN role
        if (info && info.role === 'ADMIN') {
          setAdminUser(info);
        } else {
          setUnauthorized(true);
        }
      } catch (err) {
        console.error('Failed to get auth info in admin console', err);
        setUnauthorized(true);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ⚠️
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight">접근 권한이 없습니다</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              이 페이지는 관리자 전용 서비스입니다.<br />
              관리자 계정으로 로그인 후 다시 시도해 주세요.
            </p>
          </div>
          <div className="pt-4 flex gap-4">
            <a
              href="http://localhost:3000"
              className="flex-1 px-5 py-3 bg-[#CAFE33] hover:bg-[#b9e82c] text-black transition-colors rounded-xl text-sm font-bold text-center"
            >
              메인 서비스로 가기
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121212] text-white font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header bar */}
        <header className="h-16 border-b border-white/5 bg-[#1A1A1A]/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">LEITA 운영 콘솔</span>
          </div>

          {adminUser && (
            <div className="flex items-center gap-4">
              <span className="px-2.5 py-1 bg-[#CAFE33]/10 text-[#CAFE33] text-xs font-bold rounded-full">
                {adminUser.role}
              </span>
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-white leading-tight">{adminUser.name}</span>
                <span className="text-xs text-gray-500 font-semibold">{adminUser.email}</span>
              </div>
            </div>
          )}
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 relative scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
