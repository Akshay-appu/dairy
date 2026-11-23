import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FarmProfile } from '../db/schema';
import { Copy, Language } from '../i18n/copy';
import {
  CachedWeatherData,
  fetchLiveAreaWeather,
  getLocalizedFarmingAdvisory,
  getWeatherConditionMeta,
  loadCachedWeather,
} from '../services/weather';
import { GREEN, LIGHT_GREEN, INK, MUTED } from '../theme';

function formatWeatherTimestamp(isoString: string, language: Language): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  const locale = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
  return d.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function WeatherCard({
  t,
  language,
  workspaceName,
  plotsCount,
  farmProfile,
}: {
  t: Copy;
  language: Language;
  workspaceName: string;
  plotsCount: number;
  farmProfile?: FarmProfile | null;
}) {
  const [weather, setWeather] = useState<CachedWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineCache, setIsOfflineCache] = useState(false);
  const [gpsFallbackNotice, setGpsFallbackNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const profileVillage = farmProfile?.village ?? '';
  const profileDistrict = farmProfile?.district ?? '';
  const profileState = farmProfile?.state ?? '';

  const refreshWeather = useCallback(
    async (opts?: { manualQuery?: string; forceGps?: boolean }) => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await fetchLiveAreaWeather({
          farmProfile,
          workspaceName,
          manualQuery: opts?.manualQuery,
          forceGps: opts?.forceGps,
        });
        setWeather(res.weather);
        setIsOfflineCache(false);
        setGpsFallbackNotice(res.gpsFallback);
      } catch (err) {
        if (err instanceof Error && err.message === 'LOCATION_NOT_FOUND') {
          setErrorMsg(t.weatherLocationNotFound);
        } else {
          const cached = await loadCachedWeather();
          if (cached) {
            setWeather(cached);
            setIsOfflineCache(true);
          } else {
            setErrorMsg(t.weatherNoData);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [farmProfile, workspaceName, t.weatherLocationNotFound, t.weatherNoData]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      const cached = await loadCachedWeather();
      if (alive && cached) {
        setWeather(cached);
      }
      try {
        const res = await fetchLiveAreaWeather({
          farmProfile,
          workspaceName,
        });
        if (!alive) return;
        setWeather(res.weather);
        setIsOfflineCache(false);
        setGpsFallbackNotice(res.gpsFallback);
        setErrorMsg('');
      } catch {
        if (!alive) return;
        if (cached) {
          setIsOfflineCache(true);
        } else {
          setErrorMsg(t.weatherNoData);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [farmProfile, profileVillage, profileDistrict, profileState, workspaceName, t.weatherNoData]);

  const condition = weather
    ? getWeatherConditionMeta(weather.weatherCode, weather.isDay, t)
    : null;
  const advisory = weather ? getLocalizedFarmingAdvisory(weather, t) : null;

  const advisoryCardStyle =
    advisory?.alertLevel === 'warning'
      ? styles.advisoryWarning
      : advisory?.alertLevel === 'caution'
      ? styles.advisoryCaution
      : styles.advisoryOptimal;

  return (
    <View style={styles.container}>
      {/* Area Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="location-outline" size={16} color={MUTED} style={{ marginRight: 6 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t.weatherSearchPlaceholder}
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                void refreshWeather({ manualQuery: searchQuery });
              }
            }}
          />
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => {
            if (searchQuery.trim()) {
              void refreshWeather({ manualQuery: searchQuery });
            } else {
              void refreshWeather();
            }
          }}
          disabled={loading}
        >
          <Text style={styles.searchBtnText}>{t.weatherSearchBtn}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.gpsBtn}
          onPress={() => void refreshWeather({ forceGps: true })}
          disabled={loading}
          accessibilityLabel={t.weatherUseGps}
        >
          <Ionicons name="navigate-outline" size={16} color={GREEN} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.gpsBtn}
          onPress={() => void refreshWeather()}
          disabled={loading}
          accessibilityLabel={t.weatherRefresh}
        >
          <Ionicons name="refresh-outline" size={16} color={GREEN} />
        </TouchableOpacity>
      </View>

      {loading && !weather ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={GREEN} />
          <Text style={styles.loadingText}>{t.weatherUpdating}</Text>
        </View>
      ) : null}

      {weather && condition && advisory ? (
        <>
          {/* Hero Location & Temp */}
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <Text style={styles.locationTitle} numberOfLines={2}>
                📍 {weather.locationName}
              </Text>
              <Text style={styles.workspaceMeta}>
                {workspaceName} · {t.weatherActivePlots}: {plotsCount}
              </Text>
              {weather.tempMaxC !== null && weather.tempMinC !== null && (
                <Text style={styles.highLowText}>
                  {t.weatherHighLow
                    .replace('{high}', String(weather.tempMaxC))
                    .replace('{low}', String(weather.tempMinC))}
                </Text>
              )}
            </View>
            <View style={styles.heroRight}>
              <View style={styles.tempRow}>
                <Text style={styles.weatherEmoji}>{condition.icon}</Text>
                <Text style={styles.tempValue}>{Math.round(weather.temperatureC)}°C</Text>
              </View>
              <Text style={styles.conditionLabel}>{condition.label}</Text>
            </View>
          </View>

          {/* 3 Weather Metric Tiles */}
          <View style={styles.metricsRow}>
            <View style={styles.metricTile}>
              <Ionicons name="water-outline" size={16} color="#0284C7" />
              <Text style={styles.metricLabel}>{t.weatherHumidity}</Text>
              <Text style={styles.metricValue}>{weather.humidityPct}%</Text>
            </View>
            <View style={styles.metricTile}>
              <Ionicons name="speedometer-outline" size={16} color="#059669" />
              <Text style={styles.metricLabel}>{t.weatherWind}</Text>
              <Text style={styles.metricValue}>
                {weather.windSpeedKmh} {t.weatherKmhUnit}
              </Text>
            </View>
            <View style={styles.metricTile}>
              <Ionicons name="rainy-outline" size={16} color="#2563EB" />
              <Text style={styles.metricLabel}>{t.weatherRainChance}</Text>
              <Text style={styles.metricValue}>{weather.rainProbabilityPct}%</Text>
            </View>
          </View>

          {/* Localized Spray & Irrigation Advisory */}
          <View style={[styles.advisoryCard, advisoryCardStyle]}>
            <View style={styles.advisoryItem}>
              <Text style={styles.advisoryTitle}>🛡️ {t.weatherSprayAdvisoryTitle}</Text>
              <Text style={styles.advisoryText}>{advisory.sprayAdvisory}</Text>
            </View>
            <View style={styles.advisoryDivider} />
            <View style={styles.advisoryItem}>
              <Text style={styles.advisoryTitle}>💧 {t.weatherIrrigationAdvisoryTitle}</Text>
              <Text style={styles.advisoryText}>{advisory.irrigationAdvisory}</Text>
            </View>
          </View>

          {/* Footer timestamp & offline/fallback status */}
          <View style={styles.footerRow}>
            <Text style={styles.lastUpdatedText}>
              {t.weatherLastUpdated}: {formatWeatherTimestamp(weather.fetchedAt, language)}
            </Text>
            {loading && <ActivityIndicator size="small" color={GREEN} />}
            {isOfflineCache && (
              <View style={styles.offlinePill}>
                <Text style={styles.offlinePillText}>{t.weatherOfflineCached}</Text>
              </View>
            )}
          </View>

          {gpsFallbackNotice && (
            <Text style={styles.fallbackNote}>{t.weatherGpsFallbackNotice}</Text>
          )}
        </>
      ) : null}

      {!!errorMsg && (
        <View style={styles.errorBanner}>
          <Ionicons name="cloud-offline-outline" size={15} color="#B45309" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  searchInputWrap: {
    flex: 1,
    minWidth: 150,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6E4D9',
    borderRadius: 10,
    backgroundColor: '#FAFDFB',
    paddingHorizontal: 10,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: INK,
    paddingVertical: 4,
  },
  searchBtn: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  gpsBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CDE0D2',
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    backgroundColor: '#F8FCF8',
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
  },
  heroCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: LIGHT_GREEN,
    padding: 12,
    borderRadius: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  heroLeft: {
    flex: 1,
    minWidth: 130,
    flexShrink: 1,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: GREEN,
  },
  workspaceMeta: {
    fontSize: 11,
    color: '#4A6B53',
    marginTop: 2,
    fontWeight: '600',
  },
  highLowText: {
    fontSize: 11,
    color: '#3A5A43',
    marginTop: 3,
    fontWeight: '700',
  },
  heroRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  weatherEmoji: {
    fontSize: 22,
  },
  tempValue: {
    fontSize: 24,
    fontWeight: '900',
    color: GREEN,
  },
  conditionLabel: {
    fontSize: 11,
    color: '#4A6B53',
    fontWeight: '700',
    marginTop: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metricTile: {
    flex: 1,
    minWidth: 85,
    backgroundColor: '#F8FCF9',
    borderWidth: 1,
    borderColor: '#E1ECE3',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 3,
  },
  metricLabel: {
    fontSize: 10,
    color: MUTED,
    fontWeight: '700',
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: INK,
  },
  advisoryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  advisoryOptimal: {
    backgroundColor: '#F6FBF7',
    borderColor: '#CDE4D2',
  },
  advisoryCaution: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  advisoryWarning: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  advisoryItem: {
    gap: 3,
  },
  advisoryTitle: {
    fontWeight: '800',
    fontSize: 12,
    color: INK,
  },
  advisoryText: {
    fontSize: 12,
    color: '#3F5547',
    lineHeight: 18,
  },
  advisoryDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  lastUpdatedText: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '600',
  },
  offlinePill: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  offlinePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  fallbackNote: {
    fontSize: 11,
    color: MUTED,
    fontStyle: 'italic',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
    flexWrap: 'wrap',
  },
});
