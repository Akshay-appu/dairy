import { Linking, Platform, Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CropSchedule, listCropSchedules } from '../db/cropSchedulesRepo';
import { listVaultDocuments, VaultDocument } from '../db/vaultRepo';
import { computeCropProfile, CropGrowthProfile } from '../data/cropProfiles';
import { Copy, Language } from '../i18n/copy';

const DAILY_REMINDER_KEY = '@bhoomi_daily_reminder_enabled';
const MORNING_WEATHER_ALERT_KEY = '@bhoomi_morning_weather_alert_enabled';
const MANDI_ALARM_ENABLED_KEY = '@bhoomi_mandi_alarm_enabled';
const MANDI_ALARM_TIME_KEY = '@bhoomi_mandi_alarm_time';
const ANDROID_PACKAGE_NAME = 'com.bhoomishakti.diary';

export const FARM_ALARMS_CHANNEL_ID = 'farm-alarms-v3';
export const FARM_REMINDERS_CHANNEL_ID = FARM_ALARMS_CHANNEL_ID;
export const FARM_ALARM_SOUND = 'farm_alarm.wav';
const LEGACY_CHANNEL_ID = 'farm-alarms-v2';
const ALARM_VIBRATION_PATTERN = [0, 600, 250, 600, 250, 800];

export type BhoomiEmailEventType = 'account_created' | 'report_requested';

export type BhoomiEmailNotifyPayload = {
  event: BhoomiEmailEventType;
  email: string;
  farmerName?: string;
  village?: string;
  workspaceName?: string;
  reportFormat?: 'pdf' | 'csv';
  language?: Language;
  timestamp?: string;
};

export type BhoomiEmailNotifyResult = {
  sent: boolean;
  skipped?: boolean;
  statusCode?: number;
  reason?: string;
};

let isHandlerConfigured = false;

export function setupNotificationHandler(): void {
  if (isHandlerConfigured) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.MAX,
      }),
    });
    isHandlerConfigured = true;
  } catch (err) {
    console.warn('Failed to configure notification handler:', err);
  }
}

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const channelConfig = {
    name: 'BS Diary Farm Alarms',
    description: 'Daily diary alarms, mandi wake-up alarms, morning weather alerts, crop milestones, and warranty expiry alarms',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: ALARM_VIBRATION_PATTERN,
    lightColor: '#1B5E20',
    sound: FARM_ALARM_SOUND,
    enableLights: true,
    enableVibrate: true,
    showBadge: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      flags: {
        enforceAudibility: true,
        requestHardwareAudioVideoSynchronization: false,
      },
    },
  };

  try {
    await Notifications.deleteNotificationChannelAsync(LEGACY_CHANNEL_ID).catch(() => {});
    await Notifications.setNotificationChannelAsync(FARM_ALARMS_CHANNEL_ID, channelConfig);
  } catch (err) {
    console.warn('Custom sound channel setup failed, falling back to default alarm sound:', err);
    try {
      await Notifications.setNotificationChannelAsync(FARM_ALARMS_CHANNEL_ID, {
        ...channelConfig,
        sound: 'default',
      });
    } catch (fallbackErr) {
      console.warn('Failed to set up farm-alarms-v3 notification channel:', fallbackErr);
    }
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    setupNotificationHandler();
    await setupNotificationChannels();
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      return true;
    }
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  } catch (err) {
    console.warn('Failed to request notification permissions:', err);
    return false;
  }
}

