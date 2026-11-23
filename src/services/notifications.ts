import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CropSchedule } from '../db/cropSchedulesRepo';
import { CropGrowthProfile } from '../data/cropProfiles';
import { Language } from '../i18n/copy';

const DAILY_REMINDER_KEY = '@bhoomi_daily_reminder_enabled';
export const FARM_REMINDERS_CHANNEL_ID = 'farm-reminders';

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
  try {
    await Notifications.setNotificationChannelAsync(FARM_REMINDERS_CHANNEL_ID, {
      name: 'Farm Reminders',
      description: 'Daily 7:00 PM farm diary reminders and morning crop stage milestone alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 300, 200, 300, 200, 300],
      lightColor: '#1B5E20',
      sound: 'default',
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
    });
  } catch (err) {
    console.warn('Failed to set up farm-reminders notification channel:', err);
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
  title: string = '📖 Daily Farm Diary Reminder',
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
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 300, 200, 300],
        interruptionLevel: 'timeSensitive',
        color: '#1B5E20',
        data: { type: 'daily_diary_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 19,
        minute: 0,
        channelId: FARM_REMINDERS_CHANNEL_ID,
      },
    });
    return true;
  } catch (err) {
    console.warn('Failed to toggle daily diary reminder:', err);
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
          ? `${profile.emoji} ${schedule.cropName}: ${stage.name} ಆರಂಭ`
          : language === 'hi'
          ? `${profile.emoji} ${schedule.cropName}: ${stage.name} प्रारंभ`
          : `${profile.emoji} ${schedule.cropName}: Stage ${stage.stageNumber} Milestone (${stage.name})`;

        const body = `💧 ${stage.irrigationReminder} | 🌱 ${stage.fertilizerReminder}`;

        await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title,
            body,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.MAX,
            vibrate: [0, 300, 200, 300],
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
            channelId: FARM_REMINDERS_CHANNEL_ID,
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
