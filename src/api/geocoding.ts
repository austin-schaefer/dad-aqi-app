import { OpenMeteoGeocodingResponse, OpenMeteoGeocodingResult } from '../types';

const BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export async function searchCities(query: string): Promise<OpenMeteoGeocodingResult[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    name: query.trim(),
    count: '8',
    language: 'en',
    format: 'json',
  });

  const res = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`Geocoding API returned ${res.status}`);
  }

  const data: OpenMeteoGeocodingResponse = await res.json();
  return data.results ?? [];
}
