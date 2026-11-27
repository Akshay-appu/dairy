import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import { DangerButton, PrimaryButton, SecondaryButton } from '../components/Buttons';
import { BackupCounts, BackupData } from '../db/backupRepo';
import { Copy, Language } from '../i18n/copy';
import type { GoogleDriveController } from '../services/googleDriveAuth';
import {
  backupAllWorkspacesToDrive,
  downloadDriveBackupForPreview,
  DriveBackupPreview,
  driveErrorCopyKey,
} from '../services/googleDriveSync';
import { shared } from '../styles/shared';
import { DANGER, GREEN, INK, LIGHT_GREEN, MUTED } from '../theme';
import { formatLongDate } from '../utils/format';

export function BackupSection({
  t,
  language = 'en',
  backup,
  db,
  ownerId = null,
  activeWorkspaceId = 'default',
  drive,
  onOpenExport,
  onError,
  onConfirmRestore,
}: {
  t: Copy;
  language?: Language;
  backup: {
    previewRestore: (text: string) => { data: BackupData; counts: BackupCounts };
  };
  db?: SQLite.SQLiteDatabase | null;
  ownerId?: string | null;
  activeWorkspaceId?: string;
  drive?: GoogleDriveController;
  onOpenExport: () => void;
  onError: (message: string) => void;
  onConfirmRestore: (data: BackupData) => void;
}) {
  const [pasted, setPasted] = useState('');
  const [preview, setPreview] = useState<{ data: BackupData; counts: BackupCounts } | null>(null);

  // Google Drive BYOC state
  const [driveBusy, setDriveBusy] = useState<'connect' | 'backup' | 'restore' | null>(null);
  const [driveInfo, setDriveInfo] = useState('');
  const [driveError, setDriveError] = useState('');
  const [drivePreview, setDrivePreview] = useState<DriveBackupPreview | null>(null);

  const locale = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

  const handlePreview = () => {
    try {
      setPreview(backup.previewRestore(pasted));
    } catch {
      onError(t.invalidBackupFile);
      setPreview(null);
    }
  };

  const handleDriveConnect = async () => {
    if (!drive) return;
    setDriveBusy('connect');
    setDriveInfo('');
    setDriveError('');
    try {
      await drive.connect();
    } catch (err) {
      setDriveError(t[driveErrorCopyKey(err)]);
    } finally {
      setDriveBusy(null);
    }
  };

  const handleDriveBackupNow = async () => {
    if (!drive || !db) return;
    setDriveBusy('backup');
    setDriveInfo('');
    setDriveError('');
    setDrivePreview(null);
    try {
      const token = drive.getValidAccessToken() ?? (await drive.connect());
      const res = await backupAllWorkspacesToDrive(db, ownerId, token, activeWorkspaceId);
      await drive.recordBackupTimestamp(res.exportedAt);
      setDriveInfo(t.driveBackupSuccess.replace('{count}', String(res.workspacesBackedUp)));
    } catch (err) {
      setDriveError(t[driveErrorCopyKey(err)]);
    } finally {
      setDriveBusy(null);
    }
  };

  const handleDrivePreviewRestore = async () => {
    if (!drive || !db) return;
    setDriveBusy('restore');
    setDriveInfo('');
    setDriveError('');
    setDrivePreview(null);
    try {
      const token = drive.getValidAccessToken() ?? (await drive.connect());
      const fetched = await downloadDriveBackupForPreview(db, ownerId, activeWorkspaceId, token);
      setDrivePreview(fetched);
    } catch (err) {
      setDriveError(t[driveErrorCopyKey(err)]);
    } finally {
      setDriveBusy(null);
    }
  };

  return (
    <>
      {drive && (
        <View style={[shared.tipCard, styles.driveCard]}>
          <View style={styles.driveHeaderRow}>
            <View style={styles.driveIconCircle}>
              <Ionicons name="logo-google" size={20} color={GREEN} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.driveTitleRow}>
                <Text style={[shared.tipTitle, { flexShrink: 1 }]}>{t.driveCardTitle}</Text>
                {drive.isConnected && (
                  <View style={styles.connectedPill}>
                    <Ionicons name="checkmark-circle" size={12} color="#15803D" />
                    <Text style={styles.connectedPillText}>{t.driveConnectedBadge}</Text>
                  </View>
                )}
              </View>
              <Text style={[shared.tipText, { marginTop: 3 }]}>{t.driveCardSubtitle}</Text>
            </View>
          </View>

          <View style={styles.driveMetaBox}>
            <Text style={styles.driveMetaText}>
              {drive.isConnected
                ? `${t.driveConnectedAs}${drive.connectedEmail ? ` (${drive.connectedEmail})` : ''}`
                : t.driveErrorNotConnected}
            </Text>
            <Text style={styles.driveMetaSub}>
              {drive.lastBackupAt
                ? `${t.driveLastBackup}: ${formatLongDate(drive.lastBackupAt, locale)}`
                : t.driveNeverBackedUp}
            </Text>
          </View>

          {!drive.isConnected ? (
            <TouchableOpacity
              onPress={() => void handleDriveConnect()}
              disabled={driveBusy !== null || drive.connecting}
              style={[styles.drivePrimaryBtn, (driveBusy !== null || drive.connecting) && styles.btnDisabled]}
            >
              {driveBusy === 'connect' || drive.connecting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.drivePrimaryBtnText}>{t.driveConnectBtn}</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.driveActionStack}>
              <TouchableOpacity
                onPress={() => void handleDriveBackupNow()}
                disabled={driveBusy !== null}
                style={[styles.drivePrimaryBtn, driveBusy !== null && styles.btnDisabled]}
              >
                {driveBusy === 'backup' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                )}
                <Text style={styles.drivePrimaryBtnText}>
                  {driveBusy === 'backup' ? t.driveBackingUp : t.driveBackupNowBtn}
                </Text>
              </TouchableOpacity>

              <View style={styles.driveSecondaryRow}>
                <TouchableOpacity
                  onPress={() => void handleDrivePreviewRestore()}
                  disabled={driveBusy !== null}
                  style={[styles.driveSecondaryBtn, { flex: 1 }, driveBusy !== null && styles.btnDisabled]}
                >
                  {driveBusy === 'restore' ? (
                    <ActivityIndicator size="small" color={GREEN} />
                  ) : (
                    <Ionicons name="cloud-download-outline" size={16} color={GREEN} />
                  )}
                  <Text style={styles.driveSecondaryBtnText}>
                    {driveBusy === 'restore' ? t.driveCheckingBackup : t.driveRestoreBtn}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    drive.disconnect();
                    setDrivePreview(null);
                    setDriveInfo('');
                    setDriveError('');
                  }}
                  disabled={driveBusy !== null}
                  style={styles.driveDisconnectBtn}
                >
                  <Text style={styles.driveDisconnectText}>{t.driveDisconnectBtn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!!driveInfo && (
            <View style={styles.driveInfoBox}>
              <Ionicons name="checkmark-circle" size={16} color={GREEN} />
              <Text style={styles.driveInfoText}>{driveInfo}</Text>
            </View>
          )}

          {!!driveError && (
            <View style={styles.driveErrorBox}>
              <Ionicons name="alert-circle" size={16} color={DANGER} />
              <Text style={styles.driveErrorText}>{driveError}</Text>
            </View>
          )}

          {drivePreview && (
            <View style={styles.drivePreviewCard}>
              <Text style={[shared.fieldLabel, { marginTop: 0 }]}>{t.recordsFoundInBackup}</Text>
              {!!drivePreview.exportedAt && (
                <Text style={styles.driveMetaSub}>
                  {t.driveLastBackup}: {formatLongDate(drivePreview.exportedAt, locale)}
                </Text>
              )}
              <Text style={shared.tipText}>
                {t.plotsTab}: {drivePreview.counts.plots} · {t.cropsTab}: {drivePreview.counts.crops} · {t.activities}: {drivePreview.counts.diaryEntries} · {t.expenses}/{t.income}: {drivePreview.counts.financeEntries} · {t.harvestsTab}: {drivePreview.counts.harvests} · {t.marketTab}: {drivePreview.counts.marketRecords}
              </Text>
              {drivePreview.isLocalNewer && (
                <View style={styles.driveWarnBox}>
                  <Ionicons name="warning-outline" size={15} color="#92400E" />
                  <Text style={styles.driveWarnText}>{t.driveRestoreNewerWarning}</Text>
                </View>
              )}
              <DangerButton
                label={t.confirmRestore}
                onPress={() => {
                  onConfirmRestore(drivePreview.data);
                  setDrivePreview(null);
                }}
              />
            </View>
          )}
        </View>
      )}

      <View style={shared.tipCard}>
        <Text style={shared.tipTitle}>{t.backupRestore}</Text>

        <Text style={[shared.tipText, { marginTop: 10 }]}>{t.exportDescription}</Text>
        <PrimaryButton label={t.shareBackup} onPress={onOpenExport} />

        <Text style={[shared.tipText, { marginTop: 18 }]}>{t.restoreDescription}</Text>
        <TextInput
          value={pasted}
          onChangeText={text => { setPasted(text); setPreview(null); }}
          placeholder={t.pasteBackupPlaceholder}
          style={[shared.input, shared.notesInput, { minHeight: 100 }]}
          multiline
          textAlignVertical="top"
        />
        <SecondaryButton label={t.previewRestore} onPress={handlePreview} />

        {preview && (
          <View style={{ marginTop: 10 }}>
            <Text style={shared.fieldLabel}>{t.recordsFoundInBackup}</Text>
            <Text style={shared.tipText}>
              {t.plotsTab}: {preview.counts.plots} · {t.cropsTab}: {preview.counts.crops} · {t.activities}: {preview.counts.diaryEntries} · {t.expenses}/{t.income}: {preview.counts.financeEntries} · {t.harvestsTab}: {preview.counts.harvests} · {t.marketTab}: {preview.counts.marketRecords}
            </Text>
            <DangerButton label={t.confirmRestore} onPress={() => onConfirmRestore(preview.data)} />
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  driveCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C8E6C9',
  },
  driveHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  driveIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  driveTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  connectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  connectedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  driveMetaBox: {
    backgroundColor: '#F5FAF6',
    borderWidth: 1,
    borderColor: '#DCE8DE',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  driveMetaText: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
  },
  driveMetaSub: {
    fontSize: 11,
    color: MUTED,
    marginTop: 3,
  },
  driveActionStack: {
    marginTop: 10,
    gap: 8,
  },
  drivePrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  drivePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  driveSecondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  driveSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFD8C4',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  driveSecondaryBtnText: {
    color: GREEN,
    fontSize: 13,
    fontWeight: '800',
  },
  driveDisconnectBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
  },
  driveDisconnectText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
  },
  driveInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: LIGHT_GREEN,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  driveInfoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
  },
  driveErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  driveErrorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: DANGER,
  },
  drivePreviewCard: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FAFDFB',
    borderWidth: 1,
    borderColor: '#D5E8D9',
    borderRadius: 12,
  },
  driveWarnBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  driveWarnText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  btnDisabled: {
    opacity: 0.65,
  },
});
