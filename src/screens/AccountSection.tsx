import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import { authErrorKey, useAuth } from '../hooks/useAuth';
import { useSync } from '../hooks/useSync';
import { useFarmProfile } from '../hooks/useFarmProfile';
import { Copy, Language } from '../i18n/copy';
import { formatLongDate } from '../utils/format';
import { GREEN, LIGHT_GREEN, DANGER, INK, MUTED } from '../theme';
import {
  isDailyReminderEnabled,
  isMorningWeatherAlertEnabled,
  notifyBhoomiEmailService,
  openNotificationAlarmSettings,
  previewFarmAlarmTone,
  setDailyReminderEnabled,
  setMorningWeatherAlertEnabled,
} from '../services/notifications';

type AuthMode = 'signUp' | 'signIn';

export function AccountSection({
  t,
  language,
  auth,
  sync,
  onSignIn: _onSignIn,
  onSignOutConfirm,
  onDeleteAccount,
  db: _db,
  profile,
}: {
  t: Copy;
  language: Language;
  auth: ReturnType<typeof useAuth>;
  sync: ReturnType<typeof useSync>;
  onSignIn: () => void;
  onSignOutConfirm: () => void;
  onDeleteAccount: () => void;
  db?: SQLite.SQLiteDatabase | null;
  profile?: ReturnType<typeof useFarmProfile>;
}) {
  const [mode, setMode] = useState<AuthMode>('signUp');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  // Notification & verification states
  const [dailyReminder, setDailyReminder] = useState(false);
  const [morningWeatherAlert, setMorningWeatherAlert] = useState(false);
  const [notifStatus, setNotifStatus] = useState<string | null>(null);
  const [notifStatusError, setNotifStatusError] = useState(false);
  const [previewingTone, setPreviewingTone] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [dailyEnabled, morningEnabled] = await Promise.all([
        isDailyReminderEnabled(),
        isMorningWeatherAlertEnabled(),
      ]);
      if (alive) {
        setDailyReminder(dailyEnabled);
        setMorningWeatherAlert(morningEnabled);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleToggleDailyReminder = async (value: boolean) => {
    setDailyReminder(value);
    setNotifStatus(null);
    setNotifStatusError(false);
    const success = await setDailyReminderEnabled(
      value,
      t.dailyReminderNotifTitle,
      t.dailyReminderNotifBody
    );
    if (!success && value) {
      setDailyReminder(false);
      setNotifStatus(t.notificationPermissionDenied);
      setNotifStatusError(true);
    }
  };

  const handleToggleMorningWeatherAlert = async (value: boolean) => {
    setMorningWeatherAlert(value);
    setNotifStatus(null);
    setNotifStatusError(false);
    const success = await setMorningWeatherAlertEnabled(
      value,
      t.morningWeatherAlertNotifTitle,
      t.morningWeatherAlertNotifBody
    );
    if (!success && value) {
      setMorningWeatherAlert(false);
      setNotifStatus(t.notificationPermissionDenied);
      setNotifStatusError(true);
    }
  };

  const handleChooseAlarmTone = async () => {
    setNotifStatus(null);
    setNotifStatusError(false);
    await openNotificationAlarmSettings();
  };

  const handlePreviewAlarmTone = async () => {
    setPreviewingTone(true);
    setNotifStatus(null);
    setNotifStatusError(false);
    try {
      const ok = await previewFarmAlarmTone(
        t.alarmTonePreviewTitle,
        t.alarmTonePreviewBody
      );
      if (ok) {
        setNotifStatus(t.alarmTonePreviewing);
        setNotifStatusError(false);
      } else {
        setNotifStatus(t.notificationPermissionDenied);
        setNotifStatusError(true);
      }
    } finally {
      setPreviewingTone(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    setVerificationNotice('');
    try {
      const sent = await auth.resendEmailVerification();
      if (sent) {
        setVerificationNotice(t.verificationEmailSent);
      }
    } catch {
      // Ignore rate-limit/transient failures cleanly
    } finally {
      setResendingVerification(false);
    }
  };

  const handleSubmitAuth = useCallback(async () => {
    setError('');
    setInfo('');
    setVerificationNotice('');
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError(t.authErrorInvalidEmail);
      return;
    }
    setBusy(true);
    try {
      const cleanName = name.trim();
      const cleanVillage = village.trim();

      if (mode === 'signUp') {
        await auth.signUp(cleanEmail, password, cleanName);
        if (profile && (cleanName || cleanVillage)) {
          await profile.save({
            farmName: profile.profile?.farmName || (cleanVillage ? `${cleanVillage} Farm` : 'My Farm'),
            farmerName: cleanName || profile.profile?.farmerName || '',
            village: cleanVillage || profile.profile?.village || '',
            district: profile.profile?.district || '',
            state: profile.profile?.state || '',
            totalArea: profile.profile?.totalArea ?? null,
            areaUnit: profile.profile?.areaUnit || 'acres',
          }).catch(() => {});
        }
        void notifyBhoomiEmailService({
          event: 'account_created',
          email: cleanEmail,
          farmerName: cleanName || undefined,
          village: cleanVillage || undefined,
          language,
        });
        setVerificationNotice(t.verificationEmailSent);
      } else {
        await auth.signIn(cleanEmail, password);
      }
      setEmail('');
      setPassword('');
      setName('');
      setVillage('');
    } catch (err) {
      setError(t[authErrorKey(err)]);
    } finally {
      setBusy(false);
    }
  }, [auth, email, language, mode, name, password, profile, t, village]);

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError(t.authErrorInvalidEmail);
      return;
    }
    setBusy(true);
    try {
      await auth.resetPassword(cleanEmail);
      setInfo(t.resetPasswordSent);
    } catch (err) {
      setError(t[authErrorKey(err)]);
    } finally {
      setBusy(false);
    }
  };

  const farmerDisplayName =
    auth.user?.displayName ||
    profile?.profile?.farmerName ||
    (auth.user?.email ? auth.user.email.split('@')[0] : 'Farmer');

  const locale = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

  return (
    <View style={styles.container}>
      {/* 1. Account & Realtime Cloud Sync Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="cloud-done-outline" size={22} color={GREEN} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.cardTitle}>{t.farmerAccount}</Text>
            <Text style={styles.cardSubtitle}>{t.farmerAccountSubtitle}</Text>
          </View>
        </View>

        {auth.loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={GREEN} />
          </View>
        ) : auth.user ? (
          /* SIGNED IN VIEW */
          <View style={styles.signedInContent}>
            {/* Farmer Profile Badge */}
            <View style={styles.farmerProfileBox}>
              <View style={styles.farmerAvatarCircle}>
                <Ionicons name="person" size={24} color={GREEN} />
              </View>
              <View style={styles.farmerDetails}>
                <Text style={styles.farmerNameText} numberOfLines={1}>
                  {farmerDisplayName}
                </Text>
                <View style={styles.emailRow}>
                  <Ionicons name="mail-outline" size={13} color={MUTED} style={{ marginRight: 4 }} />
                  <Text style={styles.farmerEmailText} numberOfLines={1}>
                    {auth.user.email}
                  </Text>
                </View>
                {auth.user.email ? (
                  <View style={styles.verificationRow}>
                    <View
                      style={[
                        styles.verificationBadge,
                        auth.user.emailVerified ? styles.verificationBadgeOk : styles.verificationBadgePending,
                      ]}
                    >
                      <Ionicons
                        name={auth.user.emailVerified ? 'checkmark-circle' : 'mail-unread-outline'}
                        size={12}
                        color={auth.user.emailVerified ? '#15803D' : '#B45309'}
                      />
                      <Text
                        style={[
                          styles.verificationBadgeText,
                          auth.user.emailVerified ? styles.verificationBadgeTextOk : styles.verificationBadgeTextPending,
                        ]}
                      >
                        {auth.user.emailVerified ? t.emailVerified : t.emailNotVerified}
                      </Text>
                    </View>
                    {!auth.user.emailVerified && (
                      <TouchableOpacity
                        onPress={handleResendVerification}
                        disabled={resendingVerification}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Text style={styles.resendLinkText}>{t.resendVerificationEmail}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : null}
              </View>
            </View>

            {!!verificationNotice && (
              <View style={[styles.infoBox, { marginTop: 10 }]}>
                <Ionicons name="mail-outline" size={16} color={GREEN} style={{ marginRight: 6 }} />
                <Text style={styles.infoBoxText}>{verificationNotice}</Text>
              </View>
            )}

            {/* Sync Status Banner */}
            <View style={styles.syncStatusBox}>
              <View style={styles.syncStatusHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0, flexShrink: 1 }}>
                  {sync.status === 'syncing' ? (
                    <ActivityIndicator size="small" color={GREEN} />
                  ) : sync.status === 'error' ? (
                    <Ionicons name="alert-circle" size={18} color={DANGER} />
                  ) : (
                    <Ionicons name="checkmark-circle" size={18} color={GREEN} />
                  )}
                  <Text style={styles.syncStatusTitle} numberOfLines={1}>
                    {sync.status === 'syncing'
                      ? t.syncingWithCloud
                      : sync.status === 'error'
                      ? t.syncError
                      : t.syncSuccess}
                  </Text>
                </View>
                <View style={[styles.badgePill, sync.status === 'error' && styles.badgePillError]}>
                  <Text style={[styles.badgePillText, sync.status === 'error' && styles.badgePillTextError]}>
                    {sync.status === 'syncing' ? t.syncing : sync.status === 'error' ? t.syncStatusFailed : t.syncStatusActive}
                  </Text>
                </View>
              </View>

              <Text style={styles.syncTimestampText}>
                {sync.lastSyncedAt
                  ? `${t.lastSynced}: ${formatLongDate(sync.lastSyncedAt, locale)}`
                  : t.neverSynced}
              </Text>
              {sync.status === 'error' && sync.errorMessage ? (
                <Text style={styles.syncErrorMessage}>{sync.errorMessage}</Text>
              ) : null}
            </View>

            {/* Sync & Sign Out Buttons */}
            <View style={styles.buttonActionRow}>
              <TouchableOpacity
                style={[styles.primaryActionBtn, sync.status === 'syncing' && styles.btnDisabled]}
                onPress={() => sync.syncNow()}
                disabled={sync.status === 'syncing'}
              >
                <Ionicons name="sync-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.primaryActionBtnText}>
                  {sync.status === 'syncing' ? t.syncing : t.syncNow}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryActionBtn} onPress={onSignOutConfirm}>
                <Ionicons name="log-out-outline" size={18} color={INK} style={{ marginRight: 6 }} />
                <Text style={styles.secondaryActionBtnText}>{t.signOut}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={onDeleteAccount} style={styles.deleteAccountLink}>
              <Text style={styles.deleteAccountText}>{t.deleteAccount}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* SIGNED OUT VIEW */
          <View style={styles.signedOutContent}>
            {/* Mode Switcher */}
            <View style={styles.modeTabs}>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'signUp' && styles.modeTabActive]}
                onPress={() => {
                  setMode('signUp');
                  setError('');
                  setInfo('');
                }}
              >
                <Text style={[styles.modeTabText, mode === 'signUp' && styles.modeTabTextActive]}>
                  {t.createFarmerAccount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeTab, mode === 'signIn' && styles.modeTabActive]}
                onPress={() => {
                  setMode('signIn');
                  setError('');
                  setInfo('');
                }}
              >
                <Text style={[styles.modeTabText, mode === 'signIn' && styles.modeTabTextActive]}>
                  {t.signIn}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Fields: Name & Village */}
            {mode === 'signUp' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t.farmerName}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={17} color={MUTED} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t.farmerNamePlaceholderInput}
                      placeholderTextColor="#94A3B8"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t.villageOrFarm}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="home-outline" size={17} color={MUTED} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t.villageOrFarmPlaceholder}
                      placeholderTextColor="#94A3B8"
                      value={village}
                      onChangeText={setVillage}
                    />
                  </View>
                </View>
              </>
            )}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.emailField}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={17} color={MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder={t.emailPlaceholder}
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.passwordField}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={17} color={MUTED} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { paddingRight: 40 }]}
                  placeholder={t.passwordPlaceholder}
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordEyeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={MUTED}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Feedback Messages */}
            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={DANGER} style={{ marginRight: 6 }} />
                <Text style={styles.errorBoxText}>{error}</Text>
              </View>
            )}

            {!!info && (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={16} color={GREEN} style={{ marginRight: 6 }} />
                <Text style={styles.infoBoxText}>{info}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryActionBtn, { marginTop: 12 }, busy && styles.btnDisabled]}
              onPress={handleSubmitAuth}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={mode === 'signUp' ? 'person-add-outline' : 'log-in-outline'}
                    size={18}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.primaryActionBtnText}>
                    {mode === 'signUp' ? t.createFarmerAccount : t.signIn}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Forgot Password for Sign In */}
            {mode === 'signIn' && (
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordBtn}>
                <Text style={styles.forgotPasswordText}>{t.forgotPassword}</Text>
              </TouchableOpacity>
            )}

            {/* Offline SQLite Reassurance Note */}
            <View style={styles.reassuranceCard}>
              <Ionicons name="shield-checkmark" size={20} color={GREEN} style={styles.reassuranceIcon} />
              <Text style={styles.reassuranceText}>{t.offlineNotice}</Text>
            </View>
          </View>
        )}
      </View>

      {/* 2. Notifications & Farm Reminders Card */}
      <View style={[styles.card, { marginTop: 14 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="notifications-outline" size={22} color={GREEN} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.cardTitle}>{t.notificationsTitle}</Text>
            <Text style={styles.cardSubtitle}>{t.notificationsSubtitle}</Text>
          </View>
        </View>

        {/* Daily 7:00 PM Diary Reminder Toggle */}
        <View style={styles.reminderRow}>
          <View style={styles.reminderTextWrap}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="alarm-outline" size={18} color={GREEN} />
              <Text style={styles.reminderTitle}>{t.dailyReminder}</Text>
            </View>
            <Text style={styles.reminderSubtitle}>{t.dailyReminderSubtitle}</Text>
          </View>
          <Switch
            value={dailyReminder}
            onValueChange={handleToggleDailyReminder}
            trackColor={{ false: '#CBD5E1', true: '#81C784' }}
            thumbColor={dailyReminder ? GREEN : '#F1F5F9'}
          />
        </View>

        {/* Alarm Tone Picker & Preview Banner */}
        <View style={styles.alarmToneBanner}>
          <View style={styles.alarmToneHeader}>
            <Ionicons name="musical-notes-outline" size={18} color={GREEN} style={{ marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alarmToneTitle}>{t.alarmToneTitle}</Text>
              <Text style={styles.alarmToneSubtitle}>{t.alarmToneSubtitle}</Text>
            </View>
          </View>
          <View style={styles.alarmToneBtnRow}>
            <TouchableOpacity
              style={styles.chooseToneBtn}
              onPress={handleChooseAlarmTone}
              activeOpacity={0.85}
            >
              <Ionicons name="settings-outline" size={15} color="#FFFFFF" />
              <Text style={styles.chooseToneBtnText}>{t.chooseAlarmTone}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.previewToneBtn, previewingTone && styles.btnDisabled]}
              onPress={handlePreviewAlarmTone}
              disabled={previewingTone}
              activeOpacity={0.85}
            >
              <Ionicons name="volume-high-outline" size={15} color={GREEN} />
              <Text style={styles.previewToneBtnText}>{t.previewAlarmTone}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Morning Weather & Spray Alert (6:30 AM) Toggle */}
        <View style={styles.reminderRow}>
          <View style={styles.reminderTextWrap}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="sunny-outline" size={18} color={GREEN} />
              <Text style={styles.reminderTitle}>{t.morningWeatherAlert}</Text>
            </View>
            <Text style={styles.reminderSubtitle}>{t.morningWeatherAlertSubtitle}</Text>
          </View>
          <Switch
            value={morningWeatherAlert}
            onValueChange={handleToggleMorningWeatherAlert}
            trackColor={{ false: '#CBD5E1', true: '#81C784' }}
            thumbColor={morningWeatherAlert ? GREEN : '#F1F5F9'}
          />
        </View>

        <View style={styles.divider} />

        {/* Crop Stage Milestone Morning Alerts Info */}
        <View style={styles.milestoneNoticeRow}>
          <Ionicons name="calendar-outline" size={18} color={GREEN} style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={styles.milestoneNoticeText}>{t.cropMilestonesActive}</Text>
        </View>

        {notifStatus ? (
          <View style={styles.notifStatusWrap}>
            <Text style={[styles.notifStatusText, { color: notifStatusError ? DANGER : GREEN }]}>
              {notifStatus}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
  },
  cardSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
    lineHeight: 16,
    flexWrap: 'wrap',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Signed In
  signedInContent: {
    width: '100%',
  },
  farmerProfileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_GREEN,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  farmerAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    flexShrink: 0,
  },
  farmerDetails: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  farmerNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  farmerEmailText: {
    fontSize: 13,
    color: MUTED,
    flexShrink: 1,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verificationBadgeOk: {
    backgroundColor: '#DCFCE7',
  },
  verificationBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  verificationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  verificationBadgeTextOk: {
    color: '#15803D',
  },
  verificationBadgeTextPending: {
    color: '#B45309',
  },
  resendLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: GREEN,
    textDecorationLine: 'underline',
  },
  syncStatusBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  syncStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncStatusTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: INK,
    flexShrink: 1,
  },
  badgePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    flexShrink: 0,
  },
  badgePillError: {
    backgroundColor: '#FEE2E2',
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  badgePillTextError: {
    color: '#B91C1C',
  },
  syncTimestampText: {
    fontSize: 12,
    color: MUTED,
    marginTop: 6,
  },
  syncErrorMessage: {
    fontSize: 12,
    color: DANGER,
    marginTop: 4,
    fontWeight: '500',
  },
  buttonActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  primaryActionBtn: {
    flex: 1,
    minWidth: 130,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryActionBtn: {
    flex: 1,
    minWidth: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  secondaryActionBtnText: {
    color: INK,
    fontWeight: '600',
    fontSize: 14,
  },
  deleteAccountLink: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 4,
  },
  deleteAccountText: {
    fontSize: 13,
    color: '#94A3B8',
    textDecorationLine: 'underline',
  },
  // Signed Out
  signedOutContent: {
    width: '100%',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: MUTED,
  },
  modeTabTextActive: {
    color: GREEN,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: INK,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
    color: INK,
  },
  passwordEyeBtn: {
    padding: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  errorBoxText: {
    color: DANGER,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    flexWrap: 'wrap',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  infoBoxText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    flexWrap: 'wrap',
  },
  forgotPasswordBtn: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: GREEN,
    fontWeight: '600',
  },
  reassuranceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: LIGHT_GREEN,
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  reassuranceIcon: {
    marginRight: 8,
    marginTop: 2,
    flexShrink: 0,
  },
  reassuranceText: {
    fontSize: 12,
    color: '#2E7D32',
    lineHeight: 17,
    flex: 1,
    flexWrap: 'wrap',
  },
  // Notifications
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  reminderTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
  },
  reminderSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 3,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  milestoneNoticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  milestoneNoticeText: {
    fontSize: 12,
    color: MUTED,
    lineHeight: 17,
    flex: 1,
    flexWrap: 'wrap',
  },
  alarmToneBanner: {
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  alarmToneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  alarmToneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E20',
  },
  alarmToneSubtitle: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 2,
    lineHeight: 16,
  },
  alarmToneBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  chooseToneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GREEN,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chooseToneBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  previewToneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A5D6A7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  previewToneBtnText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '700',
  },
  notifStatusWrap: {
    marginTop: 10,
  },
  notifStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: GREEN,
    flexWrap: 'wrap',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
