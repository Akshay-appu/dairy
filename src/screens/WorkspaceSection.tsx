import React from 'react';
import { WorkspaceSelector } from '../components/WorkspaceSelector';
import { Workspace } from '../db/workspacesRepo';
import { Copy } from '../i18n/copy';

export function WorkspaceSection({
  t,
  workspaces,
  activeWorkspaceId,
  onSwitch,
  onCreate,
  onUpdate,
  onDelete,
  onError,
}: {
  t: Copy;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSwitch: (id: string) => void;
  onCreate: (input: { name: string }) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onError: (msg: string) => void;
}) {
  return (
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
  );
}
