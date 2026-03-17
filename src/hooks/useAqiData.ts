import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { fetchAqiForCity } from '../api/airQuality';
import { readCache, writeCache, clearExpiredCache } from '../utils/cache';
import { getDateRange, TIME_RANGES } from '../utils/dateHelpers';

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

    const { startDate, endDate } = getDateRange(timeRange.days);
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

        const cached = readCache(city.id, startDate, endDate);
        if (cached) {
          setCityData({ cityId: city.id, entries: cached });
          continue;
        }

        inFlightRef.current.add(fetchKey);
        setLoading(city.id, true);
        setCityError(city.id, null);

        try {
          const entries = await fetchAqiForCity(city.lat, city.lon, startDate, endDate);
          if (!cancelled) {
            writeCache(city.id, startDate, endDate, entries);
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
