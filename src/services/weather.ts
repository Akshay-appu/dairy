import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { FarmProfile } from '../db/schema';
import { Copy } from '../i18n/copy';

const WEATHER_CACHE_KEY = '@bhoomi_weather_cache_v1';

export type WeatherLocationSource = 'gps' | 'profile' | 'search' | 'default';

export interface CachedWeatherData {
  locationName: string;
  source: WeatherLocationSource;
  latitude: number;
  longitude: number;
  temperatureC: number;
  humidityPct: number;
  windSpeedKmh: number;
  rainProbabilityPct: number;
  precipitationMm: number;
  weatherCode: number;
  isDay: boolean;
  tempMaxC: number | null;
  tempMinC: number | null;
  fetchedAt: string;
}

export interface WeatherFetchResult {
  weather: CachedWeatherData;
  gpsFallback: boolean;
  fromCache: boolean;
}

type GeocodingApiResult = {
  results?: {
    name?: string;
    admin2?: string;
    admin1?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }[];
};

type ForecastApiResult = {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    is_day?: number;
  };
  hourly?: {
    time?: string[];
    precipitation_probability?: (number | null)[];
  };
  daily?: {
    precipitation_probability_max?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
  };
};

async function fetchJsonWithTimeout<T>(url: string, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function loadCachedWeather(): Promise<CachedWeatherData | null> {
  try {
    const raw = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedWeatherData>;
    if (
      typeof parsed?.temperatureC !== 'number' ||
      typeof parsed?.humidityPct !== 'number' ||
      typeof parsed?.locationName !== 'string'
    ) {
      return null;
    }
    return parsed as CachedWeatherData;
  } catch {
    return null;
  }
}

export async function saveCachedWeather(data: CachedWeatherData): Promise<void> {
  try {
    await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to cache weather in AsyncStorage:', err);
  }
}

export async function geocodeAreaOpenMeteo(
  query: string
): Promise<{ latitude: number; longitude: number; displayName: string } | null> {
  const clean = query.trim();
  if (!clean) return null;

  const trySearch = async (withCountryIndia: boolean) => {
    const countryParam = withCountryIndia ? '&countryCode=IN' : '';
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(clean)}&count=3&language=en&format=json${countryParam}`;
    const data = await fetchJsonWithTimeout<GeocodingApiResult>(url, 8000);
    return data.results?.[0] ?? null;
  };

  let hit = await trySearch(true);
  if (!hit) {
    hit = await trySearch(false);
  }
  if (!hit || typeof hit.latitude !== 'number' || typeof hit.longitude !== 'number') {
    return null;
  }

  const parts = [hit.name, hit.admin2, hit.admin1].filter(
    (p): p is string => Boolean(p && p.trim())
  );
  const uniqueParts = Array.from(new Set(parts));
  return {
    latitude: hit.latitude,
    longitude: hit.longitude,
    displayName: uniqueParts.slice(0, 2).join(', ') || clean,
  };
}

export async function fetchOpenMeteoForecast(
  lat: number,
  lon: number,
  locationName: string,
  source: WeatherLocationSource
): Promise<CachedWeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(String(lat))}` +
    `&longitude=${encodeURIComponent(String(lon))}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day` +
    `&hourly=precipitation_probability` +
    `&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=2`;

  const data = await fetchJsonWithTimeout<ForecastApiResult>(url, 10000);
  const current = data.current;
  if (!current || typeof current.temperature_2m !== 'number') {
    throw new Error('Incomplete forecast response');
  }

  let rainProbabilityPct = 0;
  const hourlyTimes = data.hourly?.time ?? [];
  const hourlyProbs = data.hourly?.precipitation_probability ?? [];
  if (hourlyTimes.length > 0 && hourlyProbs.length > 0) {
    const currentHourPrefix = (current.time ?? '').slice(0, 13);
    let startIndex = currentHourPrefix
      ? hourlyTimes.findIndex(t => t.startsWith(currentHourPrefix))
      : 0;
    if (startIndex < 0) startIndex = 0;
    const windowProbs = hourlyProbs
      .slice(startIndex, startIndex + 6)
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
    if (windowProbs.length > 0) {
      rainProbabilityPct = Math.max(...windowProbs);
    }
  } else if (typeof data.daily?.precipitation_probability_max?.[0] === 'number') {
    rainProbabilityPct = data.daily.precipitation_probability_max[0];
  }

  const weather: CachedWeatherData = {
    locationName,
    source,
    latitude: lat,
    longitude: lon,
    temperatureC: Math.round(current.temperature_2m * 10) / 10,
    humidityPct: Math.round(current.relative_humidity_2m ?? 0),
    windSpeedKmh: Math.round((current.wind_speed_10m ?? 0) * 10) / 10,
    rainProbabilityPct: Math.round(rainProbabilityPct),
    precipitationMm: Math.round((current.precipitation ?? 0) * 10) / 10,
    weatherCode: current.weather_code ?? 0,
    isDay: current.is_day !== 0,
    tempMaxC:
      typeof data.daily?.temperature_2m_max?.[0] === 'number'
        ? Math.round(data.daily.temperature_2m_max[0])
        : null,
    tempMinC:
      typeof data.daily?.temperature_2m_min?.[0] === 'number'
        ? Math.round(data.daily.temperature_2m_min[0])
        : null,
    fetchedAt: new Date().toISOString(),
  };

  await saveCachedWeather(weather);
  return weather;
}

function buildFallbackCandidates(
  farmProfile?: FarmProfile | null,
  workspaceName?: string
): { query: string; source: WeatherLocationSource }[] {
  const candidates: { query: string; source: WeatherLocationSource }[] = [];
  const v = farmProfile?.village?.trim() ?? '';
  const d = farmProfile?.district?.trim() ?? '';
  const s = farmProfile?.state?.trim() ?? '';

  if (v && d) candidates.push({ query: `${v}, ${d}`, source: 'profile' });
  if (v) candidates.push({ query: v, source: 'profile' });
  if (d) candidates.push({ query: d, source: 'profile' });
  if (s) candidates.push({ query: s, source: 'profile' });

  const cleanWs = workspaceName?.trim() ?? '';
  if (cleanWs && !/^default(\s+workspace)?$/i.test(cleanWs)) {
    candidates.push({ query: cleanWs, source: 'profile' });
  }

  candidates.push({ query: 'Bengaluru', source: 'default' });
  return candidates;
}

async function getBrowserPosition(): Promise<{ latitude: number; longitude: number } | null> {
  const nav = (globalThis as {
    navigator?: {
      geolocation?: {
        getCurrentPosition: (
          success: (pos: { coords: { latitude: number; longitude: number } }) => void,
          error: () => void,
          options?: { timeout?: number; maximumAge?: number }
        ) => void;
      };
    };
  }).navigator;
  if (!nav?.geolocation) return null;

  return new Promise(resolve => {
    nav.geolocation?.getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 6000, maximumAge: 15 * 60 * 1000 }
    );
  });
}