export async function isDailyReminderEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(DAILY_REMINDER_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setDailyReminderEnabled(
  enabled: boolean,
  title: string = 'Daily Farm Diary Reminder',
  body: string = 'Take a moment to record today’s farm activities, expenses, and harvests before resting.'
): Promise<boolean> {
  try {
    await AsyncStorage.setItem(DAILY_REMINDER_KEY, enabled ? 'true' : 'false');
    await Notifications.cancelScheduledNotificationAsync('daily-farm-diary-reminder').catch(() => {});

    if (!enabled) {
      return true;
    }

    const granted = await requestNotificationPermissions();
    if (!granted) {
      await AsyncStorage.setItem(DAILY_REMINDER_KEY, 'false');
      return false;
    }

    await setupNotificationChannels();

    await Notifications.scheduleNotificationAsync({
      identifier: 'daily-farm-diary-reminder',
      content: {
        title,
        body,
        sound: FARM_ALARM_SOUND,
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: ALARM_VIBRATION_PATTERN,
        interruptionLevel: 'timeSensitive',
        color: '#1B5E20',
        data: { type: 'daily_diary_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 19,
        minute: 0,
        channelId: FARM_ALARMS_CHANNEL_ID,
      },
    });
    return true;
  } catch (err) {
    console.warn('Failed to toggle daily diary reminder:', err);
    return false;
  }
}

export async function isMorningWeatherAlertEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(MORNING_WEATHER_ALERT_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setMorningWeatherAlertEnabled(
  enabled: boolean,
  title: string = 'Morning Weather & Spray Alert',
  body: string = 'Check local wind, rain risk, and today’s safe spraying window in BS Diary.'
): Promise<boolean> {
  try {
    await AsyncStorage.setItem(MORNING_WEATHER_ALERT_KEY, enabled ? 'true' : 'false');
    await Notifications.cancelScheduledNotificationAsync('morning-weather-spray-alert').catch(() => {});

    if (!enabled) {
      return true;
    }

    const granted = await requestNotificationPermissions();
    if (!granted) {
      await AsyncStorage.setItem(MORNING_WEATHER_ALERT_KEY, 'false');
      return false;
    }

    await setupNotificationChannels();

    await Notifications.scheduleNotificationAsync({
      identifier: 'morning-weather-spray-alert',
      content: {
        title,
        body,
        sound: FARM_ALARM_SOUND,
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: ALARM_VIBRATION_PATTERN,
        interruptionLevel: 'timeSensitive',
        color: '#1B5E20',
        data: { type: 'morning_weather_alert' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 6,
        minute: 30,
        channelId: FARM_ALARMS_CHANNEL_ID,
      },
    });
    return true;
  } catch (err) {
    console.warn('Failed to toggle morning weather alert:', err);
    return false;
  }
}

export async function isMandiAlarmEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(MANDI_ALARM_ENABLED_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function getMandiAlarmTime(): Promise<{ hour: number; minute: number }> {
  try {
    const raw = await AsyncStorage.getItem(MANDI_ALARM_TIME_KEY);
    if (!raw) return { hour: 3, minute: 0 };
    const parsed = JSON.parse(raw) as { hour?: unknown; minute?: unknown };
    const hour = typeof parsed.hour === 'number' && Number.isInteger(parsed.hour) && parsed.hour >= 0 && parsed.hour <= 23
      ? parsed.hour
      : 3;
    const minute = typeof parsed.minute === 'number' && Number.isInteger(parsed.minute) && parsed.minute >= 0 && parsed.minute <= 59
      ? parsed.minute
      : 0;
    return { hour, minute };
  } catch {
    return { hour: 3, minute: 0 };
  }
}

export async function setMandiAlarm(
  enabled: boolean,
  hour: number,
  minute: number,
  title: string = 'Mandi Morning Alarm',
  body: string = 'Time to prepare for the morning mandi! Open BS Diary to log today’s vegetable boxes.'
): Promise<boolean> {
  const safeHour = Math.max(0, Math.min(23, Math.floor(Number.isFinite(hour) ? hour : 3)));
  const safeMinute = Math.max(0, Math.min(59, Math.floor(Number.isFinite(minute) ? minute : 0)));
  try {
    await AsyncStorage.setItem(MANDI_ALARM_TIME_KEY, JSON.stringify({ hour: safeHour, minute: safeMinute }));
    await AsyncStorage.setItem(MANDI_ALARM_ENABLED_KEY, enabled ? 'true' : 'false');
    if (Platform.OS !== 'web') {
      await Notifications.cancelScheduledNotificationAsync('mandi-morning-alarm').catch(() => {});
    }

    if (!enabled) {
      return true;
    }

    const granted = await requestNotificationPermissions();
    if (!granted) {
      await AsyncStorage.setItem(MANDI_ALARM_ENABLED_KEY, 'false');
      return false;
    }

    await setupNotificationChannels();

    await Notifications.scheduleNotificationAsync({
      identifier: 'mandi-morning-alarm',
      content: {
        title,
        body,
        sound: FARM_ALARM_SOUND,
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: ALARM_VIBRATION_PATTERN,
        interruptionLevel: 'timeSensitive',
        color: '#1B5E20',
        data: { type: 'mandi_morning_alarm', hour: safeHour, minute: safeMinute },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: safeHour,
        minute: safeMinute,
        channelId: FARM_ALARMS_CHANNEL_ID,
      },
    });
    return true;
  } catch (err) {
    console.warn('Failed to configure mandi morning alarm:', err);
    return false;
  }
}

export async function openNotificationAlarmSettings(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await setupNotificationChannels();
    try {
      await Linking.sendIntent('android.settings.CHANNEL_NOTIFICATION_SETTINGS', [
        { key: 'android.provider.extra.APP_PACKAGE', value: ANDROID_PACKAGE_NAME },
        { key: 'android.provider.extra.CHANNEL_ID', value: FARM_ALARMS_CHANNEL_ID },
      ]);
      return true;
    } catch {
      try {
        await Linking.openSettings();
        return true;
      } catch (err) {
        console.warn('Failed to open notification alarm settings:', err);
        return false;
      }
    }
  }
  try {
    await Linking.openSettings();
    return true;
  } catch (err) {
    console.warn('Failed to open notification settings:', err);
    return false;
  }
}

function playWebPreviewChime(): void {
  try {
    const win = globalThis as unknown as {
      AudioContext?: new () => {
        currentTime: number;
        destination: unknown;
        createOscillator: () => {
          type: string;
          frequency: { setValueAtTime: (freq: number, t: number) => void };
          connect: (dest: unknown) => void;
          start: (t?: number) => void;
          stop: (t?: number) => void;
        };
        createGain: () => {
          gain: { setValueAtTime: (v: number, t: number) => void; exponentialRampToValueAtTime: (v: number, t: number) => void };
          connect: (dest: unknown) => void;
        };
      };
      webkitAudioContext?: new () => {
        currentTime: number;
        destination: unknown;
        createOscillator: () => {
          type: string;
          frequency: { setValueAtTime: (freq: number, t: number) => void };
          connect: (dest: unknown) => void;
          start: (t?: number) => void;
          stop: (t?: number) => void;
        };
        createGain: () => {
          gain: { setValueAtTime: (v: number, t: number) => void; exponentialRampToValueAtTime: (v: number, t: number) => void };
          connect: (dest: unknown) => void;
        };
      };
    };
    const AudioCtx = win.AudioContext || win.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const notes = [880, 1174.66];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);
      gain.gain.setValueAtTime(0.25, now + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 0.36);
    });
  } catch {
    // Ignore autoplay/WebAudio restrictions
  }
}

export async function previewFarmAlarmTone(
  title: string = 'BS Diary Alarm Tone',
  body: string = 'Farm Chime alarm preview. You can pick any phone alarm tone in settings.'
): Promise<boolean> {
  if (Platform.OS === 'web') {
    playWebPreviewChime();
    try {
      const WebNotif = (globalThis as unknown as {
        Notification?: {
          permission: string;
          requestPermission?: () => Promise<string>;
          new (t: string, opts?: { body?: string }): unknown;
        };
      }).Notification;
      if (WebNotif) {
        if (WebNotif.permission === 'granted') {
          new WebNotif(title, { body });
        } else if (WebNotif.permission !== 'denied' && typeof WebNotif.requestPermission === 'function') {
          const perm = await WebNotif.requestPermission();
          if (perm === 'granted') {
            new WebNotif(title, { body });
          }
        }
      }
    } catch {
      // Browser notifications optional on web
    }
    return true;
  }

  try {
    setupNotificationHandler();
    const granted = await requestNotificationPermissions();
    if (!granted) return false;

    await setupNotificationChannels();

    // Direct haptic pulse alongside the channel vibration so preview immediately confirms vibration
    try {
      Vibration.vibrate([0, 400, 200, 400]);
    } catch {
      // Non-fatal if device lacks vibrator
    }

    await Notifications.cancelScheduledNotificationAsync('farm-alarm-tone-preview').catch(() => {});

    await Notifications.scheduleNotificationAsync({
      identifier: 'farm-alarm-tone-preview',
      content: {
        title,
        body,
        sound: FARM_ALARM_SOUND,
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: ALARM_VIBRATION_PATTERN,
        interruptionLevel: 'timeSensitive',
        color: '#1B5E20',
        data: { type: 'alarm_tone_preview' },
      },
      trigger: Platform.OS === 'android' ? { channelId: FARM_ALARMS_CHANNEL_ID } : null,
    });
    return true;
  } catch (err) {
    console.warn('Failed to preview farm alarm tone:', err);
    return false;
  }
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

export async function scheduleCropStageNotifications(
  schedule: CropSchedule,
  profile: CropGrowthProfile,
  language: Language = 'en'
): Promise<number> {
  if (Platform.OS === 'web') return 0;
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return 0;

    await setupNotificationChannels();

    const sowingParsed = parseLocalDate(schedule.sowingDate);
    const now = Date.now();
    let scheduledCount = 0;

    for (const stage of profile.stages) {
      const stageDate = addDays(sowingParsed, stage.startDay);
      // Set trigger time to 7:00 AM on the stage milestone day
      stageDate.setHours(7, 0, 0, 0);

      const identifier = `crop-${schedule.id}-stage-${stage.stageNumber}`;
      await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

      if (stageDate.getTime() > now) {
        const title = language === 'kn'
          ? `${schedule.cropName}: ${stage.name} ಆರಂಭ`
          : language === 'hi'
          ? `${schedule.cropName}: ${stage.name} प्रारंभ`
          : `${schedule.cropName}: Stage ${stage.stageNumber} Milestone (${stage.name})`;

        const body = `${stage.irrigationReminder} | ${stage.fertilizerReminder}`;

        await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title,
            body,
            sound: FARM_ALARM_SOUND,
            priority: Notifications.AndroidNotificationPriority.MAX,
            vibrate: ALARM_VIBRATION_PATTERN,
            interruptionLevel: 'timeSensitive',
            color: '#1B5E20',
            data: {
              type: 'crop_stage_milestone',
              scheduleId: schedule.id,
              stageNumber: stage.stageNumber,
              cropName: schedule.cropName,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: stageDate,
            channelId: FARM_ALARMS_CHANNEL_ID,
          },
        });
        scheduledCount += 1;
      }
    }
    return scheduledCount;
  } catch (err) {
    console.warn('Failed to schedule crop stage notifications:', err);
    return 0;
  }
}

