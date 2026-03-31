import { TimeRange, TimeRangeKey } from '../types';

export const TIME_RANGES: Record<TimeRangeKey, TimeRange> = {
  '24h': { key: '24h', label: '24 Hours', days: 2 },
  '7d': { key: '7d', label: '7 Days', days: 7 },
  '30d': { key: '30d', label: '30 Days', days: 30 },
  '90d': { key: '90d', label: '90 Days', days: 90 },
  '180d': { key: '180d', label: '6 Months', days: 180 },
  '365d': { key: '365d', label: '1 Year', days: 365 },
};

export const DEFAULT_TIME_RANGE_KEY: TimeRangeKey = '30d';

/** Format a Date as YYYY-MM-DD */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Format a Date as YYYY-MM-DDTHH:00 (truncated to hour, no minutes/seconds) */
export function toIsoDatetime(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  return `${toIsoDate(d)}T${h}:00`;
}

/**
 * Returns date range info for the 24-hour view.
 * - startDate/endDate: ISO date strings for the API request (yesterday + today)
 * - cutoffDatetime: ISO datetime 24 hours ago (for filtering stored entries)
 * - endDatetime: ISO datetime for the current hour (for cache key / filtering)
 */
export function getHourlyDateRange(): {
  startDate: string;
  endDate: string;
  cutoffDatetime: string;
  endDatetime: string;
} {
  const now = new Date();
  const endDt = new Date(now);
  endDt.setMinutes(0, 0, 0);

  const startDt = new Date(endDt);
  startDt.setHours(startDt.getHours() - 23);

  return {
    startDate: toIsoDate(startDt),
    endDate: toIsoDate(endDt),
    cutoffDatetime: toIsoDatetime(startDt),
    endDatetime: toIsoDatetime(endDt),
  };
}

/** Generate an array of the last 24 hour-slot datetime strings ("YYYY-MM-DDTHH:00") */
export function generateHourlyAxis(): string[] {
  const { cutoffDatetime, endDatetime } = getHourlyDateRange();
  const axis: string[] = [];
  // Parse by constructing a Date from components to stay in local time
  const parseHourly = (dt: string): Date => {
    const [date, time] = dt.split('T');
    const [y, mo, d] = date!.split('-').map(Number);
    const [h] = time!.split(':').map(Number);
    return new Date(y!, mo! - 1, d!, h!);
  };
  const cur = parseHourly(cutoffDatetime);
  const end = parseHourly(endDatetime);
  while (cur <= end) {
    axis.push(toIsoDatetime(cur));
    cur.setHours(cur.getHours() + 1);
  }
  return axis;
}

/** Display format for an hourly datetime: "2 PM" */
export function formatHourShort(isoDatetime: string): string {
  const [datePart, timePart] = isoDatetime.split('T');
  const [y, mo, d] = datePart!.split('-').map(Number);
  const [h] = timePart!.split(':').map(Number);
  return new Date(y!, mo! - 1, d!, h!).toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
  });
}

/** Display format for an hourly datetime: "March 30, 2025, 2 PM" */
export function formatHourLong(isoDatetime: string): string {
  const [datePart, timePart] = isoDatetime.split('T');
  const [y, mo, d] = datePart!.split('-').map(Number);
  const [h] = timePart!.split(':').map(Number);
  const dt = new Date(y!, mo! - 1, d!, h!);
  const dateFmt = dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const timeFmt = dt.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  return `${dateFmt}, ${timeFmt}`;
}

/** Returns { startDate, endDate } for a given number of trailing days ending today */
export function getDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return { startDate: toIsoDate(start), endDate: toIsoDate(end) };
}

/**
 * Split a date range into quarterly chunks for large requests.
 * For small ranges (≤ 92 days), returns single chunk.
 */
export function splitIntoQuarters(
  startDate: string,
  endDate: string,
): Array<{ startDate: string; endDate: string }> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / 86400000);

  if (diffDays <= 92) {
    return [{ startDate, endDate }];
  }

  const chunks: Array<{ startDate: string; endDate: string }> = [];
  let chunkStart = new Date(start);

  while (chunkStart <= end) {
    const chunkEnd = new Date(chunkStart);
    chunkEnd.setDate(chunkEnd.getDate() + 91); // ~3 months

    if (chunkEnd > end) {
      chunks.push({ startDate: toIsoDate(chunkStart), endDate: toIsoDate(end) });
    } else {
      chunks.push({ startDate: toIsoDate(chunkStart), endDate: toIsoDate(chunkEnd) });
    }

    chunkStart = new Date(chunkEnd);
    chunkStart.setDate(chunkStart.getDate() + 1);
  }

  return chunks;
}

/** Generate an array of all ISO date strings in [startDate, endDate] inclusive */
export function generateDateAxis(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  // Parse at noon local time to avoid UTC-midnight rolling back to the previous
  // day in timezones behind UTC (e.g. Pacific UTC-8).
  const cur = new Date(startDate + 'T12:00:00');
  const end = new Date(endDate + 'T12:00:00');

  while (cur <= end) {
    dates.push(toIsoDate(cur));
    cur.setDate(cur.getDate() + 1);
  }

  return dates;
}

/** Display format: "Mar 15" */
export function formatDateShort(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00'); // noon to avoid DST shift
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Display format: "March 15, 2025" */
export function formatDateLong(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
