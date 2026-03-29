import { CachedEntry, DailyAqiEntry } from '../types';

const CACHE_KEY = 'aqi_cache';
const TTL_MS = 60 * 60 * 1000; // 1 hour (online refresh threshold)

function loadCache(): Record<string, CachedEntry> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, CachedEntry>;
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, CachedEntry>): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

function makeCacheKey(cityId: string, startDate: string, endDate: string): string {
  return `${cityId}__${startDate}__${endDate}`;
}

export function readCache(
  cityId: string,
  startDate: string,
  endDate: string,
): DailyAqiEntry[] | null {
  try {
    const cache = loadCache();
    const key = makeCacheKey(cityId, startDate, endDate);
    const entry = cache[key];

    if (!entry) return null;

    // When offline, return whatever we have — stale data beats no data
    if (!navigator.onLine) return entry.entries;

    if (Date.now() - entry.fetchedAt > TTL_MS) return null;

    return entry.entries;
  } catch {
    return null;
  }
}

export function writeCache(
  cityId: string,
  startDate: string,
  endDate: string,
  entries: DailyAqiEntry[],
): void {
  try {
    const cache = loadCache();
    const key = makeCacheKey(cityId, startDate, endDate);
    cache[key] = { cityId, startDate, endDate, entries, fetchedAt: Date.now() };
    saveCache(cache);
  } catch {
    // silently ignore
  }
}

export function clearExpiredCache(): void {
  // Don't evict data when offline — stale data is still useful
  if (!navigator.onLine) return;

  try {
    const cache = loadCache();
    const now = Date.now();
    let changed = false;

    for (const key of Object.keys(cache)) {
      const entry = cache[key];
      if (entry && now - entry.fetchedAt > TTL_MS) {
        delete cache[key];
        changed = true;
      }
    }

    if (changed) saveCache(cache);
  } catch {
    // silently ignore
  }
}
