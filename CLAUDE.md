# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A client-side React app for browsing Air Quality Index (AQI) data across multiple cities. Hosted on Netlify with no backend — all data is fetched directly from the user's browser.

## Stack

- **React** (frontend only, no SSR)
- **Netlify** (static hosting, no serverless functions needed)
- **Open-Meteo Air Quality API** — no API key required, CORS-native, free for non-commercial use
  - Endpoint: `https://air-quality-api.open-meteo.com/v1/air-quality`
  - Returns hourly `us_aqi` data; aggregate to daily client-side
  - Use `start_date` / `end_date` params for historical range (up to ~1 year back from today)
- **LocalStorage** for persisting the user's city list and optionally caching fetched data

## Key Features & Requirements

- **Default cities**: Portland OR, Los Angeles CA, Tacoma WA, Krakow Poland, Kailua-Kona HI
- **User city management**: add/remove cities, persisted in LocalStorage (no auth, no server-side storage)
- **Time range**: up to 1 year, always displayed at 1-day intervals regardless of selected duration
- **Data fetching**: browser fetches directly from Open-Meteo; no proxy or backend needed
- **Rate limiting**: client-side abuse prevention on API calls (debounce/throttle requests, avoid hammering on city add)

## Open-Meteo Notes

- Hourly resolution only — compute daily aggregates (max or mean of `us_aqi`) client-side
- For a full year request, consider chunking into quarters to keep response sizes manageable
- No API key exposure risk — safe to call directly from browser
- Coverage confirmed for all five default cities including international (Krakow)
- Free tier: 10,000 requests/day, 300,000/month

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — type-check + build to `dist/`
- `npm run preview` — preview production build locally
