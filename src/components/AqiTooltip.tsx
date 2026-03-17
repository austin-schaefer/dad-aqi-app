import { TooltipProps } from 'recharts';
import { useAppStore } from '../store/appStore';
import { getCityColor, getAqiCategory } from '../constants/aqi';
import { formatDateLong } from '../utils/dateHelpers';

type RechartsPayload = {
  dataKey: string;
  value: number | null;
  color: string;
};

export function AqiTooltip({ active, payload, label }: TooltipProps<number, string>) {
  const cities = useAppStore((s) => s.cities);

  if (!active || !payload?.length || !label) return null;

  const cityMap = new Map(cities.map((c, i) => [c.id, { city: c, color: getCityColor(i) }]));

  return (
    <div className="bg-slate-900/95 border border-white/15 rounded-lg shadow-xl shadow-black/60 p-3 min-w-[180px]">
      <div className="text-xs font-mono text-slate-400 mb-2 border-b border-white/10 pb-2">
        {formatDateLong(label as string)}
      </div>
      <div className="flex flex-col gap-1.5">
        {(payload as RechartsPayload[])
          .filter((p) => p.value !== null && p.value !== undefined)
          .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
          .map((entry) => {
            const info = cityMap.get(entry.dataKey);
            if (!info) return null;
            const category = getAqiCategory(entry.value);

            return (
              <div key={entry.dataKey} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-slate-300 flex-1 truncate">{info.city.name}</span>
                <span
                  className="text-xs font-mono font-bold ml-2"
                  style={{ color: category?.color ?? '#94a3b8' }}
                >
                  {entry.value}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
