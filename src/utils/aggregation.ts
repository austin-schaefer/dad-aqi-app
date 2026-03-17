import { DailyAqiEntry } from '../types';

/**
 * Aggregate hourly Open-Meteo us_aqi readings to daily mean.
 * time[] entries are ISO-8601 strings like "2024-03-01T00:00"
 */
export function aggregateHourlyToDaily(
  times: string[],
  values: (number | null)[],
): DailyAqiEntry[] {
  const byDate = new Map<string, number[]>();

  for (let i = 0; i < times.length; i++) {
    const timeStr = times[i];
    const val = values[i];
    if (!timeStr || val === null || val === undefined) continue;

    // Extract date part: "2024-03-01T00:00" -> "2024-03-01"
    const date = timeStr.slice(0, 10);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(val);
  }

  const entries: DailyAqiEntry[] = [];

  byDate.forEach((hourlyValues, date) => {
    if (hourlyValues.length === 0) {
      entries.push({ date, aqi: null });
    } else {
      const mean = hourlyValues.reduce((a, b) => a + b, 0) / hourlyValues.length;
      entries.push({ date, aqi: Math.round(mean) });
    }
  });

  // Sort by date ascending
  entries.sort((a, b) => a.date.localeCompare(b.date));

  return entries;
}

/**
 * Merge multiple DailyAqiEntry arrays (from quarterly chunks) into one
 * deduplicated, date-sorted array.
 */
export function mergeChunks(chunks: DailyAqiEntry[][]): DailyAqiEntry[] {
  const merged = new Map<string, DailyAqiEntry>();

  for (const chunk of chunks) {
    for (const entry of chunk) {
      if (!merged.has(entry.date)) {
        merged.set(entry.date, entry);
      }
    }
  }

  return Array.from(merged.values()).sort((a, b) => a.date.localeCompare(b.date));
}
