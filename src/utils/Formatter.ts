/**
 * 단위 계산 및 포맷팅 유틸리티 함수
 */

/**
 * 메모리 단위를 포맷팅합니다. (KB 기준)
 * 1024KB 이상일 경우 MB, GB 단위로 변환합니다.
 */
export const formatMemory = (kb: number): string => {
  if (kb <= 0) return '0 KB';

  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = kb;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // 소수점 2자리까지 표시하되, 정수일 경우 소수점 제외
  const formattedSize = size % 1 === 0 ? size.toString() : size.toFixed(2);
  return `${formattedSize} ${units[unitIndex]}`;
};

/**
 * 시간 단위를 포맷팅합니다. (ms 기준)
 * 1000ms 이상일 경우 s 단위로 변환합니다.
 */
export const formatTime = (ms: number): string => {
  if (ms <= 0) return '0 ms';

  if (ms >= 1000) {
    const s = ms / 1000;
    const formattedS = s % 1 === 0 ? s.toString() : s.toFixed(2);
    return `${formattedS} s`;
  }

  return `${ms} ms`;
};

/**
 * 코드 길이를 포맷팅합니다. (B 기준)
 * 1024B 이상일 경우 KB 단위로 변환합니다.
 */
export const formatCodeSize = (bytes: number): string => {
  if (bytes <= 0) return '0 B';

  if (bytes >= 1024) {
    const kb = bytes / 1024;
    const formattedKb = kb % 1 === 0 ? kb.toString() : kb.toFixed(2);
    return `${formattedKb} KB`;
  }

  return `${bytes} B`;
};
