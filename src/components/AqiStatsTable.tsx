import { useAppStore } from '../store/appStore';
import { getCityColor, getAqiCategory } from '../constants/aqi';
import { getDateRange, TIME_RANGES, formatDateShort } from '../utils/dateHelpers';
import { DailyAqiEntry } from '../types';

interface CityStats {
  mean: number;
  min: { aqi: number; date: string };
  max: { aqi: number; date: string };
}

function computeStats(entries: DailyAqiEntry[], startDate: string, endDate: string): CityStats | null {
  const inRange = entries.filter(
    (e) => e.aqi !== null && e.date >= startDate && e.date <= endDate,
  ) as Array<{ aqi: number; date: string }>;

  if (inRange.length === 0) return null;

  let minEntry = inRange[0]!;
  let maxEntry = inRange[0]!;
  let sum = 0;

  for (const e of inRange) {
    sum += e.aqi;
    if (e.aqi < minEntry.aqi) minEntry = e;
    if (e.aqi > maxEntry.aqi) maxEntry = e;
  }

  return {
    mean: Math.round(sum / inRange.length),
    min: { aqi: minEntry.aqi, date: minEntry.date },
    max: { aqi: maxEntry.aqi, date: maxEntry.date },
  };
}

export function AqiStatsTable() {
  const cities = useAppStore((s) => s.cities);
  const cityData = useAppStore((s) => s.cityData);
  const loadingCities = useAppStore((s) => s.loadingCities);
  const timeRangeKey = useAppStore((s) => s.timeRangeKey);
  const hiddenCities = useAppStore((s) => s.hiddenCities);
  const setHoveredCity = useAppStore((s) => s.setHoveredCity);

  const timeRange = TIME_RANGES[timeRangeKey];
  if (!timeRange) return null;

  const { startDate, endDate } = getDateRange(timeRange.days);

  const visibleCities = cities.filter((c) => !hiddenCities.has(c.id));
  const readyCities = visibleCities.filter((c) => cityData[c.id]);

  if (readyCities.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8">
            <th className="text-left px-4 py-2.5 text-xs font-mono text-slate-500 uppercase tracking-widest font-normal">
              City
            </th>
            <th className="text-right px-4 py-2.5 text-xs font-mono text-slate-500 uppercase tracking-widest font-normal">
              Mean
            </th>
            <th className="text-right px-4 py-2.5 text-xs font-mono text-slate-500 uppercase tracking-widest font-normal">
              Low
            </th>
            <th className="text-right px-4 py-2.5 text-xs font-mono text-slate-500 uppercase tracking-widest font-normal">
              High
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleCities.map((city) => {
            const color = getCityColor(cities.indexOf(city));
            const data = cityData[city.id];
            const isLoading = loadingCities.has(city.id);
            const stats = data ? computeStats(data.entries, startDate, endDate) : null;
            const meanCategory = stats ? getAqiCategory(stats.mean) : null;
            const minCategory = stats ? getAqiCategory(stats.min.aqi) : null;
            const maxCategory = stats ? getAqiCategory(stats.max.aqi) : null;

            return (
              <tr
                key={city.id}
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors cursor-default"
                onMouseEnter={() => setHoveredCity(city.id)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                {/* City */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <div className="text-slate-200 font-medium">{city.name}</div>
                      {city.admin1 && (
                        <div className="text-xs text-slate-500">{city.admin1}</div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Mean */}
                <td className="px-4 py-3 text-right font-mono">
                  {isLoading ? (
                    <span className="text-slate-600">…</span>
                  ) : stats ? (
                    <span className="font-semibold" style={{ color: meanCategory?.color ?? '#94a3b8' }}>
                      {stats.mean}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>

                {/* Low */}
                <td className="px-4 py-3 text-right font-mono">
                  {stats ? (
                    <span>
                      <span style={{ color: minCategory?.color ?? '#94a3b8' }}>{stats.min.aqi}</span>
                      <span className="text-slate-600 text-xs ml-1">({formatDateShort(stats.min.date)})</span>
                    </span>
                  ) : isLoading ? (
                    <span className="text-slate-600">…</span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>

                {/* High */}
                <td className="px-4 py-3 text-right font-mono">
                  {stats ? (
                    <span>
                      <span style={{ color: maxCategory?.color ?? '#94a3b8' }}>{stats.max.aqi}</span>
                      <span className="text-slate-600 text-xs ml-1">({formatDateShort(stats.max.date)})</span>
                    </span>
                  ) : isLoading ? (
                    <span className="text-slate-600">…</span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
