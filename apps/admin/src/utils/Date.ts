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
    let isoStr = dateStr;
    if (isoStr.includes('T') && !isoStr.endsWith('Z') && !isoStr.includes('+')) {
      isoStr += 'Z';
    }

    const date = new Date(isoStr);

    if (isNaN(date.getTime())) {
      return '-';
    }

    const formatter = new Intl.DateTimeFormat(undefined, options);
    return formatter.format(date);
  } catch (error) {
    console.error('Date formatting failed:', error);
    return dateStr;
  }
};

export const formatDate = (dateStr: string | null | undefined): string => {
  return formatDateTime(dateStr, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};
