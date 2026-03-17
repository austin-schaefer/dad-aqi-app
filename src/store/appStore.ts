import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { City, CityAqiData, TimeRangeKey } from '../types';
import { DEFAULT_CITIES } from '../constants/cities';
import { DEFAULT_TIME_RANGE_KEY } from '../utils/dateHelpers';

interface AppState {
  // Persisted
  cities: City[];
  timeRangeKey: TimeRangeKey;

  // Runtime
  cityData: Record<string, CityAqiData>; // cityId -> data
  loadingCities: Set<string>;
  errorCities: Record<string, string>; // cityId -> error message
  hiddenCities: Set<string>;
  hoveredCityId: string | null;

  // City management
  addCity: (city: City) => void;
  removeCity: (cityId: string) => void;
  resetToDefaults: () => void;
  toggleCityVisibility: (cityId: string) => void;
  setHoveredCity: (cityId: string | null) => void;

  // Time range
  setTimeRange: (key: TimeRangeKey) => void;

  // Data management
  setLoading: (cityId: string, loading: boolean) => void;
  setCityData: (data: CityAqiData) => void;
  setCityError: (cityId: string, error: string | null) => void;
  clearCityData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      cities: DEFAULT_CITIES,
      timeRangeKey: DEFAULT_TIME_RANGE_KEY,
      cityData: {},
      loadingCities: new Set(),
      errorCities: {},
      hiddenCities: new Set(),
      hoveredCityId: null,

      addCity: (city) => {
        const { cities } = get();
        if (cities.some((c) => c.id === city.id)) return;
        set({ cities: [...cities, city] });
      },

      removeCity: (cityId) => {
        const { cities, cityData, errorCities } = get();
        const nextData = { ...cityData };
        delete nextData[cityId];
        const nextErrors = { ...errorCities };
        delete nextErrors[cityId];
        set({
          cities: cities.filter((c) => c.id !== cityId),
          cityData: nextData,
          errorCities: nextErrors,
        });
      },

      resetToDefaults: () => {
        set({ cities: DEFAULT_CITIES, cityData: {}, errorCities: {}, hiddenCities: new Set() });
      },

      toggleCityVisibility: (cityId) => {
        set((state) => {
          const next = new Set(state.hiddenCities);
          if (next.has(cityId)) next.delete(cityId);
          else next.add(cityId);
          return { hiddenCities: next };
        });
      },

      setHoveredCity: (cityId) => set({ hoveredCityId: cityId }),

      setTimeRange: (key) => {
        set({ timeRangeKey: key, cityData: {}, errorCities: {} });
      },

      setLoading: (cityId, loading) => {
        set((state) => {
          const next = new Set(state.loadingCities);
          if (loading) next.add(cityId);
          else next.delete(cityId);
          return { loadingCities: next };
        });
      },

      setCityData: (data) => {
        set((state) => ({
          cityData: { ...state.cityData, [data.cityId]: data },
        }));
      },

      setCityError: (cityId, error) => {
        set((state) => {
          if (error === null) {
            const next = { ...state.errorCities };
            delete next[cityId];
            return { errorCities: next };
          }
          return { errorCities: { ...state.errorCities, [cityId]: error } };
        });
      },

      clearCityData: () => {
        set({ cityData: {}, errorCities: {} });
      },
    }),
    {
      name: 'aqi_app',
      // Only persist cities and time range key — not runtime data
      partialize: (state) => ({
        cities: state.cities,
        timeRangeKey: state.timeRangeKey,
      }),
    },
  ),
);