export async function cancelCropStageNotifications(scheduleId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    for (let stageNum = 1; stageNum <= 4; stageNum += 1) {
      await Notifications.cancelScheduledNotificationAsync(`crop-${scheduleId}-stage-${stageNum}`).catch(() => {});
    }
  } catch (err) {
    console.warn(`Failed to cancel notifications for schedule ${scheduleId}:`, err);
  }
}

export async function cancelWarrantyExpiryNotification(docId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(`warranty-${docId}-expiry`).catch(() => {});
    await Notifications.cancelScheduledNotificationAsync(`warranty-${docId}-pre`).catch(() => {});
  } catch (err) {
    console.warn(`Failed to cancel warranty notifications for ${docId}:`, err);
  }
}

export async function scheduleWarrantyExpiryNotification(
  doc: VaultDocument,
  language: Language,
  t: Copy
): Promise<number> {
  if (Platform.OS === 'web') return 0;
  await cancelWarrantyExpiryNotification(doc.id);

  if (doc.category !== 'Warranty Slip' || !doc.warrantyExpiryDate) {
    return 0;
  }

  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return 0;

    await setupNotificationChannels();

    const expiryDate = parseLocalDate(doc.warrantyExpiryDate);
    expiryDate.setHours(7, 0, 0, 0);

    const itemName = (doc.warrantyItemName?.trim() || doc.title || 'Equipment').trim();
    const dateLabel = doc.warrantyExpiryDate.trim();
    const now = Date.now();
    let scheduled = 0;

    if (expiryDate.getTime() > now) {
      const title = t.warrantyExpiryNotifTitle;
      const body = t.warrantyExpiryNotifBody
        .replace('{item}', itemName)
        .replace('{date}', dateLabel);

      await Notifications.scheduleNotificationAsync({
        identifier: `warranty-${doc.id}-expiry`,
        content: {
          title,
          body,
          sound: FARM_ALARM_SOUND,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: ALARM_VIBRATION_PATTERN,
          interruptionLevel: 'timeSensitive',
          color: '#1B5E20',
          data: {
            type: 'warranty_expiry',
            docId: doc.id,
            language,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: expiryDate,
          channelId: FARM_ALARMS_CHANNEL_ID,
        },
      });
      scheduled += 1;
    }

    const alertDays =
      typeof doc.warrantyAlertDaysBefore === 'number' && Number.isFinite(doc.warrantyAlertDaysBefore)
        ? Math.max(0, Math.round(doc.warrantyAlertDaysBefore))
        : 7;

    if (alertDays > 0) {
      const preDate = addDays(expiryDate, -alertDays);
      preDate.setHours(7, 0, 0, 0);
      if (preDate.getTime() > now) {
        const title = t.warrantyPreExpiryNotifTitle.replace('{days}', String(alertDays));
        const body = t.warrantyPreExpiryNotifBody
          .replace('{item}', itemName)
          .replace('{date}', dateLabel)
          .replace('{days}', String(alertDays));

        await Notifications.scheduleNotificationAsync({
          identifier: `warranty-${doc.id}-pre`,
          content: {
            title,
            body,
            sound: FARM_ALARM_SOUND,
            priority: Notifications.AndroidNotificationPriority.MAX,
            vibrate: ALARM_VIBRATION_PATTERN,
            interruptionLevel: 'timeSensitive',
            color: '#1B5E20',
            data: {
              type: 'warranty_pre_expiry',
              docId: doc.id,
              daysBefore: alertDays,
              language,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: preDate,
            channelId: FARM_ALARMS_CHANNEL_ID,
          },
        });
        scheduled += 1;
      }
    }

    return scheduled;
  } catch (err) {
    console.warn('Failed to schedule warranty expiry notification:', err);
    return 0;
  }
}

export async function rescheduleAllActiveRemindersForLanguage(
  db: SQLite.SQLiteDatabase | null,
  workspaceId: string,
  language: Language,
  t: Copy
): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    // Only reschedule if notification permission is already granted so switching
    // languages never pops an unexpected OS permission dialog.
    const perm = await Notifications.getPermissionsAsync();
    const hasPerm =
      perm.granted || perm.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    if (!hasPerm) return;

    await setupNotificationChannels();

    const [dailyEnabled, morningEnabled, mandiEnabled, mandiTime] = await Promise.all([
      isDailyReminderEnabled(),
      isMorningWeatherAlertEnabled(),
      isMandiAlarmEnabled(),
      getMandiAlarmTime(),
    ]);

    if (dailyEnabled) {
      await setDailyReminderEnabled(true, t.dailyReminderNotifTitle, t.dailyReminderNotifBody);
    }
    if (morningEnabled) {
      await setMorningWeatherAlertEnabled(
        true,
        t.morningWeatherAlertNotifTitle,
        t.morningWeatherAlertNotifBody
      );
    }
    if (mandiEnabled) {
      await setMandiAlarm(
        true,
        mandiTime.hour,
        mandiTime.minute,
        t.mandiAlarmNotifTitle,
        t.mandiAlarmNotifBody
      );
    }

    if (db) {
      const [schedules, docs] = await Promise.all([
        listCropSchedules(db, workspaceId),
        listVaultDocuments(db, workspaceId),
      ]);

      for (const sch of schedules) {
        const profile = computeCropProfile(sch.cropName, language, sch.totalDays);
        await scheduleCropStageNotifications(sch, profile, language);
      }

      for (const doc of docs) {
        if (doc.category === 'Warranty Slip' && doc.warrantyExpiryDate) {
          await scheduleWarrantyExpiryNotification(doc, language, t);
        }
      }
    }
  } catch (err) {
    console.warn('Failed to reschedule active reminders for language change:', err);
  }
}

/**
 * Optional webhook integration to notify bhoomishakti.in mail services when a
 * farmer creates an account or exports/requests an email report.
 * Never throws so offline or unconfigured environments remain unaffected.
 */
export async function notifyBhoomiEmailService(
  payload: BhoomiEmailNotifyPayload
): Promise<BhoomiEmailNotifyResult> {
  const webhookUrl = process.env.EXPO_PUBLIC_EMAIL_NOTIFY_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return { sent: false, skipped: true, reason: 'webhook_not_configured' };
  }
  if (!/^https?:\/\//i.test(webhookUrl)) {
    return { sent: false, skipped: true, reason: 'invalid_webhook_url' };
  }
  const cleanEmail = payload.email.trim();
  if (!cleanEmail) {
    return { sent: false, skipped: true, reason: 'missing_email' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        email: cleanEmail,
        source: 'bhoomishakti-diary-app',
        domain: 'bhoomishakti.in',
        timestamp: payload.timestamp ?? new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        sent: false,
        statusCode: response.status,
        reason: `http_${response.status}`,
      };
    }
    return { sent: true, statusCode: response.status };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return { sent: false, reason };
  } finally {
    clearTimeout(timer);
  }
}
