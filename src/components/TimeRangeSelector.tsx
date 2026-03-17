import { TIME_RANGES } from '../utils/dateHelpers';
import { TimeRangeKey } from '../types';
import { useAppStore } from '../store/appStore';

const RANGE_KEYS: TimeRangeKey[] = ['7d', '30d', '90d', '180d', '365d'];

export function TimeRangeSelector() {
  const timeRangeKey = useAppStore((s) => s.timeRangeKey);
  const setTimeRange = useAppStore((s) => s.setTimeRange);

  return (
    <div className="flex gap-1">
      {RANGE_KEYS.map((key) => {
        const range = TIME_RANGES[key];
        const isActive = key === timeRangeKey;
        return (
          <button
            key={key}
            onClick={() => setTimeRange(key)}
            className={[
              'px-3 py-1.5 text-xs font-mono font-semibold rounded transition-all duration-150',
              'border',
              isActive
                ? 'bg-amber-400/20 border-amber-400/60 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.2)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-amber-400/30 hover:text-slate-200',
            ].join(' ')}
          >
            {range?.label ?? key}
          </button>
        );
      })}
    </div>
  );
}
