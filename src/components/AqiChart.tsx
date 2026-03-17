import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useAppStore } from '../store/appStore';
import { getCityColor } from '../constants/aqi';
import { getDateRange, generateDateAxis, formatDateShort, TIME_RANGES } from '../utils/dateHelpers';
import { buildWeeklyWindows, collapseToWeekly } from '../utils/aggregation';
import { ChartDataPoint } from '../types';
import { AqiTooltip } from './AqiTooltip';

// AQI category threshold lines
const THRESHOLDS = [
  { value: 50, color: '#22c55e' },
  { value: 100, color: '#eab308' },
  { value: 150, color: '#f97316' },
  { value: 200, color: '#ef4444' },
];

export function AqiChart() {
  const cities = useAppStore((s) => s.cities);
  const cityData = useAppStore((s) => s.cityData);
  const timeRangeKey = useAppStore((s) => s.timeRangeKey);
  const loadingCities = useAppStore((s) => s.loadingCities);
  const hiddenCities = useAppStore((s) => s.hiddenCities);
  const hoveredCityId = useAppStore((s) => s.hoveredCityId);

  const timeRange = TIME_RANGES[timeRangeKey];
  const isAnyLoading = loadingCities.size > 0;

  if (!timeRange) return null;

  const { startDate, endDate } = getDateRange(timeRange.days);
  const dailyAxis = generateDateAxis(startDate, endDate);
  const useWeekly = timeRangeKey === '180d' || timeRangeKey === '365d';

  const weeklyWindows = useWeekly ? buildWeeklyWindows(dailyAxis) : null;
  const chartAxis = weeklyWindows ? weeklyWindows.map((w) => w.representative) : dailyAxis;

  const chartData: ChartDataPoint[] = chartAxis.map((date) => {
    const point: ChartDataPoint = { date };
    for (const city of cities) {
      const data = cityData[city.id];
      if (!data) { point[city.id] = null; continue; }
      if (weeklyWindows) {
        // pre-collapsed below; look up by index
        point[city.id] = null; // placeholder, filled after collapse
      } else {
        const entry = data.entries.find((e) => e.date === date);
        point[city.id] = entry?.aqi ?? null;
      }
    }
    return point;
  });

  // For weekly view, collapse each city's data and fill into chartData
  if (weeklyWindows) {
    for (const city of cities) {
      const data = cityData[city.id];
      if (!data) continue;
      const weekly = collapseToWeekly(data.entries, weeklyWindows);
      weekly.forEach((entry, i) => {
        if (chartData[i]) chartData[i]![city.id] = entry.aqi;
      });
    }
  }

  const tickInterval = Math.max(1, Math.floor(chartAxis.length / 7));
  const hasAnyData = cities.some((c) => cityData[c.id]);
  const isHighlighting = hoveredCityId !== null;

  return (
    <div className="relative w-full h-full min-h-[320px]">
      {!hasAnyData && !isAnyLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-slate-600 font-mono text-sm">No data to display</p>
        </div>
      )}

      {isAnyLoading && !hasAnyData && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-slate-500 font-mono text-xs">Fetching AQI data…</p>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />

          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Space Mono, monospace' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            interval={tickInterval}
            tickFormatter={formatDateShort}
          />

          <YAxis
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Space Mono, monospace' }}
            tickLine={false}
            axisLine={false}
            domain={[0, 'auto']}
            width={36}
            tickFormatter={(v: number) => String(v)}
          />

          <Tooltip
            content={<AqiTooltip />}
            cursor={{ stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1 }}
          />

          {THRESHOLDS.map((t) => (
            <ReferenceLine
              key={t.value}
              y={t.value}
              stroke={t.color}
              strokeOpacity={0.2}
              strokeDasharray="4 4"
            />
          ))}

          {cities.map((city, index) => {
            if (hiddenCities.has(city.id)) return null;

            const isHovered = city.id === hoveredCityId;
            const isDimmed = isHighlighting && !isHovered;

            return (
              <Line
                key={city.id}
                type="monotone"
                dataKey={city.id}
                stroke={getCityColor(index)}
                strokeWidth={isHovered ? 3 : 2}
                strokeOpacity={isDimmed ? 0.12 : 1}
                dot={false}
                activeDot={isDimmed ? false : { r: 4, strokeWidth: 0 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
