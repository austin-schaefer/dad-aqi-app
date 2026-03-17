import { useAppStore } from '../store/appStore';

export function StatusBar() {
  const loadingCities = useAppStore((s) => s.loadingCities);
  const errorCities = useAppStore((s) => s.errorCities);
  const cities = useAppStore((s) => s.cities);

  const errorEntries = Object.entries(errorCities).filter(([cityId]) =>
    cities.some((c) => c.id === cityId),
  );

  const loadingCount = loadingCities.size;

  if (loadingCount === 0 && errorEntries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2 rounded-lg bg-white/3 border border-white/8 text-xs font-mono">
      {loadingCount > 0 && (
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-2.5 h-2.5 border border-amber-400/60 border-t-transparent rounded-full animate-spin" />
          <span>
            Fetching {loadingCount} cit{loadingCount === 1 ? 'y' : 'ies'}…
          </span>
        </div>
      )}
      {errorEntries.map(([cityId, msg]) => {
        const city = cities.find((c) => c.id === cityId);
        return (
          <div key={cityId} className="flex items-center gap-1.5 text-red-400">
            <span>⚠</span>
            <span>
              {city?.name ?? cityId}: {msg}
            </span>
          </div>
        );
      })}
    </div>
  );
}
