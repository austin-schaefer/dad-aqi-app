import { useEffect } from 'react';
import { useAqiData } from './hooks/useAqiData';
import { AqiChart } from './components/AqiChart';
import { AqiLegend } from './components/AqiLegend';
import { AqiStatsTable } from './components/AqiStatsTable';
import { CitySearch } from './components/CitySearch';
import { ShareButton } from './components/ShareButton';
import { StatusBar } from './components/StatusBar';
import { TimeRangeSelector } from './components/TimeRangeSelector';
import { useAppStore } from './store/appStore';
import { decodeUrlState, syncUrlToState } from './utils/urlState';

export default function App() {
  useAqiData();

  const cities = useAppStore((s) => s.cities);
  const timeRangeKey = useAppStore((s) => s.timeRangeKey);

  // On first mount: apply any URL state over localStorage
  useEffect(() => {
    const { cities: urlCities, timeRangeKey: urlRange } = decodeUrlState();
    const patch: Record<string, unknown> = {};
    if (urlCities) patch.cities = urlCities;
    if (urlRange) patch.timeRangeKey = urlRange;
    if (Object.keys(patch).length > 0) {
      useAppStore.setState({ ...patch, cityData: {}, errorCities: {} });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync
  useEffect(() => {
    syncUrlToState(cities, timeRangeKey);
  }, [cities, timeRangeKey]);

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Subtle nautical background texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(56,189,248,0.5) 40px, rgba(56,189,248,0.5) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(56,189,248,0.5) 40px, rgba(56,189,248,0.5) 41px)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
          <h1
            className="text-2xl font-bold tracking-tight text-slate-100"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            AQI Dashboard
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <ShareButton />
            <div className="w-px h-5 bg-white/10 mx-1" />
            <TimeRangeSelector />
          </div>
        </header>

        {/* Main layout: chart + sidebar */}
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Chart */}
          <div
            className="w-full md:flex-1 min-w-0 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-lg shadow-black/30 p-4 h-[320px] md:h-[420px]"
          >
            <AqiChart />
          </div>

          {/* Sidebar — on desktop matches chart height with scrolling legend */}
          <div className="w-full md:w-64 md:shrink-0 flex flex-col gap-3 md:h-[420px]">
            <CitySearch />
            <div className="md:flex-1 md:min-h-0 md:overflow-y-auto pr-0.5">
              <AqiLegend />
            </div>
          </div>
        </div>

        {/* Status bar */}
        <StatusBar />

        {/* Stats table */}
        <AqiStatsTable />

        {/* Footer */}
        <footer className="text-center text-xs text-slate-700 font-mono">
          Data via{' '}
          <span className="text-slate-600">Open-Meteo Air Quality API</span>
          {' · '}
          <span className="text-slate-600">Free, non-commercial</span>
          {' · '}
          <a
            href="https://github.com/austin-schaefer/dad-aqi-app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-slate-400 transition-colors"
          >
            GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}
