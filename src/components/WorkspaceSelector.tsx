import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { PrimaryButton } from './Buttons';
import { Workspace } from '../db/workspacesRepo';
import { Copy } from '../i18n/copy';
import { shared } from '../styles/shared';
import { WorkspaceFormModal } from '../screens/WorkspaceFormModal';

export function WorkspaceSelector({
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
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);

  return (
    <View style={shared.tipCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={shared.sectionTitle}>{t.workspaces}</Text>
        <View>
          <PrimaryButton
            label={t.addWorkspace}
            onPress={() => setCreateModalVisible(true)}
          />
        </View>
      </View>
      <Text style={shared.tipText}>{t.workspacesSubtitle}</Text>

      <View style={{ marginTop: 14, gap: 8 }}>
        {workspaces.map(ws => {
          const isActive = ws.id === activeWorkspaceId;
          const isDefaultWorkspace = ws.id === 'default' || ws.isDefault === 1;
          return (
            <View key={ws.id} style={[shared.selectRow, isActive && shared.selectRowSelected]}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => onSwitch(ws.id)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[shared.selectRowText, isActive && { fontWeight: 'bold' }]}>
                      {ws.name} {isDefaultWorkspace ? `(${t.defaultWorkspaceName} / Legacy Guest)` : ''}
                    </Text>
                    <Text style={shared.statNote}>
                      {isDefaultWorkspace ? 'Legacy offline guest workspace' : 'Local custom workspace'}
                    </Text>
                  </View>
                  <Text style={shared.selectRowCheck}>{isActive ? '✓ Active' : ''}</Text>
                </View>
              </TouchableOpacity>
              {!isDefaultWorkspace && (
                <View style={{ flexDirection: 'row', marginLeft: 8, gap: 4 }}>
                  <TouchableOpacity
                    onPress={() => setEditingWorkspace(ws)}
                    style={{ padding: 6 }}
                  >
                    <Text style={{ color: '#2563eb', fontSize: 13, fontWeight: '700' }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onDelete(ws.id)}
                    style={{ padding: 6 }}
                  >
                    <Text style={{ color: '#dc2626', fontSize: 13, fontWeight: '700' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <WorkspaceFormModal
        visible={createModalVisible}
        title={t.addWorkspace}
        t={t}
        onSave={async (name) => {
          try {
            await onCreate({ name });
          } catch (err) {
            onError(err instanceof Error ? err.message : String(err));
          }
        }}
        onClose={() => setCreateModalVisible(false)}
      />

      {editingWorkspace && (
        <WorkspaceFormModal
          visible={true}
          initialName={editingWorkspace.name}
          title={t.editWorkspace}
          t={t}
          onSave={async (name) => {
            try {
              await onUpdate(editingWorkspace.id, name);
              setEditingWorkspace(null);
            } catch (err) {
              onError(err instanceof Error ? err.message : String(err));
            }
          }}
          onClose={() => setEditingWorkspace(null)}
        />
      )}
    </View>
  );
}
