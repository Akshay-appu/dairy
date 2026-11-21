import React from 'react';
import { Text, View } from 'react-native';
import { WorkspaceSelector } from '../components/WorkspaceSelector';
import { Workspace } from '../db/workspacesRepo';
import { Copy } from '../i18n/copy';
import { shared } from '../styles/shared';

export function WorkspaceScreen({
  t,
  lg,
  workspaces,
  activeWorkspaceId,
  onSwitch,
  onCreate,
  onUpdate,
  onDelete,
  onError,
}: {
  t: Copy;
  lg: boolean;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSwitch: (id: string) => void;
  onCreate: (input: { name: string }) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onError: (msg: string) => void;
}) {
  return (
    <View style={{ width: '100%' }}>
      <Text style={[shared.pageTitle, lg && shared.pageTitleLg]}>{t.workspaces}</Text>
      <Text style={[shared.pageSubtitle, lg && shared.pageSubtitleLg]}>{t.workspacesSubtitle}</Text>

      <WorkspaceSelector
        t={t}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSwitch={onSwitch}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onError={onError}
      />
    </View>
  );
}
