import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapseChange }) => {
  const [width, setWidth] = useState<number>(240);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const isResizing = useRef<boolean>(false);

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
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
      if (isCollapsed) {
        setIsCollapsed(false);
      }
    }
  };

  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  };

  const handleDoubleClick = () => {
    setIsCollapsed(prev => !prev);
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all duration-200 ${
      isActive
        ? 'bg-white/10 text-[#CAFE33] shadow-md shadow-black/20'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <div className="flex h-screen relative select-none">
      <aside
        style={{ width: isCollapsed ? '64px' : `${width}px` }}
        className="bg-[#1A1A1A] border-r border-white/5 h-full flex flex-col justify-between transition-all duration-300 relative z-30"
      >
        <div className="flex flex-col gap-8 p-4">
          {/* Header */}
          <div className={`flex items-center justify-between ${isCollapsed ? 'justify-center' : ''}`}>
            {!isCollapsed && (
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#CAFE33]" />
                <span className="font-black text-lg tracking-tight text-white">LEITA Admin</span>
              </div>
            )}
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isCollapsed ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-2">
            <NavLink to="/" end className={linkStyle}>
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
              </svg>
              {!isCollapsed && <span>대시보드</span>}
            </NavLink>

            <NavLink to="/notices" className={linkStyle}>
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
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

        {/* Footer info or Link to client */}
        <div className="p-4 flex flex-col gap-2 border-t border-white/5">
          <a
            href="http://localhost:3000"
            className="flex items-center gap-4 px-4 py-3 text-sm font-bold text-gray-500 hover:text-[#CAFE33] transition-colors rounded-xl hover:bg-white/5"
          >
            <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            {!isCollapsed && <span>메인 서비스</span>}
          </a>
        </div>
      </aside>

      {/* Resize handle */}
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
