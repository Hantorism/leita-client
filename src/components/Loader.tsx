const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212]">
      <div className="w-12 h-12 border-4 border-gray-700/50 border-t-[#CAFE33] rounded-full animate-spin shadow-[0_0_15px_rgba(202,255,51,0.2)]"></div>
      <p className="text-gray-400 mt-4 text-sm font-Pretendard font-medium animate-pulse">로딩 중...</p>
    </div>
  );
};

export default Loader;
