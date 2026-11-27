import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { BackupCounts, BackupData } from '../db/backupRepo';
import { Workspace } from '../db/workspacesRepo';
import { useAuth } from '../hooks/useAuth';
import { useSync } from '../hooks/useSync';
import { useFarmProfile } from '../hooks/useFarmProfile';
import { Copy, Language, languages } from '../i18n/copy';
import type { GoogleDriveController } from '../services/googleDriveAuth';
import { shared } from '../styles/shared';
import { GREEN, INK, LIGHT_GREEN, MUTED } from '../theme';
import { copyToClipboard, shareTextMessage } from '../utils/share';
import { AccountSection } from './AccountSection';
import { BackupSection } from './BackupSection';
import { WorkspaceSection } from './WorkspaceSection';

export function MoreScreen({
  t, lg, language, onLanguageChange, auth, sync, onSignIn, onSignOutConfirm, onDeleteAccount, backup,
  workspaces, activeWorkspaceId, onSwitchWorkspace, onCreateWorkspace, onUpdateWorkspace, onDeleteWorkspace,
  onError, onConfirmRestore, onOpenExport, db, ownerId, profile, drive,
}: {
  t: Copy;
  lg: boolean;
  language: Language;
  onLanguageChange: (next: Language) => void;
  auth: ReturnType<typeof useAuth>;
  sync: ReturnType<typeof useSync>;
  onSignIn: () => void;
  onSignOutConfirm: () => void;
  onDeleteAccount: () => void;
  backup: {
    exportBackup: () => Promise<string>;
    previewRestore: (text: string) => { data: BackupData; counts: BackupCounts };
  };
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSwitchWorkspace: (id: string) => void;
  onCreateWorkspace: (input: { name: string }) => Promise<void>;
  onUpdateWorkspace: (id: string, name: string) => Promise<void>;
  onDeleteWorkspace: (id: string) => Promise<void>;
  onError: (message: string) => void;
  onConfirmRestore: (data: BackupData) => void;
  onOpenExport: () => void;
  db?: SQLite.SQLiteDatabase | null;
  ownerId?: string | null;
  profile?: ReturnType<typeof useFarmProfile>;
  drive?: GoogleDriveController;
}) {
  const [shareFeedback, setShareFeedback] = useState('');

  const handleShareApp = async () => {
    setShareFeedback('');
    try {
      const outcome = await shareTextMessage(t.shareAppTitle, t.shareAppMessage);
      if (outcome === 'copied') {
        setShareFeedback(t.shareAppCopied);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : t.exportErrorGeneric);
    }
  };

  const handleCopyInvite = async () => {
    setShareFeedback('');
    try {
      const ok = await copyToClipboard(t.shareAppMessage);
      if (ok) {
        setShareFeedback(t.shareAppCopied);
      } else {
        await handleShareApp();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : t.exportErrorGeneric);
    }
  };

  return (
    <>
      <Text style={[shared.pageTitle, lg && shared.pageTitleLg]}>{t.more}</Text>
      <Text style={[shared.pageSubtitle, lg && shared.pageSubtitleLg]}>{t.settingsSubtitle}</Text>

      <AccountSection
        t={t} language={language} auth={auth} sync={sync}
        onSignIn={onSignIn} onSignOutConfirm={onSignOutConfirm} onDeleteAccount={onDeleteAccount}
        db={db} profile={profile}
      />

      <WorkspaceSection
        t={t}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSwitch={onSwitchWorkspace}
        onCreate={onCreateWorkspace}
        onUpdate={onUpdateWorkspace}
        onDelete={onDeleteWorkspace}
        onError={onError}
      />

      <Text style={shared.fieldLabel}>{t.language}</Text>
      {(['en', 'kn', 'hi'] as Language[]).map(lang => (
        <TouchableOpacity
          key={lang}
          style={[shared.selectRow, language === lang && shared.selectRowSelected]}
          onPress={() => onLanguageChange(lang)}
        >
          <Text style={shared.selectRowText}>{languages[lang]}</Text>
          <Text style={shared.selectRowCheck}>{language === lang ? '✓' : ''}</Text>
        </TouchableOpacity>
      ))}
      <View style={shared.tipCard}>
        <Text style={shared.tipTitle}>{t.privacyTitle}</Text>
        <Text style={shared.tipText}>{t.privacyText}</Text>
      </View>

      {/* Shareable BS Diary App Card */}
      <View style={styles.shareCard}>
        <View style={styles.shareHeaderRow}>
          <View style={styles.shareIconBadge}>
            <Ionicons name="share-social-outline" size={20} color={GREEN} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.shareTitle}>{t.shareAppTitle}</Text>
            <Text style={styles.shareSubtitle}>{t.shareAppSubtitle}</Text>
          </View>
        </View>
        <View style={styles.shareUrlsRow}>
          <View style={styles.urlChip}>
            <Ionicons name="phone-portrait-outline" size={13} color={GREEN} />
            <Text style={styles.urlChipText}>app.bhoomishakti.in</Text>
          </View>
          <View style={styles.urlChip}>
            <Ionicons name="globe-outline" size={13} color={GREEN} />
            <Text style={styles.urlChipText}>www.bhoomishakti.in</Text>
          </View>
        </View>
        <View style={styles.shareActionsRow}>
          <View style={{ flex: 1, minWidth: 150 }}>
            <PrimaryButton
              icon={<Ionicons name="share-social-outline" size={16} color="#FFFFFF" />}
              label={t.shareAppBtn}
              onPress={() => void handleShareApp()}
            />
          </View>
          {Platform.OS === 'web' && (
            <View style={{ flex: 1, minWidth: 130 }}>
              <SecondaryButton
                icon={<Ionicons name="copy-outline" size={15} color={GREEN} />}
                label={t.shareAppCopyBtn}
                onPress={() => void handleCopyInvite()}
              />
            </View>
          )}
        </View>
        {!!shareFeedback && (
          <View style={styles.shareToast}>
            <Ionicons name="checkmark-circle-outline" size={15} color={GREEN} />
            <Text style={styles.shareToastText}>{shareFeedback}</Text>
          </View>
        )}
      </View>

      <BackupSection
        t={t}
        language={language}
        backup={backup}
        db={db}
        ownerId={ownerId}
        activeWorkspaceId={activeWorkspaceId}
        drive={drive}
        onOpenExport={onOpenExport}
        onError={onError}
        onConfirmRestore={onConfirmRestore}
      />
    </>
  );
}

const styles = StyleSheet.create({
  shareCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E7D9',
    borderRadius: 16,
    padding: 15,
    marginTop: 14,
    marginBottom: 4,
    gap: 10,
  },
  shareHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  shareIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
  },
  shareSubtitle: {
    fontSize: 12,
    color: MUTED,
    lineHeight: 17,
    marginTop: 2,
  },
  shareUrlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  urlChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F4FAF5',
    borderWidth: 1,
    borderColor: '#DCECE0',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  urlChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
  },
  shareActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shareToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: LIGHT_GREEN,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  shareToastText: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
  },
});
