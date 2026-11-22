import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { BackupCounts, BackupData } from '../db/backupRepo';
import { Workspace } from '../db/workspacesRepo';
import { useAuth } from '../hooks/useAuth';
import { useSync } from '../hooks/useSync';
import { useFarmProfile } from '../hooks/useFarmProfile';
import { Copy, Language, languages } from '../i18n/copy';
import { shared } from '../styles/shared';
import { AccountSection } from './AccountSection';
import { BackupSection } from './BackupSection';
import { WorkspaceSection } from './WorkspaceSection';

export function MoreScreen({
  t, lg, language, onLanguageChange, auth, sync, onSignIn, onSignOutConfirm, onDeleteAccount, backup,
  workspaces, activeWorkspaceId, onSwitchWorkspace, onCreateWorkspace, onUpdateWorkspace, onDeleteWorkspace,
  onError, onConfirmRestore, db, profile,
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
  db?: SQLite.SQLiteDatabase | null;
  profile?: ReturnType<typeof useFarmProfile>;
}) {
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
      <BackupSection t={t} backup={backup} onError={onError} onConfirmRestore={onConfirmRestore} />
    </>
  );
}
