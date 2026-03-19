import { City, TimeRangeKey } from '../types';
import { DEFAULT_CITIES, makeCityId } from '../constants/cities';
import { DEFAULT_TIME_RANGE_KEY } from './dateHelpers';

const CITIES_PARAM = 'cities';
const RANGE_PARAM = 'range';

/** True if the city list differs from the default five */
export function hasNonDefaultCities(cities: City[]): boolean {
  if (cities.length !== DEFAULT_CITIES.length) return true;
  return cities.some((c) => !DEFAULT_CITIES.some((d) => d.id === c.id));
}

/**
 * Encode a city as "lat,lon,Name" — lat/lon rounded to 4dp.
 * Name may not contain "|" (the city separator) — strip just in case.
 */
function encodeCity(city: City): string {
  const lat = parseFloat(city.lat.toFixed(4));
  const lon = parseFloat(city.lon.toFixed(4));
  return `${lat},${lon},${city.name.replace(/\|/g, '')}`;
}

function decodeCity(raw: string): City | null {
  try {
    const comma1 = raw.indexOf(',');
    const comma2 = raw.indexOf(',', comma1 + 1);
    if (comma1 === -1 || comma2 === -1) return null;
    const lat = parseFloat(raw.slice(0, comma1));
    const lon = parseFloat(raw.slice(comma1 + 1, comma2));
    const name = raw.slice(comma2 + 1).trim();
    if (isNaN(lat) || isNaN(lon) || !name) return null;
    return { id: makeCityId(), name, lat, lon };
  } catch {
    return null;
  }
}

function encodeCityList(cities: City[]): string {
  return cities.map(encodeCity).join('|');
}

export interface UrlState {
  cities: City[] | null;
  timeRangeKey: TimeRangeKey | null;
}

export function decodeUrlState(): UrlState {
  try {
    const params = new URLSearchParams(window.location.search);

    // Cities
    const rawCities = params.get(CITIES_PARAM);
    let cities: City[] | null = null;
    if (rawCities) {
      const decoded = rawCities.split('|').map(decodeCity).filter((c): c is City => c !== null);
      if (decoded.length > 0) cities = decoded;
    }

    // Time range
    const rawRange = params.get(RANGE_PARAM);
    const validRanges: TimeRangeKey[] = ['7d', '30d', '90d', '180d', '365d'];
    const timeRangeKey = validRanges.includes(rawRange as TimeRangeKey)
      ? (rawRange as TimeRangeKey)
      : null;

    return { cities, timeRangeKey };
  } catch {
    return { cities: null, timeRangeKey: null };
  }
}

/** Sync the live URL whenever state differs from defaults. */
export function syncUrlToState(cities: City[], timeRangeKey: TimeRangeKey): void {
  try {
    const url = new URL(window.location.href);

    if (hasNonDefaultCities(cities)) {
      url.searchParams.set(CITIES_PARAM, encodeCityList(cities));
    } else {
      url.searchParams.delete(CITIES_PARAM);
    }

    if (timeRangeKey !== DEFAULT_TIME_RANGE_KEY) {
      url.searchParams.set(RANGE_PARAM, timeRangeKey);
    } else {
      url.searchParams.delete(RANGE_PARAM);
    }

    window.history.replaceState({}, '', url.toString());
  } catch {
    // Non-critical
  }
}

/** Build a shareable URL pointing at the live Netlify site. */
export function buildShareUrl(cities: City[], timeRangeKey: TimeRangeKey): string {
  const url = new URL('https://dad-aqi-app.netlify.app/');

  if (hasNonDefaultCities(cities)) {
    url.searchParams.set(CITIES_PARAM, encodeCityList(cities));
  }

  if (timeRangeKey !== DEFAULT_TIME_RANGE_KEY) {
    url.searchParams.set(RANGE_PARAM, timeRangeKey);
  }

  return url.toString();
}
