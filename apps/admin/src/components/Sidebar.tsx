import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import type { InfoResponse } from '@leita/types';

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
  adminUser?: InfoResponse | null;
  onLogout?: () => void;
}

const SIDEBAR_COLLAPSED_KEY = 'leita_admin_sidebar_collapsed';

const Sidebar: React.FC<SidebarProps> = ({ onCollapseChange, adminUser, onLogout }) => {
  const [width, setWidth] = useState<number>(240);
  // localStorage에서 접혈 상태 복원
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  // 사이드바가 완전히 펼쳐진 후에만 true가 되어 텍스트를 노출합니다.
  const [showText, setShowText] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) !== 'true';
    } catch {
      return true;
    }
  });
  const isResizing = useRef<boolean>(false);
  const expandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
    // localStorage에 상태 저장
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
    } catch {
      // ignore
    }

    if (isCollapsed) {
      // 접힐 때: 즉시 텍스트 숨김
      setShowText(false);
      if (expandTimer.current) clearTimeout(expandTimer.current);
    } else {
      // 펼쳐질 때: transition(300ms) 완료 후 텍스트 표시
      expandTimer.current = setTimeout(() => setShowText(true), 290);
    }

    return () => {
      if (expandTimer.current) clearTimeout(expandTimer.current);
    };
  }, [isCollapsed, onCollapseChange]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  };

  const resize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    if (newWidth >= 200 && newWidth <= 400) {
      setWidth(newWidth);
      if (isCollapsed) setIsCollapsed(false);
    }
  };

  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  };

  const handleDoubleClick = () => setIsCollapsed(prev => !prev);
  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  // 접혔을 때와 펼쳐졌을 때 완전히 다른 클래스셋을 적용해 padding 충돌 방지
  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    isCollapsed
      ? `w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-white/10 text-[#CAFE33] shadow-md shadow-black/20'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`
      : `flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all duration-200 ${
          isActive
            ? 'bg-white/10 text-[#CAFE33] shadow-md shadow-black/20'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`;

  const getInitials = (name?: string) => (name ? name.charAt(0).toUpperCase() : 'A');

  return (
    <div
      style={{ width: isCollapsed ? '64px' : `${width}px` }}
      className="flex h-screen relative select-none transition-all duration-300 flex-shrink-0"
    >
      <aside className="w-full bg-[#1A1A1A] border-r border-white/5 h-full flex flex-col justify-between relative z-30 overflow-hidden">

        {/* ── 상단: 로고 + 토글 + 네비게이션 ── */}
        <div className="flex flex-col gap-8 p-4">

          {/* 로고 영역 */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {isCollapsed ? (
              /* 접혔을 때: 펴기 버튼만 */
              <button
                onClick={toggleCollapse}
                className="p-1.5 text-gray-400 hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 17 11 12 6 7" />
                </svg>
              </button>
            ) : (
              /* 펼쳤을 때: 점 + 텍스트 + 접기 버튼 */
              <>
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#CAFE33] shrink-0" />
                  {/* 텍스트는 완전히 펼쳐진 후에만 fade-in */}
                  <span
                    className={`font-black text-lg tracking-tight text-white whitespace-nowrap transition-opacity duration-200 ${
                      showText ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    LEITA Admin
                  </span>
                </div>
                <button
                  onClick={toggleCollapse}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="11 17 6 12 11 7" />
                    <polyline points="18 17 13 12 18 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* 네비게이션 */}
          <nav className={`flex flex-col gap-2 ${isCollapsed ? 'items-center' : ''}`}>
            <NavLink to="/" end className={linkStyle}>
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              {!isCollapsed && <span>대시보드</span>}
            </NavLink>

            <NavLink to="/affiliations" className={linkStyle}>
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
              </svg>
              {!isCollapsed && <span>소속 관리</span>}
            </NavLink>

            <NavLink to="/languages" className={linkStyle}>
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              {!isCollapsed && <span>언어 관리</span>}
            </NavLink>

            <NavLink to="/users" className={linkStyle}>
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {!isCollapsed && <span>유저 관리</span>}
            </NavLink>

            <NavLink to="/notices" className={linkStyle}>
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              {!isCollapsed && <span>공지사항 관리</span>}
            </NavLink>

            <NavLink to="/qnas" className={linkStyle}>
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {!isCollapsed && <span>Q&A 관리</span>}
            </NavLink>
          </nav>
        </div>

        {/* ── 하단: 유저 정보 ── */}
        <div className={`p-4 flex flex-col gap-3 border-t border-white/5 ${isCollapsed ? 'items-center' : ''}`}>

          {/* 유저 정보 */}
          {adminUser && (
            <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center gap-3'}`}>
              {/* 아바타 (항상 표시) */}
              <div className="w-8 h-8 rounded-full bg-[#CAFE33]/20 border border-[#CAFE33]/30 flex items-center justify-center shrink-0">
                <span className="text-[#CAFE33] text-xs font-black">{getInitials(adminUser.name)}</span>
              </div>

              {/* 이름 / 이메일 / 로그아웃 (펼쳐졌을 때만, 텍스트 타이밍 동일 적용) */}
              {!isCollapsed && (
                <div
                  className={`flex-1 min-w-0 flex items-center justify-between gap-2 transition-opacity duration-200 ${
                    showText ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate leading-tight">{adminUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{adminUser.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    title="로그아웃"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  >
                    {/* 로그아웃 아이콘 */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* 리사이즈 핸들 */}
      {!isCollapsed && (
        <div
          onMouseDown={startResize}
          onDoubleClick={handleDoubleClick}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-[#CAFE33]/30 active:bg-[#CAFE33] transition-colors duration-200 z-40"
          title="드래그하여 크기 조절, 더블클릭하여 접기"
        />
      )}
    </div>
  );
};

export default Sidebar;
