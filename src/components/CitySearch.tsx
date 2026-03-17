import { useState, useRef, useEffect } from 'react';
import { searchCities } from '../api/geocoding';
import { useDebounce } from '../hooks/useDebounce';
import { useAppStore } from '../store/appStore';
import { makeCityId } from '../constants/cities';
import { OpenMeteoGeocodingResult } from '../types';

export function CitySearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OpenMeteoGeocodingResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 400);
  const addCity = useAppStore((s) => s.addCity);
  const cities = useAppStore((s) => s.cities);

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    searchCities(debouncedQuery)
      .then((res) => {
        setResults(res);
        setIsOpen(res.length > 0);
      })
      .catch(() => {
        setSearchError('Search failed. Try again.');
        setResults([]);
        setIsOpen(false);
      })
      .finally(() => setIsSearching(false));
  }, [debouncedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(result: OpenMeteoGeocodingResult) {
    // Don't add duplicates by lat/lon proximity
    const alreadyAdded = cities.some(
      (c) =>
        Math.abs(c.lat - result.latitude) < 0.01 &&
        Math.abs(c.lon - result.longitude) < 0.01,
    );

    if (!alreadyAdded) {
      addCity({
        id: makeCityId(),
        name: result.name,
        lat: result.latitude,
        lon: result.longitude,
        country: result.country,
        admin1: result.admin1,
      });
    }

    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Add a city…"
          className={[
            'w-full px-3 py-2 text-sm rounded-lg',
            'bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600',
            'focus:outline-none focus:border-amber-400/50 focus:bg-white/8',
            'transition-all duration-150 font-mono',
          ].join(' ')}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border border-amber-400/60 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {searchError && (
        <p className="text-xs text-red-400 mt-1 font-mono">{searchError}</p>
      )}

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className={[
            'absolute z-50 top-full left-0 right-0 mt-1',
            'bg-slate-900 border border-white/15 rounded-lg overflow-hidden',
            'shadow-xl shadow-black/50',
          ].join(' ')}
        >
          {results.map((result) => {
            const alreadyAdded = cities.some(
              (c) =>
                Math.abs(c.lat - result.latitude) < 0.01 &&
                Math.abs(c.lon - result.longitude) < 0.01,
            );

            return (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                disabled={alreadyAdded}
                className={[
                  'w-full px-3 py-2.5 text-left flex items-center gap-2',
                  'border-b border-white/5 last:border-0',
                  'transition-colors duration-100',
                  alreadyAdded
                    ? 'text-slate-600 cursor-default'
                    : 'text-slate-200 hover:bg-white/8 hover:text-white',
                ].join(' ')}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{result.name}</span>
                  {(result.admin1 || result.country) && (
                    <span className="text-xs text-slate-500 ml-2">
                      {[result.admin1, result.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
                {alreadyAdded && (
                  <span className="text-xs text-slate-600 font-mono shrink-0">added</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
