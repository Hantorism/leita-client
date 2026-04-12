interface PaginationProps {
  /** 현재 페이지 (0-indexed) */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 변경 콜백 (0-indexed 페이지 번호 전달) */
  onPageChange: (page: number) => void;
  /** 한 번에 보여줄 최대 페이지 버튼 수 (기본값: 5) */
  maxVisiblePages?: number;
  /** 래퍼 요소에 추가할 className */
  className?: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  className = '',
}: PaginationProps) => {
  if (totalPages <= 0) return null;

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      onPageChange(page);
    }
  };

  // 슬라이딩 윈도우 방식으로 보여줄 페이지 범위 계산
  let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(0, endPage - maxVisiblePages + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={`flex justify-center items-center gap-2 ${className}`}>
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-4 py-2 rounded-lg bg-[#2a2a2a] text-gray-300 text-sm font-medium hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        이전
      </button>
      <div className="flex gap-1 mx-2">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`min-w-[32px] h-[32px] rounded-lg text-sm font-medium transition-colors ${
              currentPage === page
                ? 'bg-[var(--color-brand)] text-black'
                : 'bg-transparent text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {page + 1}
          </button>
        ))}
      </div>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="px-4 py-2 rounded-lg bg-[#2a2a2a] text-gray-300 text-sm font-medium hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        다음
      </button>
    </div>
  );
};

export default Pagination;
