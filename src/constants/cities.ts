import { City } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Stable IDs for default cities so cache keys are consistent
export const DEFAULT_CITY_IDS = {
  PORTLAND: 'default-portland-or',
  LOS_ANGELES: 'default-los-angeles-ca',
  TACOMA: 'default-tacoma-wa',
  KRAKOW: 'default-krakow-pl',
  KAILUA_KONA: 'default-kailua-kona-hi',
} as const;

export const DEFAULT_CITIES: City[] = [
  {
    id: DEFAULT_CITY_IDS.PORTLAND,
    name: 'Portland',
    lat: 45.5051,
    lon: -122.675,
    admin1: 'Oregon',
    country: 'United States',
  },
  {
    id: DEFAULT_CITY_IDS.LOS_ANGELES,
    name: 'Los Angeles',
    lat: 34.0522,
    lon: -118.2437,
    admin1: 'California',
    country: 'United States',
  },
  {
    id: DEFAULT_CITY_IDS.TACOMA,
    name: 'Tacoma',
    lat: 47.2529,
    lon: -122.4443,
    admin1: 'Washington',
    country: 'United States',
  },
  {
    id: DEFAULT_CITY_IDS.KRAKOW,
    name: 'Kraków',
    lat: 50.0647,
    lon: 19.945,
    admin1: 'Lesser Poland',
    country: 'Poland',
  },
  {
    id: DEFAULT_CITY_IDS.KAILUA_KONA,
    name: 'Kailua-Kona',
    lat: 19.64,
    lon: -155.9969,
    admin1: 'Hawaii',
    country: 'United States',
  },
];

export function makeCityId(): string {
  return uuidv4();
}
