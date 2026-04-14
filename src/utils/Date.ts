import { Logger } from './Logger';

/**
 * UTC 날짜 문자열을 사용자의 로컬 시간대로 변환하고 포맷팅합니다.
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
    const date = new Date(dateStr);

    // 유효하지 않은 날짜 처리
    if (isNaN(date.getTime())) {
      return '-';
    }

    // 로컬 시간대로 포맷팅
    const formatter = new Intl.DateTimeFormat(undefined, options);
    const formatted = formatter.format(date);

    // UTC 오프셋 계산 (예: UTC+9)
    const offsetMinutes = -date.getTimezoneOffset();
    const offsetHours = offsetMinutes / 60;
    const offsetSign = offsetHours >= 0 ? '+' : '';
    const offsetStr = `(UTC${offsetSign}${offsetHours})`;

    return `${formatted} ${offsetStr}`;
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
  }).split(' (')[0]; // 오프셋 제외
};
