import { Logger } from './Logger';

/**
 * 서버에서 내려온 UTC 날짜 문자열을 사용자의 로컬 시간대로 변환하고 포맷팅합니다.
 * @param dateStr UTC 날짜 문자열 (ISO 8601 등)
 * @param options Intl.DateTimeFormatOptions
 * @returns 포맷팅된 로컬 시간 문자열
 */
export const formatDateTime = (
  dateStr: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
): string => {
  if (!dateStr) return '-';

  try {
    // 서버에서 'Z' 또는 시간대 정보 없이 내려오는 경우 (LocalDateTime)
    // 브라우저가 이를 로컬 시간으로 오해하지 않도록 UTC로 강제 지정합니다.
    let isoStr = dateStr;
    if (isoStr.includes('T') && !isoStr.endsWith('Z') && !isoStr.includes('+')) {
      isoStr += 'Z';
    }

    const date = new Date(isoStr);

    // 유효하지 않은 날짜 처리
    if (isNaN(date.getTime())) {
      return '-';
    }

    // 로컬 시간대로 포맷팅
    const formatter = new Intl.DateTimeFormat(undefined, options);
    return formatter.format(date);
  } catch (error) {
    Logger.error('Date formatting failed:', error);
    return dateStr;
  }
};

/**
 * 날짜만 포맷팅합니다. (예: 2024. 04. 07.)
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  return formatDateTime(dateStr, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};
