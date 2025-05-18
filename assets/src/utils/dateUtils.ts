import i18n from '../i18n';

/**
 * Format a date to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format currency (based on WooCommerce settings)
 */
export function formatCurrency(amount: number): string {
  // Detect language and set currency
  const lang = window.wooStatsx?.locale || i18n.language || 'en';
  const isHebrew = lang === 'he' || lang.startsWith('he');
  const currency = isHebrew ? 'ILS' : 'USD';
  const locale = isHebrew ? 'he-IL' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number with commas
 */
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-US').format(number);
}

/**
 * Get date range label for display
 */
export function getDateRangeLabel(from: string, to: string): string {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  const fromFormatted = fromDate.toLocaleDateString('en-US', options);
  const toFormatted = toDate.toLocaleDateString('en-US', options);
  
  return `${fromFormatted} - ${toFormatted}`;
}

/**
 * Get preset date ranges for the date picker
 */
export function getPresetDateRanges() {
  // Today
  const today = new Date();
  const todayFormatted = formatDate(today);

  // Yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = formatDate(yesterday);

  // Last 7 Days
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const last7DaysFormatted = formatDate(last7Days);

  // Last 30 Days
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const last30DaysFormatted = formatDate(last30Days);

  // This Month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const thisMonthFormatted = formatDate(thisMonth);

  // Last Month
  const lastMonth = new Date();
  lastMonth.setDate(1);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStart = formatDate(lastMonth);
  
  const lastMonthEnd = new Date();
  lastMonthEnd.setDate(0);
  const lastMonthEndFormatted = formatDate(lastMonthEnd);

  const lastHalfYear = new Date();
  lastHalfYear.setMonth(lastHalfYear.getMonth() - 6);
  const lastHalfYearFormatted = formatDate(lastHalfYear);

  const lastYear = new Date();
  lastYear.setFullYear(lastYear.getFullYear() - 1);
  const lastYearFormatted = formatDate(lastYear);

  return {
    today: { from: todayFormatted, to: todayFormatted },
    yesterday: { from: yesterdayFormatted, to: yesterdayFormatted },
    last7Days: { from: last7DaysFormatted, to: todayFormatted },
    last30Days: { from: last30DaysFormatted, to: todayFormatted },
    thisMonth: { from: thisMonthFormatted, to: todayFormatted },
    lastMonth: { from: lastMonthStart, to: lastMonthEndFormatted },
    lastHalfYear: { from: lastHalfYearFormatted, to: todayFormatted },
    lastYear: { from: lastYearFormatted, to: todayFormatted },
  };
} 