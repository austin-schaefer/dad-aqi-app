import { useState, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { getCityColor, getAqiCategory } from '../constants/aqi';

export function AqiLegend() {
  const cities = useAppStore((s) => s.cities);
  const cityData = useAppStore((s) => s.cityData);
  const loadingCities = useAppStore((s) => s.loadingCities);
  const errorCities = useAppStore((s) => s.errorCities);
  const hiddenCities = useAppStore((s) => s.hiddenCities);
  const removeCity = useAppStore((s) => s.removeCity);
  const resetToDefaults = useAppStore((s) => s.resetToDefaults);
  const toggleCityVisibility = useAppStore((s) => s.toggleCityVisibility);
  const setHoveredCity = useAppStore((s) => s.setHoveredCity);
  const reorderCities = useAppStore((s) => s.reorderCities);

  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // Drag state
  const dragIndexRef = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  // insertionIndex: 0..cities.length — the gap where the item will be dropped
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null);

  function handleDragStart(e: React.DragEvent, index: number) {
    dragIndexRef.current = index;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const inTopHalf = e.clientY < rect.top + rect.height / 2;
    setInsertionIndex(inTopHalf ? index : index + 1);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from !== null && insertionIndex !== null) {
      // When moving down, the removal of `from` shifts everything above the
      // insertion point down by one, so subtract 1 to compensate.
      const to = from < insertionIndex ? insertionIndex - 1 : insertionIndex;
      if (to !== from) reorderCities(from, to);
    }
    dragIndexRef.current = null;
    setDraggingIndex(null);
    setInsertionIndex(null);
  }

  function handleDragEnd() {
    dragIndexRef.current = null;
    setDraggingIndex(null);
    setInsertionIndex(null);
  }

  function handleRemove(cityId: string) {
    removeCity(cityId);
    setConfirmRemoveId(null);
  }

  function handleReset() {
    resetToDefaults();
    setConfirmReset(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Cities</span>

        {confirmReset ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Reset all?</span>
            <button onClick={handleReset} className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors">Yes</button>
            <button onClick={() => setConfirmReset(false)} className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="text-xs font-mono text-slate-500 hover:text-amber-400 transition-colors"
          >
            Reset defaults
          </button>
        )}
      </div>

      {/* Insertion line before first item */}
      <InsertionLine visible={insertionIndex === 0} />

      {cities.map((city, index) => {
        const color = getCityColor(index);
        const data = cityData[city.id];
        const isLoading = loadingCities.has(city.id);
        const error = errorCities[city.id];
        const isHidden = hiddenCities.has(city.id);
        const isPendingRemove = confirmRemoveId === city.id;
        const isBeingDragged = draggingIndex === index;

        let latestAqi: number | null = null;
        if (data) {
          for (let i = data.entries.length - 1; i >= 0; i--) {
            if (data.entries[i]!.aqi !== null) { latestAqi = data.entries[i]!.aqi; break; }
          }
        }
        const category = getAqiCategory(latestAqi);

        return (
          <div key={city.id}>
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              className={[
                'flex items-center gap-2 px-3 py-2 rounded-lg border group',
                'transition-all duration-100',
                isBeingDragged
                  ? 'opacity-40 cursor-grabbing'
                  : 'cursor-default',
                isPendingRemove
                  ? 'bg-red-950/20 border-red-500/20'
                  : isHidden
                    ? 'bg-white/[0.02] border-white/5 opacity-40'
                    : 'bg-white/5 border-white/8 hover:border-white/15',
              ].join(' ')}
              onMouseEnter={() => !isHidden && setHoveredCity(city.id)}
              onMouseLeave={() => setHoveredCity(null)}
            >
              {/* Drag handle */}
              <div className="shrink-0 cursor-grab active:cursor-grabbing text-slate-600 group-hover:text-slate-400 transition-colors">
                <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                  <circle cx="3" cy="2.5" r="1.2"/><circle cx="7" cy="2.5" r="1.2"/>
                  <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
                  <circle cx="3" cy="11.5" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/>
                </svg>
              </div>

              {/* Color swatch */}
              <div
                className={['w-3 h-3 rounded-full shrink-0', isHidden ? '' : 'shadow-[0_0_6px_var(--swatch-color)]'].join(' ')}
                style={{ backgroundColor: color, '--swatch-color': color } as React.CSSProperties}
              />

              {/* City name */}
              <button
                className="flex-1 min-w-0 text-left"
                onClick={() => !isPendingRemove && toggleCityVisibility(city.id)}
                title={isHidden ? `Show ${city.name}` : `Hide ${city.name}`}
              >
                <div className={['text-sm font-medium truncate transition-colors', isPendingRemove ? 'text-red-300' : isHidden ? 'text-slate-500 line-through' : 'text-slate-200'].join(' ')}>
                  {city.name}
                </div>
                {city.admin1 && (
                  <div className={['text-xs truncate', isPendingRemove ? 'text-red-400/60' : 'text-slate-500'].join(' ')}>{city.admin1}</div>
                )}
              </button>

              {/* AQI value */}
              {!isPendingRemove && (
                <div className="text-right w-16 shrink-0">
                  {isLoading ? (
                    <span className="text-xs text-slate-500 font-mono">…</span>
                  ) : error ? (
                    <span className="text-xs text-red-400 font-mono">error</span>
                  ) : latestAqi !== null ? (
                    <div>
                      <div className="text-sm font-mono font-bold leading-none" style={{ color: isHidden ? '#64748b' : (category?.color ?? '#94a3b8') }}>
                        {latestAqi}
                      </div>
                      {category && <div className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">{category.shortLabel}</div>}
                    </div>
                  ) : data ? (
                    <span className="text-xs text-slate-500 font-mono">—</span>
                  ) : null}
                </div>
              )}

              {/* Remove / confirm */}
              {isPendingRemove ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleRemove(city.id)} className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors">Remove</button>
                  <button onClick={() => setConfirmRemoveId(null)} className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmRemoveId(city.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all text-lg leading-none shrink-0"
                  aria-label={`Remove ${city.name}`}
                >×</button>
              )}
            </div>

            {/* Insertion line after this item */}
            <InsertionLine visible={insertionIndex === index + 1} />
          </div>
        );
      })}

      {cities.length === 0 && (
        <div className="text-xs text-slate-500 text-center py-4">No cities added. Search above to add one.</div>
      )}
    </div>
  );
}

function InsertionLine({ visible }: { visible: boolean }) {
  return (
    <div className={['h-0.5 rounded-full mx-1 transition-all duration-100', visible ? 'bg-amber-400 opacity-100' : 'opacity-0'].join(' ')} />
  );
}
