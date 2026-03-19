# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A client-side React app for browsing Air Quality Index (AQI) data across multiple cities. Hosted on Netlify with no backend — all data is fetched directly from the user's browser.

## Stack

- **Vite + React 18 + TypeScript**
- **Recharts** — multi-series line chart
- **Zustand 5** with `persist` middleware — cities and time range persisted to localStorage
- **Tailwind CSS 4** (Vite plugin)
- **Open-Meteo Air Quality API** — no API key, CORS-native, free non-commercial
  - Endpoint: `https://air-quality-api.open-meteo.com/v1/air-quality`
  - Hourly `us_aqi`; aggregate to daily mean client-side
  - Quarterly chunking for 1-year requests; cities fetched sequentially to avoid 429s
- **Open-Meteo Geocoding API** — city search for adding cities
- **LocalStorage** — Zustand persist (cities, time range) + 1hr AQI cache

## Key Features

- Default cities: Portland OR, Los Angeles CA, Tacoma WA, Kraków PL, Kailua-Kona HI
- Add/remove/reorder cities (drag-to-reorder with insertion line indicator)
- Toggle city visibility; hover legend row to highlight that line in chart
- Time ranges: 7d / 30d / 90d / 6mo / 1yr — 6mo and 1yr use weekly averages in chart
- Stats table: mean, low (with date), high (with date) per city — always uses daily values
- URL sharing: `?cities=lat,lon,Name|...` + `?range=90d` when non-default; Share button copies Netlify URL
- Confirmation dialogs for destructive actions (remove city, reset defaults)

## Open-Meteo Notes

- Parse date strings at `T12:00:00` (not midnight) to avoid UTC→local timezone off-by-one
- Sequential city fetching (not `Promise.all` across cities) prevents 429s on long ranges
- Free tier: 10,000 req/day — cache + sequential fetching keeps well within limits

## Commands

- `npm run dev` — start Vite dev server (http://localhost:5173)
- `npm run build` — type-check + build to `dist/`
- `npm run preview` — preview production build locally
