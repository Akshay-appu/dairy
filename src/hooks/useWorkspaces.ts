import * as SQLite from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import * as workspacesRepo from '../db/workspacesRepo';
import { Workspace, WorkspaceInput } from '../db/workspacesRepo';

export function useWorkspaces(db: SQLite.SQLiteDatabase | null, ready: boolean, ownerId: string | null) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('default');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!db) return;
    const list = await workspacesRepo.listWorkspaces(db, ownerId);
    setWorkspaces(list);
    if (list.length > 0 && !list.some(w => w.id === activeWorkspaceId)) {
      setActiveWorkspaceId('default');
    }
  }, [db, ownerId, activeWorkspaceId]);

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    (async () => {
      if (!db) {
        if (alive) setLoading(false);
        return;
      }
      try {
        const list = await workspacesRepo.listWorkspaces(db, ownerId);
        if (alive) {
          setWorkspaces(list);
          if (list.length > 0 && !list.some(w => w.id === activeWorkspaceId)) {
            setActiveWorkspaceId('default');
          }
          setLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load workspaces:', err);
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [db, ready, ownerId, activeWorkspaceId]);

  const createWorkspace = useCallback(async (input: WorkspaceInput) => {
    if (!db) return;
    const newId = await workspacesRepo.addWorkspace(db, input, ownerId);
    await refresh();
    setActiveWorkspaceId(newId);
  }, [db, ownerId, refresh]);

  const updateWorkspace = useCallback(async (id: string, name: string) => {
    if (!db) return;
    await workspacesRepo.updateWorkspace(db, id, name, ownerId);
    await refresh();
  }, [db, ownerId, refresh]);

  const deleteWorkspace = useCallback(async (id: string) => {
    if (!db || id === 'default') return;
    await workspacesRepo.deleteWorkspace(db, id, ownerId);
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId('default');
    }
    await refresh();
  }, [db, ownerId, activeWorkspaceId, refresh]);

  const switchWorkspace = useCallback((id: string) => {
    setActiveWorkspaceId(id);
  }, []);

  return {
    workspaces,
    activeWorkspaceId,
    loading,
    switchWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    refresh,
  };
}
