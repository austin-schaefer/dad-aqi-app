import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { fetchAqiForCity, fetchAqiHourlyForCity } from '../api/airQuality';
import { readCache, writeCache, clearExpiredCache } from '../utils/cache';
import { getDateRange, getHourlyDateRange, TIME_RANGES } from '../utils/dateHelpers';

export function useAqiData(): void {
  const cities = useAppStore((s) => s.cities);
  const timeRangeKey = useAppStore((s) => s.timeRangeKey);
  const setLoading = useAppStore((s) => s.setLoading);
  const setCityData = useAppStore((s) => s.setCityData);
  const setCityError = useAppStore((s) => s.setCityError);

  const inFlightRef = useRef(new Set<string>());

  useEffect(() => {
    clearExpiredCache();
  }, []);

  useEffect(() => {
    const timeRange = TIME_RANGES[timeRangeKey];
    if (!timeRange) return;

    const is24h = timeRangeKey === '24h';
    const hourlyRange = is24h ? getHourlyDateRange() : null;
    const { startDate, endDate } = is24h
      ? { startDate: hourlyRange!.startDate, endDate: hourlyRange!.endDate }
      : getDateRange(timeRange.days);
    // For 24h mode use the hourly cutoff datetimes as cache key bounds
    const cacheStart = is24h ? hourlyRange!.cutoffDatetime : startDate;
    const cacheEnd = is24h ? hourlyRange!.endDatetime : endDate;

    let cancelled = false;

    const run = async () => {
      for (const city of cities) {
        if (cancelled) break;

        const fetchKey = `${city.id}__${timeRangeKey}`;

        // Use getState() snapshot to avoid stale closure issues without adding
        // loadingCities/cityData to deps (which would cause re-triggering loops)
        const state = useAppStore.getState();
        if (state.loadingCities.has(city.id)) continue;
        if (inFlightRef.current.has(fetchKey)) continue;
        if (state.cityData[city.id]) continue;

        const cached = readCache(city.id, cacheStart, cacheEnd);
        if (cached) {
          setCityData({ cityId: city.id, entries: cached });
          continue;
        }

        inFlightRef.current.add(fetchKey);
        setLoading(city.id, true);
        setCityError(city.id, null);

        try {
          const entries = is24h
            ? await fetchAqiHourlyForCity(
                city.lat,
                city.lon,
                startDate,
                endDate,
                hourlyRange!.cutoffDatetime,
              )
            : await fetchAqiForCity(city.lat, city.lon, startDate, endDate);
          if (!cancelled) {
            writeCache(city.id, cacheStart, cacheEnd, entries);
            setCityData({ cityId: city.id, entries });
          }
        } catch (err) {
          if (!cancelled) {
            const msg = err instanceof Error ? err.message : 'Failed to fetch AQI data';
            setCityError(city.id, msg);
          }
        } finally {
          setLoading(city.id, false);
          inFlightRef.current.delete(fetchKey);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [cities, timeRangeKey, setCityData, setCityError, setLoading]);
}
