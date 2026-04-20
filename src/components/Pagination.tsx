import { useEffect, useState } from 'react';
import Button from './Button';

interface PaginationProps {
  /** 현재 페이지 (0-indexed) */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 변경 콜백 (0-indexed 페이지 번호 전달) */
  onPageChange: (page: number) => void;
  /** 래퍼 요소에 추가할 className */
  className?: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) => {
  const [inputValue, setInputValue] = useState((currentPage + 1).toString());

  useEffect(() => {
    setInputValue((currentPage + 1).toString());
  }, [currentPage]);

  if (totalPages <= 0) return null;

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      onPageChange(page);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const pageNum = parseInt(inputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum - 1);
    } else {
      setInputValue((currentPage + 1).toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  return (
    <div className={`w-full flex justify-center items-center gap-3 ${className}`}>
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
        variant="ghost"
        className="px-5 py-2.5 text-gray-500 font-black hover:bg-white/5 hover:text-white disabled:opacity-20 rounded-xl transition-all"
      >
        이전
      </Button>

      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-xl border border-white/5 font-JetBrain">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="w-9 bg-white/10 border border-white/10 rounded-md text-center text-white font-black text-sm focus:outline-none focus:border-[#CAFE33]/40 transition-all py-0.5"
        />
        <span className="text-gray-700 font-normal text-xs">/</span>
        <span className="text-white font-black text-sm min-w-[1.25rem] text-center">{totalPages}</span>
      </div>

      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        variant="ghost"
        className="px-5 py-2.5 text-gray-500 font-black hover:bg-white/5 hover:text-white disabled:opacity-20 rounded-xl transition-all"
      >
        다음
      </Button>
    </div>
  );
};

export default Pagination;
