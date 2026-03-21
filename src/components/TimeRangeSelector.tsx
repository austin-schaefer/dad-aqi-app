import { TIME_RANGES } from '../utils/dateHelpers';
import { TimeRangeKey } from '../types';
import { useAppStore } from '../store/appStore';

const RANGE_KEYS: TimeRangeKey[] = ['7d', '30d', '90d', '180d', '365d'];

const SHORT_LABELS: Record<TimeRangeKey, string> = {
  '7d': '7D',
  '30d': '30D',
  '90d': '90D',
  '180d': '6M',
  '365d': '1Y',
};

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
              'px-2 sm:px-3 py-1.5 text-xs font-mono font-semibold rounded transition-all duration-150',
              'border',
              isActive
                ? 'bg-amber-400/20 border-amber-400/60 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.2)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-amber-400/30 hover:text-slate-200',
            ].join(' ')}
          >
            <span className="sm:hidden">{SHORT_LABELS[key]}</span>
            <span className="hidden sm:inline">{range?.label ?? key}</span>
          </button>
        );
      })}
    </div>
  );
}
