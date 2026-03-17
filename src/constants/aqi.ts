export interface AqiCategory {
  label: string;
  shortLabel: string;
  min: number;
  max: number;
  color: string; // hex, for chart background bands
  textColor: string;
}

export const AQI_CATEGORIES: AqiCategory[] = [
  { label: 'Good', shortLabel: 'Good', min: 0, max: 50, color: '#22c55e', textColor: '#14532d' },
  { label: 'Moderate', shortLabel: 'Moderate', min: 51, max: 100, color: '#eab308', textColor: '#713f12' },
  { label: 'Unhealthy for Sensitive Groups', shortLabel: 'Sens. Groups', min: 101, max: 150, color: '#f97316', textColor: '#7c2d12' },
  { label: 'Unhealthy', shortLabel: 'Unhealthy', min: 151, max: 200, color: '#ef4444', textColor: '#7f1d1d' },
  { label: 'Very Unhealthy', shortLabel: 'V. Unhealthy', min: 201, max: 300, color: '#a855f7', textColor: '#3b0764' },
  { label: 'Hazardous', shortLabel: 'Hazardous', min: 301, max: 500, color: '#991b1b', textColor: '#fff' },
];

export function getAqiCategory(aqi: number | null): AqiCategory | null {
  if (aqi === null) return null;
  return AQI_CATEGORIES.find((c) => aqi >= c.min && aqi <= c.max) ?? AQI_CATEGORIES[AQI_CATEGORIES.length - 1] ?? null;
}

// Nautical-inspired palette for chart lines — distinct, readable on dark bg
export const CITY_COLORS = [
  '#38bdf8', // sky blue
  '#fb923c', // warm amber/orange
  '#a78bfa', // soft violet
  '#34d399', // seafoam green
  '#f472b6', // coral pink
  '#facc15', // gold
  '#60a5fa', // cornflower
  '#f87171', // muted red
];

export function getCityColor(index: number): string {
  return CITY_COLORS[index % CITY_COLORS.length] ?? CITY_COLORS[0]!;
}