async function tryGetNativeGpsLocation(
  forcePrompt: boolean
): Promise<{ coords: { latitude: number; longitude: number } | null; denied: boolean }> {
  try {
    const existingPerm = await Location.getForegroundPermissionsAsync();
    let granted = existingPerm.granted;

    if (!granted && (existingPerm.status === 'undetermined' || forcePrompt)) {
      const requested = await Location.requestForegroundPermissionsAsync();
      granted = requested.granted;
    }

    if (!granted) {
      return { coords: null, denied: true };
    }

    const lastKnown = !forcePrompt
      ? await Location.getLastKnownPositionAsync({ maxAge: 15 * 60 * 1000 }).catch(() => null)
      : null;

    if (lastKnown?.coords) {
      return {
        coords: { latitude: lastKnown.coords.latitude, longitude: lastKnown.coords.longitude },
        denied: false,
      };
    }

    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      coords: { latitude: current.coords.latitude, longitude: current.coords.longitude },
      denied: false,
    };
  } catch {
    return { coords: null, denied: false };
  }
}

export async function fetchLiveAreaWeather(options: {
  farmProfile?: FarmProfile | null;
  workspaceName?: string;
  manualQuery?: string;
  forceGps?: boolean;
}): Promise<WeatherFetchResult> {
  const { farmProfile, workspaceName, manualQuery, forceGps = false } = options;

  // 1. Explicit manual village/district search
  if (manualQuery && manualQuery.trim()) {
    const geo = await geocodeAreaOpenMeteo(manualQuery.trim());
    if (!geo) {
      throw new Error('LOCATION_NOT_FOUND');
    }
    const weather = await fetchOpenMeteoForecast(
      geo.latitude,
      geo.longitude,
      geo.displayName,
      'search'
    );
    return { weather, gpsFallback: false, fromCache: false };
  }

  // 2. Try device GPS via expo-location (or browser geolocation on web)
  let gpsFallback = false;
  if (Platform.OS === 'web') {
    const webPos = forceGps ? await getBrowserPosition() : null;
    if (webPos) {
      const fallbackLabel =
        [farmProfile?.village, farmProfile?.district].filter(Boolean).join(', ') ||
        workspaceName ||
        'Local Farm';
      const weather = await fetchOpenMeteoForecast(
        webPos.latitude,
        webPos.longitude,
        fallbackLabel,
        'gps'
      );
      return { weather, gpsFallback: false, fromCache: false };
    }
  } else {
    const { coords, denied } = await tryGetNativeGpsLocation(forceGps);
    gpsFallback = denied;
    if (coords) {
      let resolvedName =
        [farmProfile?.village, farmProfile?.district].filter(Boolean).join(', ') ||
        workspaceName ||
        'Local Farm';

      try {
        const addresses = await Location.reverseGeocodeAsync(coords);
        const first = addresses?.[0];
        if (first) {
          const areaParts = [
            first.district || first.city || first.subregion || first.name,
            first.region,
          ].filter((p): p is string => Boolean(p && p.trim()));
          if (areaParts.length > 0) {
            resolvedName = Array.from(new Set(areaParts)).join(', ');
          }
        }
      } catch {
        // Keep fallback display label if reverse geocoder is unavailable
      }

      const weather = await fetchOpenMeteoForecast(
        coords.latitude,
        coords.longitude,
        resolvedName,
        'gps'
      );
      return { weather, gpsFallback: false, fromCache: false };
    }
  }

  // 3. Graceful fallback to farm profile village/district/state via Open-Meteo Geocoding
  const candidates = buildFallbackCandidates(farmProfile, workspaceName);
  for (const candidate of candidates) {
    try {
      const geo = await geocodeAreaOpenMeteo(candidate.query);
      if (geo) {
        const weather = await fetchOpenMeteoForecast(
          geo.latitude,
          geo.longitude,
          geo.displayName,
          candidate.source
        );
        return { weather, gpsFallback, fromCache: false };
      }
    } catch {
      // Try next candidate
    }
  }

  throw new Error('WEATHER_FETCH_FAILED');
}

