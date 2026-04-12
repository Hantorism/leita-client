/**
 * 세션 과제의 상태(완료, 부분 완료, 미완료)를 계산하여 텍스트와 색상 정보를 반환합니다.
 *
 * @param solvedCount 해결한 문제 수
 * @param totalCount 전체 문제 수
 * @param isAttemptedAll 모든 문제를 시도했는지 여부
 * @returns { text: string, color: string, twColor: string } 상태 설명과 색상값
 */
export const getSessionAssignmentStatus = (solvedCount: number, totalCount: number, isAttemptedAll: boolean) => {
  if (totalCount === 0) {
    return {
      text: '과제 없음',
      color: '#262626',
      twColor: 'text-gray-500',
    };
  }

  // 1. 완료: 모든 문제가 정답인 상태
  if (solvedCount === totalCount) {
    return {
      text: '완료',
      color: '#22c55e',
      twColor: 'text-[var(--color-brand)]',
    };
  }

  // 2. 부분 완료: 모든 문제를 시도했으나 일부 오답이 있는 상태
  if (isAttemptedAll) {
    return {
      text: '부분 완료',
      color: '#eab308',
      twColor: 'text-[#FACC15]',
    };
  }

  // 3. 미완료: 미시도가 하나라도 있는 상태
  return {
    text: '미완료',
    color: '#ef4444',
    twColor: 'text-[#F87171]',
  };
};

/**
 * 개별 문제의 상태(정답, 오답, 미시도)를 계산하여 UI 정보를 반환합니다.
 *
 * @param status 문제 상태 ('CORRECT', 'WRONG', 'UNATTEMPTED')
 * @returns { text: string, twColor: string, bgColor: string, borderColor: string }
 */
export const getProblemStatusDetail = (status: 'CORRECT' | 'WRONG' | 'UNATTEMPTED') => {
  if (status === 'CORRECT') {
    return {
      text: '정답',
      twColor: 'text-[#cafe33]',
      bgColor: 'bg-[#cafe33]/10',
      borderColor: 'border-[#cafe33]/30',
    };
  }
  if (status === 'WRONG') {
    return {
      text: '오답',
      twColor: 'text-[#F87171]',
      bgColor: 'bg-[#F87171]/10',
      borderColor: 'border-[#F87171]/30',
    };
  }
  return {
    text: '미시도',
    twColor: 'text-gray-500',
    bgColor: 'bg-white/5',
    borderColor: 'border-white/5',
  };
};
