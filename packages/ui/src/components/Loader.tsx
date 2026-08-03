import React from 'react';

interface LoaderProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  fullScreen = false,
  size = 'md',
  text = '로딩 중...',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 min-h-screen w-full flex flex-col items-center justify-center bg-[#0C0C0C]/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center py-12 w-full h-full min-h-[160px]';

  return (
    <div className={`${containerClass} ${className}`}>
      <div
        className={`${sizeClasses[size]} border-white/10 border-t-[#CAFE33] rounded-full animate-spin shadow-[0_0_15px_rgba(202,255,51,0.25)]`}
      />
      {text && (
        <p className="text-gray-400 mt-3.5 text-xs sm:text-sm font-sans font-medium tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