export function getWeatherConditionMeta(
  weatherCode: number,
  isDay: boolean,
  t: Copy
): { icon: string; label: string } {
  if (weatherCode === 0) {
    return { icon: isDay ? '☀️' : '🌙', label: t.weatherClear };
  }
  if (weatherCode === 1) {
    return { icon: isDay ? '🌤️' : '🌙', label: t.weatherMainlyClear };
  }
  if (weatherCode === 2) {
    return { icon: '⛅', label: t.weatherPartlyCloudy };
  }
  if (weatherCode === 3) {
    return { icon: '☁️', label: t.weatherOvercast };
  }
  if (weatherCode === 45 || weatherCode === 48) {
    return { icon: '🌫️', label: t.weatherFoggy };
  }
  if (weatherCode >= 51 && weatherCode <= 57) {
    return { icon: '🌦️', label: t.weatherDrizzle };
  }
  if (weatherCode >= 61 && weatherCode <= 63) {
    return { icon: '🌧️', label: t.weatherRain };
  }
  if (weatherCode >= 65 && weatherCode <= 67) {
    return { icon: '⛈️', label: t.weatherHeavyRain };
  }
  if (weatherCode >= 80 && weatherCode <= 82) {
    return { icon: '🌦️', label: t.weatherShowers };
  }
  if (weatherCode >= 95) {
    return { icon: '⛈️', label: t.weatherThunderstorm };
  }
  return { icon: '🌤️', label: t.weatherPartlyCloudy };
}

export function getLocalizedFarmingAdvisory(
  weather: CachedWeatherData,
  t: Copy
): {
  sprayAdvisory: string;
  irrigationAdvisory: string;
  alertLevel: 'optimal' | 'caution' | 'warning';
} {
  if (
    weather.precipitationMm > 0 ||
    weather.rainProbabilityPct >= 60 ||
    weather.weatherCode >= 51
  ) {
    return {
      sprayAdvisory: t.weatherSprayAvoidRain,
      irrigationAdvisory: t.weatherIrrigRainExpected,
      alertLevel: 'warning',
    };
  }
  if (weather.windSpeedKmh >= 18) {
    return {
      sprayAdvisory: t.weatherSprayAvoidWind,
      irrigationAdvisory: t.weatherIrrigWindy,
      alertLevel: 'caution',
    };
  }
  if (weather.temperatureC >= 35 || (weather.temperatureC >= 32 && weather.humidityPct < 40)) {
    return {
      sprayAdvisory: t.weatherSprayHotDry,
      irrigationAdvisory: t.weatherIrrigHotDry,
      alertLevel: 'caution',
    };
  }
  if (weather.humidityPct >= 85) {
    return {
      sprayAdvisory: t.weatherSprayHighHumidity,
      irrigationAdvisory: t.weatherIrrigHighHumidity,
      alertLevel: 'caution',
    };
  }
  return {
    sprayAdvisory: t.weatherSprayOptimal,
    irrigationAdvisory: t.weatherIrrigOptimal,
    alertLevel: 'optimal',
  };
}
