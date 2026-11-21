import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import {
  CropSchedule,
  listCropSchedules,
  addCropSchedule,
  deleteCropSchedule,
} from '../db/cropSchedulesRepo';
import { GREEN, LIGHT_GREEN, DANGER, INK, MUTED } from '../theme';
import { shared } from '../styles/shared';

export type SupportedCrop = 'Paddy' | 'Wheat' | 'Cotton' | 'Tomato' | 'Ragi';

export interface StageDefinition {
  stageNumber: number;
  name: string;
  category: 'Germination' | 'Vegetative' | 'Flowering/Fruiting' | 'Harvest';
  startDay: number;
  endDay: number;
  irrigationReminder: string;
  fertilizerReminder: string;
}

export interface CropGrowthProfile {
  crop: SupportedCrop;
  emoji: string;
  label: string;
  totalDays: number;
  stages: StageDefinition[];
}

export const CROP_PROFILES: Record<SupportedCrop, CropGrowthProfile> = {
  Paddy: {
    crop: 'Paddy',
    emoji: '🌾',
    label: 'Paddy (Rice)',
    totalDays: 130,
    stages: [
      {
        stageNumber: 1,
        name: 'Germination & Seedling',
        category: 'Germination',
        startDay: 0,
        endDay: 20,
        irrigationReminder: 'Maintain shallow water (2-3 cm) in nursery bed. Prevent drying or submergence.',
        fertilizerReminder: 'Basal dose of DAP/NPK + Zinc Sulphate (25 kg/ha) during transplanting.',
      },
      {
        stageNumber: 2,
        name: 'Tillering & Vegetative',
        category: 'Vegetative',
        startDay: 21,
        endDay: 55,
        irrigationReminder: 'Maintain 3-5 cm standing water layer; adopt alternate wetting and drying.',
        fertilizerReminder: 'First top dressing with Urea (Nitrogen) at active tillering (Day 25-30).',
      },
      {
        stageNumber: 3,
        name: 'Panicle & Flowering',
        category: 'Flowering/Fruiting',
        startDay: 56,
        endDay: 95,
        irrigationReminder: 'Critical water stage! Never let soil dry out. Keep 5 cm continuous water.',
        fertilizerReminder: 'Apply Muriate of Potash (MOP) to maximize grain filling and reduce lodging.',
      },
      {
        stageNumber: 4,
        name: 'Grain Ripening & Harvest',
        category: 'Harvest',
        startDay: 96,
        endDay: 130,
        irrigationReminder: 'Drain standing water completely 10-14 days before harvest.',
        fertilizerReminder: 'Stop all fertilizers. Harvest when 85-90% panicles turn golden straw color.',
      },
    ],
  },
  Wheat: {
    crop: 'Wheat',
    emoji: '🌿',
    label: 'Wheat',
    totalDays: 120,
    stages: [
      {
        stageNumber: 1,
        name: 'Germination & Crown Root (CRI)',
        category: 'Germination',
        startDay: 0,
        endDay: 21,
        irrigationReminder: 'Most critical irrigation at Crown Root Initiation (Day 20-22). Do not delay.',
        fertilizerReminder: 'Full basal dose of P & K + 1/3rd Nitrogen at sowing.',
      },
      {
        stageNumber: 2,
        name: 'Tillering & Jointing',
        category: 'Vegetative',
        startDay: 22,
        endDay: 60,
        irrigationReminder: 'Second irrigation at tillering (Day 40-45) and third at jointing (Day 60).',
        fertilizerReminder: 'Apply first top dressing of Urea before second irrigation.',
      },
      {
        stageNumber: 3,
        name: 'Heading & Flowering',
        category: 'Flowering/Fruiting',
        startDay: 61,
        endDay: 90,
        irrigationReminder: 'Irrigate at flowering/boot stage on calm days to prevent lodging.',
        fertilizerReminder: 'Foliar spray of 13:0:45 (Potassium Nitrate) to ensure bold grain development.',
      },
      {
        stageNumber: 4,
        name: 'Grain Filling & Harvest',
        category: 'Harvest',
        startDay: 91,
        endDay: 120,
        irrigationReminder: 'Terminal light irrigation at dough stage. Stop water 15 days before harvest.',
        fertilizerReminder: 'No fertilizer. Harvest when grains are hard and moisture is below 12%.',
      },
    ],
  },
  Cotton: {
    crop: 'Cotton',
    emoji: '☁️',
    label: 'Cotton',
    totalDays: 165,
    stages: [
      {
        stageNumber: 1,
        name: 'Germination & Emergence',
        category: 'Germination',
        startDay: 0,
        endDay: 25,
        irrigationReminder: 'Light irrigation for uniform seedling emergence; ensure proper field drainage.',
        fertilizerReminder: 'Basal application of well-decomposed FYM, full Phosphorus, and 1/3rd Nitrogen.',
      },
      {
        stageNumber: 2,
        name: 'Vegetative & Square Formation',
        category: 'Vegetative',
        startDay: 26,
        endDay: 70,
        irrigationReminder: 'Irrigate every 12-15 days depending on soil moisture and weather.',
        fertilizerReminder: 'Top dress with Urea in split doses. Scout frequently for sucking pests.',
      },
      {
        stageNumber: 3,
        name: 'Flowering & Boll Setting',
        category: 'Flowering/Fruiting',
        startDay: 71,
        endDay: 125,
        irrigationReminder: 'Peak water requirement stage. Water stress here causes severe boll dropping.',
        fertilizerReminder: 'Foliar spray of Boron (0.1%) and 19:19:19 to increase boll retention.',
      },
      {
        stageNumber: 4,
        name: 'Boll Opening & Harvesting',
        category: 'Harvest',
        startDay: 126,
        endDay: 165,
        irrigationReminder: 'Terminate irrigation when 10-15% of bolls have cracked open.',
        fertilizerReminder: 'Pick dry, clean open bolls during bright morning sunshine.',
      },
    ],
  },
  Tomato: {
    crop: 'Tomato',
    emoji: '🍅',
    label: 'Tomato',
    totalDays: 110,
    stages: [
      {
        stageNumber: 1,
        name: 'Germination & Nursery',
        category: 'Germination',
        startDay: 0,
        endDay: 20,
        irrigationReminder: 'Gentle daily watering in nursery beds using rose-can or drip.',
        fertilizerReminder: 'Basal organic compost mixed with Trichoderma and 19:19:19 starter.',
      },
      {
        stageNumber: 2,
        name: 'Vegetative Growth & Staking',
        category: 'Vegetative',
        startDay: 21,
        endDay: 45,
        irrigationReminder: 'Drip irrigation every 3-5 days. Avoid wetting foliage to prevent early blight.',
        fertilizerReminder: 'Side dress with Calcium Nitrate and Urea. Stake and prune side suckers.',
      },
      {
        stageNumber: 3,
        name: 'Flowering & Fruit Setting',
        category: 'Flowering/Fruiting',
        startDay: 46,
        endDay: 75,
        irrigationReminder: 'Consistent uniform moisture prevents Blossom End Rot and fruit cracking.',
        fertilizerReminder: 'Apply 0:0:50 Sulphate of Potash + Boron spray for blossom retention.',
      },
      {
        stageNumber: 4,
        name: 'Fruit Ripening & Harvesting',
        category: 'Harvest',
        startDay: 76,
        endDay: 110,
        irrigationReminder: 'Reduce irrigation slightly to improve fruit sweetness and shelf life.',
        fertilizerReminder: 'Pick fruits at color breaker stage (pink/red) every 3-4 days.',
      },
    ],
  },
  Ragi: {
    crop: 'Ragi',
    emoji: '🥣',
    label: 'Ragi (Finger Millet)',
    totalDays: 105,
    stages: [
      {
        stageNumber: 1,
        name: 'Germination & Nursery',
        category: 'Germination',
        startDay: 0,
        endDay: 18,
        irrigationReminder: 'Light surface watering; avoid water stagnation around fragile seedlings.',
        fertilizerReminder: 'Basal FYM + 50% recommended Nitrogen and 100% P & K.',
      },
      {
        stageNumber: 2,
        name: 'Tillering & Vegetative',
        category: 'Vegetative',
        startDay: 19,
        endDay: 45,
        irrigationReminder: 'Irrigate at 8-10 day intervals. Tolerates moderate dry spells well.',
        fertilizerReminder: 'Inter-cultivation weeding and top dress with remaining Nitrogen at Day 25-30.',
      },
      {
        stageNumber: 3,
        name: 'Flowering & Earhead Emergence',
        category: 'Flowering/Fruiting',
        startDay: 46,
        endDay: 75,
        irrigationReminder: 'Crucial stage for grain formation; ensure 1-2 timely protective irrigations.',
        fertilizerReminder: 'Foliar spray of 1% Urea or Panchagavya for healthy, filled earheads.',
      },
      {
        stageNumber: 4,
        name: 'Grain Maturation & Harvest',
        category: 'Harvest',
        startDay: 76,
        endDay: 105,
        irrigationReminder: 'Cut off irrigation when earheads begin turning brownish-grey.',
        fertilizerReminder: 'Harvest mature earheads with sickles, thresh, and dry to 10-12% moisture.',
      },
    ],
  },
};

