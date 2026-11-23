import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import {
  CropSchedule,
  listCropSchedules,
  addCropSchedule,
  deleteCropSchedule,
} from '../db/cropSchedulesRepo';
import {
  computeCropProfile,
  CropGrowthProfile,
  getCropEmoji,
  POPULAR_CROP_PRESETS,
  StageCategory,
  StageDefinition,
} from '../data/cropProfiles';
import {
  scheduleCropStageNotifications,
  cancelCropStageNotifications,
} from '../services/notifications';
import { FormField } from './FormField';
import { Copy, Language } from '../i18n/copy';
import { useActiveLanguage } from '../i18n/LanguageContext';
import { GREEN, LIGHT_GREEN, DANGER, INK, MUTED } from '../theme';
import { shared } from '../styles/shared';

export type { StageCategory, StageDefinition, CropGrowthProfile };
export { computeCropProfile };

function getTodayIso(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isoDateDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  return new Date();
}

function isStrictIsoDate(dateStr: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const parsed = new Date(y, mo, d);
  return parsed.getFullYear() === y && parsed.getMonth() === mo && parsed.getDate() === d;
}

function addDays(baseDate: Date, days: number): Date {
  const result = new Date(baseDate.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateShort(d: Date, language: Language = 'en'): string {
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsKn = ['ಜನ', 'ಫೆಬ್ರ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿ', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗ', 'ಸೆಪ್ಟೆಂ', 'ಅಕ್ಟೋ', 'ನವೆಂ', 'ಡಿಸೆಂ'];
  const monthsHi = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सितं', 'अक्टू', 'नव', 'दिस'];
  const months = language === 'kn' ? monthsKn : language === 'hi' ? monthsHi : monthsEn;
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function getDaysSinceSowing(sowingDateStr: string): number {
  const sowing = parseLocalDate(sowingDateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = today.getTime() - sowing.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function parseCustomTotalDays(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = parseInt(trimmed, 10);
  if (Number.isNaN(parsed) || parsed < 20 || parsed > 730) return null;
  return parsed;
}

function getStageCategoryLabel(category: StageCategory, t: Copy): string {
  switch (category) {
    case 'Germination':
      return t.stageGermination;
    case 'Vegetative':
      return t.stageVegetative;
    case 'Flowering/Fruiting':
      return t.stageFlowering;
    case 'Harvest':
      return t.stageHarvest;
    default:
      return category;
  }
}

export function CropStageCalendar({
  db,
  workspaceId,
  lg = false,
  t: propT,
  language: propLanguage,
}: {
  db: SQLite.SQLiteDatabase | null;
  workspaceId: string;
  lg?: boolean;
  t?: Copy;
  language?: Language;
}) {
  const activeLangContext = useActiveLanguage();
  const t = propT || activeLangContext.t;
  const language = propLanguage || activeLangContext.language || 'en';

  const [cropName, setCropName] = useState<string>(POPULAR_CROP_PRESETS[0].labels[language]);
  const [sowingDate, setSowingDate] = useState<string>(getTodayIso());
  const [daysCultivatedInput, setDaysCultivatedInput] = useState<string>('0');
  const [customTotalDaysInput, setCustomTotalDaysInput] = useState<string>('');
  const [savedSchedules, setSavedSchedules] = useState<CropSchedule[]>([]);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadedWorkspaceRef = useRef<string | null>(null);

  const parsedCustomTotalDays = useMemo(
    () => parseCustomTotalDays(customTotalDaysInput),
    [customTotalDaysInput]
  );

  const profile = useMemo(
    () => computeCropProfile(cropName, language, parsedCustomTotalDays),
    [cropName, language, parsedCustomTotalDays]
  );

  const refreshSchedules = useCallback(async () => {
    if (!db) return;
    try {
      const list = await listCropSchedules(db, workspaceId);
      setSavedSchedules(list);
    } catch (err) {
      console.warn('Could not load crop schedules:', err);
    }
  }, [db, workspaceId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!db) return;
      try {
        const list = await listCropSchedules(db, workspaceId);
        if (!alive) return;
        setSavedSchedules(list);
        if (loadedWorkspaceRef.current !== workspaceId) {
          loadedWorkspaceRef.current = workspaceId;
          if (list.length > 0) {
            const first = list[0];
            setActiveScheduleId(first.id);
            setCropName(first.cropName);
            setSowingDate(first.sowingDate);
            setDaysCultivatedInput(String(Math.max(0, getDaysSinceSowing(first.sowingDate))));
            setCustomTotalDaysInput(first.totalDays != null ? String(first.totalDays) : '');
          } else {
            setActiveScheduleId(null);
            setSowingDate(getTodayIso());
            setDaysCultivatedInput('0');
            setCustomTotalDaysInput('');
          }
        }
      } catch (err) {
        console.warn('Could not load crop schedules on init:', err);
      }
    })();
    return () => { alive = false; };
  }, [db, workspaceId]);

  const handleSelectSaved = (schedule: CropSchedule) => {
    setActiveScheduleId(schedule.id);
    setCropName(schedule.cropName);
    setSowingDate(schedule.sowingDate);
    setDaysCultivatedInput(String(Math.max(0, getDaysSinceSowing(schedule.sowingDate))));
    setCustomTotalDaysInput(schedule.totalDays != null ? String(schedule.totalDays) : '');
  };

  const handleNewPlan = () => {
    setActiveScheduleId(null);
    setCropName('');
    setSowingDate(getTodayIso());
    setDaysCultivatedInput('0');
    setCustomTotalDaysInput('');
  };

  const handleSaveSchedule = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      const cleanName = cropName.trim() || t.customCropDefault;
      const cleanDate = isStrictIsoDate(sowingDate) ? sowingDate.trim() : getTodayIso();
      const saved = await addCropSchedule(
        db,
        {
          cropName: cleanName,
          sowingDate: cleanDate,
          totalDays: parsedCustomTotalDays,
        },
        workspaceId
      );
      setActiveScheduleId(saved.id);
      await scheduleCropStageNotifications(saved, profile, language);
      await refreshSchedules();
    } catch (e) {
      console.warn('Failed to save schedule:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSchedule = async (id: string, name: string) => {
    const doDelete = async () => {
      if (!db) return;
      try {
        await cancelCropStageNotifications(id);
        await deleteCropSchedule(db, id, workspaceId);
        if (activeScheduleId === id) {
          setActiveScheduleId(null);
        }
        await refreshSchedules();
      } catch (e) {
        console.warn('Failed to delete schedule:', e);
      }
    };

    const confirmMsg = t.deleteScheduleConfirm.replace('{name}', name);
    if (Platform.OS === 'web') {
      const confirmFn = (globalThis as { confirm?: (message: string) => boolean }).confirm;
      if (confirmFn ? confirmFn(confirmMsg) : true) {
        void doDelete();
      }
      return;
    }

    Alert.alert(
      t.deleteScheduleTitle,
      confirmMsg,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.delete, style: 'destructive', onPress: doDelete },
      ]
    );
  };

  const handleQuickDateOffset = (daysAgo: number) => {
    const nextIso = isoDateDaysAgo(daysAgo);
    setSowingDate(nextIso);
    setDaysCultivatedInput(String(daysAgo));
    setActiveScheduleId(null);
  };

  const handleSowingDateChange = (text: string) => {
    setSowingDate(text);
    setActiveScheduleId(null);
    if (isStrictIsoDate(text)) {
      const computedElapsed = Math.max(0, getDaysSinceSowing(text));
      setDaysCultivatedInput(String(computedElapsed));
    }
  };

  const handleDaysCultivatedChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, '');
    setDaysCultivatedInput(digitsOnly);
    setActiveScheduleId(null);
    if (!digitsOnly) return;
    const days = parseInt(digitsOnly, 10);
    if (!Number.isNaN(days) && days >= 0 && days <= 730) {
      setSowingDate(isoDateDaysAgo(days));
    }
  };

  const handleCustomTotalDaysChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, '');
    setCustomTotalDaysInput(digitsOnly);
    setActiveScheduleId(null);
  };

  const daysElapsed = getDaysSinceSowing(sowingDate);
  const sowingParsed = parseLocalDate(sowingDate);

  let currentStageIndex = -1;
  if (daysElapsed >= 0) {
    currentStageIndex = profile.stages.findIndex(
      s => daysElapsed >= s.startDay && daysElapsed <= s.endDay
    );
    if (currentStageIndex === -1 && daysElapsed > profile.totalDays) {
      currentStageIndex = profile.stages.length - 1;
    }
  }

  const currentStage = currentStageIndex >= 0 ? profile.stages[currentStageIndex] : null;
  const approxMonths = (profile.totalDays / 30).toFixed(1);

  return (
    <View style={[shared.tipCard, lg && shared.tipCardLg, styles.container]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar-outline" size={20} color={GREEN} />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={[shared.tipTitle, lg && shared.tipTitleLg, { color: INK, flexWrap: 'wrap' }]}>
              {t.cropStageCalendarTitle}
            </Text>
            <Text style={styles.headerSubtitle}>
              {t.cropStageCalendarSubtitle}
            </Text>
          </View>
        </View>
      </View>

      {/* Saved Schedules Row */}
      {savedSchedules.length > 0 && (
        <View style={styles.savedSection}>
          <Text style={styles.subheading}>{t.trackedInWorkspace}</Text>
          <View style={styles.savedPillsRow}>
            {savedSchedules.map(sch => {
              const isSelected = activeScheduleId === sch.id;
              const schEmoji = getCropEmoji(sch.cropName);
              const schElapsed = getDaysSinceSowing(sch.sowingDate);
              return (
                <View
                  key={sch.id}
                  style={[
                    styles.savedPill,
                    isSelected && styles.savedPillActive,
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleSelectSaved(sch)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 1 }}
                  >
                    <Text style={{ fontSize: 13 }}>{schEmoji}</Text>
                    <Text
                      style={[
                        styles.savedPillText,
                        isSelected && styles.savedPillTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {sch.cropName} ({t.dayWord} {Math.max(0, schElapsed)})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteSchedule(sch.id, sch.cropName)}
                    style={styles.deletePillBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={15}
                      color={isSelected ? '#FFFFFF' : DANGER}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
            <TouchableOpacity
              onPress={handleNewPlan}
              style={[styles.savedPill, styles.newPlanPill]}
            >
              <Ionicons name="add" size={14} color={GREEN} />
              <Text style={{ fontSize: 12, color: GREEN, fontWeight: '700' }}>
                {t.newCropPlan}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Custom Crop Input Field + Popular Presets */}
      <View style={styles.cropInputSection}>
        <FormField
          label={t.cropInputLabel}
          value={cropName}
          onChangeText={text => {
            setCropName(text);
            setActiveScheduleId(null);
          }}
          placeholder={t.cropInputPlaceholder}
          maxLength={60}
          enableVoice={true}
          language={language}
        />

        <Text style={[styles.subheading, { marginTop: 10, marginBottom: 6 }]}>
          {t.popularCropsLabel}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetsRow}
        >
          {POPULAR_CROP_PRESETS.map(preset => {
            const label = preset.labels[language] || preset.labels.en;
            const isSelected = cropName.trim().toLowerCase() === label.toLowerCase();
            return (
              <TouchableOpacity
                key={preset.key}
                onPress={() => {
                  setCropName(label);
                  setActiveScheduleId(null);
                }}
                style={[styles.presetChip, isSelected && styles.presetChipActive]}
              >
                <Text style={{ fontSize: 13 }}>{preset.emoji}</Text>
                <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Sowing Date Input & Quick Pick */}
      <View style={styles.dateSection}>
        <View style={styles.dateInputCol}>
          <Text style={styles.subheading}>{t.sowingDateLabel}:</Text>
          <TextInput
            value={sowingDate}
            onChangeText={handleSowingDateChange}
            placeholder="YYYY-MM-DD"
            style={styles.dateInput}
            maxLength={10}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={styles.quickOffsetsContainer}>
          <Text style={[styles.subheading, { marginBottom: 6 }]}>{t.quickPick}</Text>
          <View style={styles.quickOffsetsRow}>
            {[
              { label: t.today, days: 0 },
              { label: `-7${t.dayShort}`, days: 7 },
              { label: `-15${t.dayShort}`, days: 15 },
              { label: `-30${t.dayShort}`, days: 30 },
            ].map(offset => (
              <TouchableOpacity
                key={offset.days}
                onPress={() => handleQuickDateOffset(offset.days)}
                style={styles.offsetBtn}
              >
                <Text style={styles.offsetBtnText}>{offset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Days Already Cultivated & Total Crop Growth Days */}
      <View style={styles.numericInputsRow}>
        <View style={styles.numericInputCol}>
          <Text style={styles.subheading}>{t.daysCultivatedLabel}</Text>
          <TextInput
            value={daysCultivatedInput}
            onChangeText={handleDaysCultivatedChange}
            placeholder={t.daysCultivatedPlaceholder}
            placeholderTextColor="#94A3B8"
            style={styles.dateInput}
            maxLength={3}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.numericInputCol}>
          <Text style={styles.subheading}>{t.totalCropDaysLabel}</Text>
          <TextInput
            value={customTotalDaysInput}
            onChangeText={handleCustomTotalDaysChange}
            placeholder={t.totalCropDaysPlaceholder}
            placeholderTextColor="#94A3B8"
            style={styles.dateInput}
            maxLength={3}
            keyboardType="number-pad"
          />
          <Text style={styles.durationHintText}>
            {t.defaultDurationHint.replace('{days}', String(profile.defaultTotalDays))} ·{' '}
            {t.monthsApprox.replace('{months}', approxMonths)}
          </Text>
        </View>
      </View>

      {/* Overview Progress Banner */}
      <View style={styles.progressBanner}>
        <View style={styles.progressBannerHeader}>
          <View style={styles.bannerCropTitleCol}>
            <Text style={styles.bannerCropTitle} numberOfLines={2}>
              {profile.emoji} {profile.label} {t.growthSchedule}
            </Text>
            <Text style={styles.bannerDaysText}>
              {daysElapsed < 0
                ? `${t.sowingInDays} ${Math.abs(daysElapsed)} ${t.daysUnit}`
                : daysElapsed > profile.totalDays
                ? `${t.cropMatured} (${daysElapsed} / ${profile.totalDays} ${t.daysUnit})`
                : `${t.dayWord} ${daysElapsed} / ${profile.totalDays} ${t.daysUnit} (${t.monthsApprox.replace('{months}', approxMonths)})`}
            </Text>
          </View>
          {currentStage && (
            <View style={styles.activeStageBadge}>
              <Text style={styles.activeStageBadgeText} numberOfLines={1}>
                ● {getStageCategoryLabel(currentStage.category, t)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(
                  100,
                  Math.max(0, Math.round((daysElapsed / profile.totalDays) * 100))
                )}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* 4-Stage Timeline Stepper */}
      <View style={styles.timelineContainer}>
        {profile.stages.map((stage, idx) => {
          const startDate = addDays(sowingParsed, stage.startDay);
          const endDate = addDays(sowingParsed, stage.endDay);
          const isActive = daysElapsed >= stage.startDay && daysElapsed <= stage.endDay;
          const isCompleted = daysElapsed > stage.endDay;
          const isUpcoming = daysElapsed < stage.startDay;
          const isLast = idx === profile.stages.length - 1;
          const isBsjdkStage = stage.stageNumber === 2;

          return (
            <View key={stage.stageNumber} style={styles.stageStepRow}>
              <View style={styles.stepperIndicatorCol}>
                <View
                  style={[
                    styles.stepperCircle,
                    isCompleted && styles.stepperCircleCompleted,
                    isActive && styles.stepperCircleActive,
                    isUpcoming && styles.stepperCircleUpcoming,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={14} color={GREEN} />
                  ) : (
                    <Text
                      style={[
                        styles.stepperNumber,
                        isActive && styles.stepperNumberActive,
                        isCompleted && styles.stepperNumberCompleted,
                      ]}
                    >
                      {stage.stageNumber}
                    </Text>
                  )}
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.stepperLine,
                      isCompleted && styles.stepperLineCompleted,
                    ]}
                  />
                )}
              </View>

              <View
                style={[
                  styles.stageContentCard,
                  isActive && styles.stageContentCardActive,
                ]}
              >
                <View style={styles.stageHeaderRow}>
                  <View style={styles.stageHeaderTitleCol}>
                    <Text style={[styles.stageName, isActive && styles.stageNameActive]}>
                      {t.stageLabel} {stage.stageNumber}: {stage.name}
                    </Text>
                    <Text style={styles.stageDatesText}>
                      {t.daysRangeLabel} {stage.startDay} – {stage.endDay} · {formatDateShort(startDate, language)} – {formatDateShort(endDate, language)}
                    </Text>
                  </View>

                  <View style={styles.badgeContainer}>
                    {isActive && (
                      <View style={styles.badgeActive}>
                        <Text style={styles.badgeActiveText}>{t.activeNow}</Text>
                      </View>
                    )}
                    {isCompleted && (
                      <View style={styles.badgeCompleted}>
                        <Text style={styles.badgeCompletedText}>{t.stageCompleted}</Text>
                      </View>
                    )}
                    {isUpcoming && (
                      <View style={styles.badgeUpcoming}>
                        <Text style={styles.badgeUpcomingText}>{t.stageUpcoming}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.remindersBox}>
                  <View style={styles.reminderRow}>
                    <Ionicons
                      name="water-outline"
                      size={16}
                      color="#0288D1"
                      style={{ marginTop: 1, flexShrink: 0 }}
                    />
                    <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                      <Text style={styles.reminderLabel}>{t.irrigation}</Text>
                      <Text style={styles.reminderText}>{stage.irrigationReminder}</Text>
                    </View>
                  </View>
                  <View style={[styles.reminderRow, { marginTop: 8 }]}>
                    <MaterialCommunityIcons
                      name="sprout-outline"
                      size={16}
                      color={GREEN}
                      style={{ marginTop: 1, flexShrink: 0 }}
                    />
                    <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                      <View style={styles.nutritionLabelRow}>
                        <Text style={styles.reminderLabel}>
                          {isBsjdkStage ? t.bsjdkSystemLabel : t.fertilizerNutrition}
                        </Text>
                        {isBsjdkStage && (
                          <View style={styles.bsjdkPill}>
                            <Text style={styles.bsjdkPillText}>BSJDK</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.reminderText}>{stage.fertilizerReminder}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Save / Status Action */}
      <View style={styles.actionSection}>
        {activeScheduleId ? (
          <View style={styles.savedNoticeRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
              <Ionicons name="checkmark-circle" size={16} color={GREEN} />
              <Text style={styles.savedNoticeText} numberOfLines={1}>
                {t.trackingActive}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                const current = savedSchedules.find(s => s.id === activeScheduleId);
                if (current) {
                  void handleDeleteSchedule(current.id, current.cropName);
                }
              }}
              style={styles.deleteScheduleBtn}
            >
              <Text style={styles.deleteScheduleBtnText}>{t.deleteSchedule}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleSaveSchedule}
            disabled={isSaving}
            style={[shared.primaryButton, styles.saveButton]}
          >
            <Ionicons name="bookmark-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={shared.primaryButtonText}>
              {isSaving ? t.savingSchedule : t.saveScheduleToWorkspace}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E8DD',
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginVertical: 14,
  },
  headerRow: {
    marginBottom: 14,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTextCol: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
    lineHeight: 16,
    flexWrap: 'wrap',
  },
  subheading: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
    marginBottom: 8,
  },
  savedSection: {
    backgroundColor: '#F7FAF7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2ECE4',
  },
  savedPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  savedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CDE0D2',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    maxWidth: '100%',
  },
  savedPillActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  savedPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
    flexShrink: 1,
  },
  savedPillTextActive: {
    color: '#FFFFFF',
  },
  deletePillBtn: {
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  newPlanPill: {
    backgroundColor: LIGHT_GREEN,
    borderColor: '#BFE0C7',
    borderStyle: 'dashed',
  },
  cropInputSection: {
    marginBottom: 12,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 2,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F4F8F5',
    borderWidth: 1,
    borderColor: '#D6E5DA',
  },
  presetChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  dateSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  dateInputCol: {
    flex: 1,
    minWidth: 150,
    flexShrink: 1,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#CDE0D2',
    backgroundColor: '#FAFDFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: INK,
    fontWeight: '600',
  },
  quickOffsetsContainer: {
    minWidth: 160,
    flexShrink: 1,
  },
  quickOffsetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  offsetBtn: {
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E2CF',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  offsetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: GREEN,
  },
  numericInputsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  numericInputCol: {
    flex: 1,
    minWidth: 150,
    flexShrink: 1,
  },
  durationHintText: {
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
    fontWeight: '600',
  },
  progressBanner: {
    backgroundColor: '#F0F8F2',
    borderWidth: 1,
    borderColor: '#D5EBD9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  progressBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  bannerCropTitleCol: {
    flex: 1,
    minWidth: 140,
    flexShrink: 1,
  },
  bannerCropTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },
  bannerDaysText: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  activeStageBadge: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  activeStageBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#D7ECD9',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: GREEN,
    borderRadius: 3,
  },
  timelineContainer: {
    marginBottom: 10,
  },
  stageStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepperIndicatorCol: {
    width: 28,
    alignItems: 'center',
    marginRight: 10,
  },
  stepperCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D0DDD3',
    backgroundColor: '#FFFFFF',
  },
  stepperCircleActive: {
    borderColor: GREEN,
    backgroundColor: GREEN,
  },
  stepperCircleCompleted: {
    borderColor: GREEN,
    backgroundColor: LIGHT_GREEN,
  },
  stepperCircleUpcoming: {
    borderColor: '#DDE5DF',
    backgroundColor: '#F7FAF7',
  },
  stepperNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: MUTED,
  },
  stepperNumberActive: {
    color: '#FFFFFF',
  },
  stepperNumberCompleted: {
    color: GREEN,
  },
  stepperLine: {
    width: 2,
    flex: 1,
    minHeight: 45,
    backgroundColor: '#E0EAE2',
    marginTop: 4,
  },
  stepperLineCompleted: {
    backgroundColor: '#A6D5B1',
  },
  stageContentCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FAFDFB',
    borderWidth: 1,
    borderColor: '#E1ECE3',
    borderRadius: 12,
    padding: 12,
  },
  stageContentCardActive: {
    backgroundColor: '#F2F9F3',
    borderColor: '#8BC99A',
    borderWidth: 1.5,
  },
  stageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  stageHeaderTitleCol: {
    flex: 1,
    minWidth: 120,
    flexShrink: 1,
  },
  stageName: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },
  stageNameActive: {
    color: GREEN,
  },
  stageDatesText: {
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
  },
  badgeContainer: {
    flexShrink: 0,
  },
  badgeActive: {
    backgroundColor: GREEN,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexShrink: 0,
  },
  badgeActiveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeCompleted: {
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexShrink: 0,
  },
  badgeCompletedText: {
    color: GREEN,
    fontSize: 10,
    fontWeight: '700',
  },
  badgeUpcoming: {
    backgroundColor: '#EFF3F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexShrink: 0,
  },
  badgeUpcomingText: {
    color: '#7C8A80',
    fontSize: 10,
    fontWeight: '600',
  },
  remindersBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EBF2ED',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  nutritionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  bsjdkPill: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  bsjdkPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.4,
  },
  reminderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
  },
  reminderText: {
    fontSize: 12,
    color: INK,
    lineHeight: 16,
    marginTop: 1,
  },
  actionSection: {
    marginTop: 4,
  },
  savedNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  savedNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
    flexShrink: 1,
  },
  deleteScheduleBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 0,
  },
  deleteScheduleBtnText: {
    fontSize: 12,
    color: DANGER,
    fontWeight: '700',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    width: '100%',
  },
});
