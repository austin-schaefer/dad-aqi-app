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
 * Given a full daily date axis, group into 7-day windows and return each
 * window as { dates, representative } where representative is the middle date.
 * Used to build a weekly chart axis that is shared across all cities.
 */
export function buildWeeklyWindows(
  dateAxis: string[],
): Array<{ dates: string[]; representative: string }> {
  const windows: Array<{ dates: string[]; representative: string }> = [];
  for (let i = 0; i < dateAxis.length; i += 7) {
    const chunk = dateAxis.slice(i, i + 7);
    const mid = chunk[Math.floor(chunk.length / 2)]!;
    windows.push({ dates: chunk, representative: mid });
  }
  return windows;
}

/**
 * Collapse a city's daily entries into weekly averages aligned to the given
 * windows (produced by buildWeeklyWindows). Returns one entry per window.
 */
export function collapseToWeekly(
  entries: DailyAqiEntry[],
  windows: Array<{ dates: string[]; representative: string }>,
): DailyAqiEntry[] {
  const byDate = new Map(entries.map((e) => [e.date, e.aqi]));

  return windows.map(({ dates, representative }) => {
    const values = dates
      .map((d) => byDate.get(d))
      .filter((v): v is number => v != null);

    const aqi =
      values.length > 0
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : null;

    return { date: representative, aqi };
  });
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