const CROPS_LIST: SupportedCrop[] = ['Paddy', 'Wheat', 'Cotton', 'Tomato', 'Ragi'];

function getTodayIso(): string {
  const d = new Date();
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

function addDays(baseDate: Date, days: number): Date {
  const result = new Date(baseDate.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateShort(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function getDaysSinceSowing(sowingDateStr: string): number {
  const sowing = parseLocalDate(sowingDateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = today.getTime() - sowing.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function CropStageCalendar({
  db,
  workspaceId,
  lg = false,
}: {
  db: SQLite.SQLiteDatabase | null;
  workspaceId: string;
  lg?: boolean;
}) {
  const [selectedCrop, setSelectedCrop] = useState<SupportedCrop>('Paddy');
  const [sowingDate, setSowingDate] = useState<string>(getTodayIso());
  const [savedSchedules, setSavedSchedules] = useState<CropSchedule[]>([]);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadSchedules = useCallback(async () => {
    if (!db) return;
    try {
      const list = await listCropSchedules(db, workspaceId);
      setSavedSchedules(list);
      if (list.length > 0 && !activeScheduleId) {
        // Default to the first saved schedule if user hasn't selected another
        const first = list[0];
        setActiveScheduleId(first.id);
        if (CROPS_LIST.includes(first.cropName as SupportedCrop)) {
          setSelectedCrop(first.cropName as SupportedCrop);
          setSowingDate(first.sowingDate);
        }
      }
    } catch (err) {
      console.warn('Could not load crop schedules:', err);
    }
  }, [db, workspaceId, activeScheduleId]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const handleSelectSaved = (schedule: CropSchedule) => {
    setActiveScheduleId(schedule.id);
    if (CROPS_LIST.includes(schedule.cropName as SupportedCrop)) {
      setSelectedCrop(schedule.cropName as SupportedCrop);
    }
    setSowingDate(schedule.sowingDate);
  };

  const handleNewPlan = () => {
    setActiveScheduleId(null);
    setSowingDate(getTodayIso());
  };

  const handleSaveSchedule = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      const saved = await addCropSchedule(
        db,
        {
          cropName: selectedCrop,
          sowingDate: sowingDate.trim() || getTodayIso(),
        },
        workspaceId
      );
      setActiveScheduleId(saved.id);
      await loadSchedules();
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
        await deleteCropSchedule(db, id, workspaceId);
        if (activeScheduleId === id) {
          setActiveScheduleId(null);
        }
        await loadSchedules();
      } catch (e) {
        console.warn('Failed to delete schedule:', e);
      }
    };

    Alert.alert(
      'Delete Schedule',
      `Delete the growth stage calendar for ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]
    );
  };

  const handleQuickDateOffset = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSowingDate(`${y}-${m}-${day}`);
    setActiveScheduleId(null);
  };

  const profile = CROP_PROFILES[selectedCrop] || CROP_PROFILES.Paddy;
  const daysElapsed = getDaysSinceSowing(sowingDate);
  const sowingParsed = parseLocalDate(sowingDate);

  // Determine current active stage index (0 to 3)
  let currentStageIndex = -1;
  if (daysElapsed >= 0) {
    currentStageIndex = profile.stages.findIndex(
      s => daysElapsed >= s.startDay && daysElapsed <= s.endDay
    );
    if (currentStageIndex === -1 && daysElapsed > profile.totalDays) {
      currentStageIndex = profile.stages.length - 1; // Completed harvest
    }
  }

  const currentStage = currentStageIndex >= 0 ? profile.stages[currentStageIndex] : null;

  return (
    <View style={[shared.tipCard, lg && shared.tipCardLg, styles.container]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 18 }}>📅</Text>
          </View>
          <View>
            <Text style={[shared.tipTitle, lg && shared.tipTitleLg, { color: INK }]}>
              Automated Crop Growth Calendar
            </Text>
            <Text style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
              Workspace-scoped stage milestones & agronomic reminders
            </Text>
          </View>
        </View>
      </View>

      {/* Saved Schedules Row */}
      {savedSchedules.length > 0 && (
        <View style={styles.savedSection}>
          <Text style={styles.subheading}>Tracked In Workspace:</Text>
          <View style={styles.savedPillsRow}>
            {savedSchedules.map(sch => {
              const isSelected = activeScheduleId === sch.id;
              const schProfile = CROP_PROFILES[sch.cropName as SupportedCrop] || CROP_PROFILES.Paddy;
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
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
                  >
                    <Text style={{ fontSize: 13 }}>{schProfile.emoji}</Text>
                    <Text
                      style={[
                        styles.savedPillText,
                        isSelected && styles.savedPillTextActive,
                      ]}
                    >
                      {sch.cropName} (Day {Math.max(0, schElapsed)})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteSchedule(sch.id, sch.cropName)}
                    style={styles.deletePillBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={{ fontSize: 12, color: isSelected ? '#FFFFFF' : DANGER }}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            <TouchableOpacity
              onPress={handleNewPlan}
              style={[styles.savedPill, styles.newPlanPill]}
            >
              <Text style={{ fontSize: 12, color: GREEN, fontWeight: '700' }}>＋ New Crop</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Crop Picker Chips */}
      <Text style={styles.subheading}>Select Crop:</Text>
      <View style={styles.cropChipsRow}>
        {CROPS_LIST.map(crop => {
          const item = CROP_PROFILES[crop];
          const isSelected = selectedCrop === crop;
          return (
            <TouchableOpacity
              key={crop}
              onPress={() => {
                setSelectedCrop(crop);
                setActiveScheduleId(null);
              }}
              style={[styles.cropChip, isSelected && styles.cropChipSelected]}
            >
              <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
              <Text
                style={[
                  styles.cropChipText,
                  isSelected && styles.cropChipTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sowing Date Input & Quick Offsets */}
      <View style={styles.dateSection}>
        <View style={{ flex: 1 }}>
          <Text style={styles.subheading}>Sowing Date (YYYY-MM-DD):</Text>
          <TextInput
            value={sowingDate}
            onChangeText={v => {
              setSowingDate(v);
              setActiveScheduleId(null);
            }}
            placeholder="YYYY-MM-DD"
            style={styles.dateInput}
            maxLength={10}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={styles.quickOffsetsContainer}>
          <Text style={[styles.subheading, { marginBottom: 6 }]}>Quick Pick:</Text>
          <View style={styles.quickOffsetsRow}>
            {[
              { label: 'Today', days: 0 },
              { label: '-7d', days: 7 },
              { label: '-15d', days: 15 },
              { label: '-30d', days: 30 },
            ].map(offset => (
              <TouchableOpacity
                key={offset.label}
                onPress={() => handleQuickDateOffset(offset.days)}
                style={styles.offsetBtn}
              >
                <Text style={styles.offsetBtnText}>{offset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Overview Progress Banner */}
      <View style={styles.progressBanner}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.bannerCropTitle}>
              {profile.emoji} {profile.label} Growth Schedule
            </Text>
            <Text style={styles.bannerDaysText}>
              {daysElapsed < 0
                ? `Sowing in ${Math.abs(daysElapsed)} days`
                : daysElapsed > profile.totalDays
                ? `Crop Matured (${daysElapsed} days since sowing)`
                : `Day ${daysElapsed} of ${profile.totalDays} Total Growth Days`}
            </Text>
          </View>
          {currentStage && (
            <View style={styles.activeStageBadge}>
              <Text style={styles.activeStageBadgeText}>
                ● {currentStage.category}
              </Text>
            </View>
          )}
        </View>
        {/* Progress bar line */}
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

          return (
            <View key={stage.stageNumber} style={styles.stageStepRow}>
              {/* Stepper left indicator + line */}
              <View style={styles.stepperIndicatorCol}>
                <View
                  style={[
                    styles.stepperCircle,
                    isCompleted && styles.stepperCircleCompleted,
                    isActive && styles.stepperCircleActive,
                    isUpcoming && styles.stepperCircleUpcoming,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepperNumber,
                      isActive && styles.stepperNumberActive,
                      isCompleted && styles.stepperNumberCompleted,
                    ]}
                  >
                    {isCompleted ? '✓' : stage.stageNumber}
                  </Text>
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

              {/* Stage Content Card */}
              <View
                style={[
                  styles.stageContentCard,
                  isActive && styles.stageContentCardActive,
                ]}
              >
                {/* Header row inside stage */}
                <View style={styles.stageHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stageName, isActive && styles.stageNameActive]}>
                      Stage {stage.stageNumber}: {stage.name}
                    </Text>
                    <Text style={styles.stageDatesText}>
                      Days {stage.startDay} – {stage.endDay} · {formatDateShort(startDate)} – {formatDateShort(endDate)}
                    </Text>
                  </View>

                  {/* Status Badge */}
                  {isActive && (
                    <View style={styles.badgeActive}>
                      <Text style={styles.badgeActiveText}>Active Now</Text>
                    </View>
                  )}
                  {isCompleted && (
                    <View style={styles.badgeCompleted}>
                      <Text style={styles.badgeCompletedText}>Completed</Text>
                    </View>
                  )}
                  {isUpcoming && (
                    <View style={styles.badgeUpcoming}>
                      <Text style={styles.badgeUpcomingText}>Upcoming</Text>
                    </View>
                  )}
                </View>

                {/* Agronomic Reminders */}
                <View style={styles.remindersBox}>
                  <View style={styles.reminderRow}>
                    <Text style={styles.reminderIcon}>💧</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reminderLabel}>Irrigation</Text>
                      <Text style={styles.reminderText}>{stage.irrigationReminder}</Text>
                    </View>
                  </View>
                  <View style={[styles.reminderRow, { marginTop: 6 }]}>
                    <Text style={styles.reminderIcon}>🌾</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reminderLabel}>Fertilizer & Nutrition</Text>
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
            <Text style={styles.savedNoticeText}>
              ✓ Tracking active in this workspace
            </Text>
            <TouchableOpacity
              onPress={() => {
                const current = savedSchedules.find(s => s.id === activeScheduleId);
                if (current) {
                  handleDeleteSchedule(current.id, current.cropName);
                }
              }}
              style={styles.deleteScheduleBtn}
            >
              <Text style={styles.deleteScheduleBtnText}>Delete Schedule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleSaveSchedule}
            disabled={isSaving}
            style={[shared.primaryButton, { marginTop: 4, width: '100%' }]}
          >
            <Text style={shared.primaryButtonText}>
              {isSaving ? 'Saving…' : `Save ${selectedCrop} Schedule to Workspace`}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 5,
    gap: 6,
  },
  savedPillActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  savedPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
  },
  savedPillTextActive: {
    color: '#FFFFFF',
  },
  deletePillBtn: {
    paddingHorizontal: 3,
  },
  newPlanPill: {
    backgroundColor: LIGHT_GREEN,
    borderColor: '#BFE0C7',
    borderStyle: 'dashed',
  },
  cropChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  cropChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F3F6F3',
    borderWidth: 1,
    borderColor: '#DCE7DE',
  },
  cropChipSelected: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  cropChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
  },
  cropChipTextSelected: {
    color: '#FFFFFF',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#CDE0D2',
    backgroundColor: '#FAFDFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: INK,
    fontWeight: '600',
  },
  quickOffsetsContainer: {
    justifyContent: 'center',
  },
  quickOffsetsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  offsetBtn: {
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 8,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E2CF',
  },
  offsetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: GREEN,
  },
  progressBanner: {
    backgroundColor: '#F0F8F2',
    borderWidth: 1,
    borderColor: '#D5EBD9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
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
    paddingVertical: 4,
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
  badgeActive: {
    backgroundColor: GREEN,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
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
    gap: 6,
  },
  reminderIcon: {
    fontSize: 13,
    marginTop: 1,
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
    paddingVertical: 8,
    borderRadius: 10,
  },
  savedNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
  },
  deleteScheduleBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteScheduleBtnText: {
    fontSize: 12,
    color: DANGER,
    fontWeight: '700',
  },
});
