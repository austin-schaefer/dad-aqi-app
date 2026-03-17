import { useAqiData } from './hooks/useAqiData';
import { AqiChart } from './components/AqiChart';
import { AqiLegend } from './components/AqiLegend';
import { AqiStatsTable } from './components/AqiStatsTable';
import { CitySearch } from './components/CitySearch';
import { StatusBar } from './components/StatusBar';
import { TimeRangeSelector } from './components/TimeRangeSelector';

export default function App() {
  useAqiData();

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
        <header className="flex items-center justify-between gap-4">
          <h1
            className="text-2xl font-bold tracking-tight text-slate-100"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            AQI Dashboard
          </h1>
          <TimeRangeSelector />
        </header>

        {/* Main layout: chart + sidebar */}
        <div className="flex gap-5 items-start">
          {/* Chart */}
          <div
            className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-lg shadow-black/30 p-4"
            style={{ height: 420 }}
          >
            <AqiChart />
          </div>

          {/* Sidebar */}
          <div className="w-64 shrink-0 flex flex-col gap-3">
            <CitySearch />
            <AqiLegend />
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
        </footer>
      </div>
    </div>
  );
}
