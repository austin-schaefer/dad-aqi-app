import { OpenMeteoAirQualityResponse, DailyAqiEntry } from '../types';
import { splitIntoQuarters } from '../utils/dateHelpers';
import { aggregateHourlyToDaily, mergeChunks } from '../utils/aggregation';

const BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

async function fetchChunk(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
): Promise<DailyAqiEntry[]> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: 'us_aqi',
    start_date: startDate,
    end_date: endDate,
    timezone: 'auto',
  });

  const res = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`Open-Meteo AQ returned ${res.status} for ${startDate}–${endDate}`);
  }

  const data: OpenMeteoAirQualityResponse = await res.json();
  return aggregateHourlyToDaily(data.hourly.time, data.hourly.us_aqi);
}

/**
 * Fetch AQI data for a city over the given date range.
 * Splits into quarterly chunks for large ranges.
 */
export async function fetchAqiForCity(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
): Promise<DailyAqiEntry[]> {
  const chunks = splitIntoQuarters(startDate, endDate);
  const results = await Promise.all(
    chunks.map((c) => fetchChunk(lat, lon, c.startDate, c.endDate)),
  );
  return mergeChunks(results);
}
