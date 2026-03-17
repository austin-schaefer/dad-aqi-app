export interface City {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country?: string;
  admin1?: string; // state/province
}

export type TimeRangeKey = '7d' | '30d' | '90d' | '180d' | '365d';

export interface TimeRange {
  key: TimeRangeKey;
  label: string;
  days: number;
}

export interface DailyAqiEntry {
  date: string; // ISO date string YYYY-MM-DD
  aqi: number | null;
}

export interface CityAqiData {
  cityId: string;
  entries: DailyAqiEntry[];
}

export interface CachedEntry {
  cityId: string;
  startDate: string;
  endDate: string;
  entries: DailyAqiEntry[];
  fetchedAt: number; // unix timestamp ms
}

// Open-Meteo API response shapes
export interface OpenMeteoAirQualityResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    us_aqi: (number | null)[];
  };
}

export interface OpenMeteoGeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
}

export interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[];
}

export type LoadingState = 'idle' | 'loading' | 'error' | 'success';

export interface ChartDataPoint {
  date: string;
  [cityId: string]: number | null | string; // cityId -> aqi value
}
