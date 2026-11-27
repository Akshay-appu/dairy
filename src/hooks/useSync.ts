import * as SQLite from 'expo-sqlite';
import {
  useCallback, useEffect, useRef, useState, type MutableRefObject,
} from 'react';
import { Platform } from 'react-native';
import { db as firestore } from '../firebase/config';
import {
  ALL_ENTITY_SYNC_CONFIGS, pullEntity, pullProfile, pullWorkspaces, pushEntity, pushProfile, pushWorkspaces, processSyncQueue,
} from '../firebase/sync';
import * as workspacesRepo from '../db/workspacesRepo';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

const FOREGROUND_SYNC_INTERVAL_MS = 2 * 60 * 1000;

export function useSync(
  db: SQLite.SQLiteDatabase | null, ownerId: string | null, onSynced: () => Promise<void>,
  pausedRef: MutableRefObject<boolean>
) {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const syncingRef = useRef(false);

  const syncNow = useCallback(async () => {
    if (!db || !ownerId) return;
    if (!firestore) return;
    if (pausedRef.current) return;
    if (syncingRef.current) return;
    syncingRef.current = true;
    setStatus('syncing');
    setErrorMessage('');
    try {
      // Process any queued offline mutations first
      await processSyncQueue(db, firestore, ownerId);

      await pushWorkspaces(db, firestore, ownerId);
      await pullWorkspaces(db, firestore, ownerId);

      const workspaces = await workspacesRepo.listWorkspaces(db, ownerId);
      const workspaceIds = workspaces.map(w => w.uuid ?? w.id);

      for (const wsId of workspaceIds) {
        for (const config of ALL_ENTITY_SYNC_CONFIGS) {
          await pushEntity(db, firestore, ownerId, wsId, config);
        }
        await pushProfile(db, firestore, ownerId, wsId);
        for (const config of ALL_ENTITY_SYNC_CONFIGS) {
          await pullEntity(db, firestore, ownerId, wsId, config);
        }
        await pullProfile(db, firestore, ownerId, wsId);
      }

      if (typeof onSynced === 'function') {
        await onSynced();
      }
      setStatus('success');
      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      syncingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, ownerId]);

  useEffect(() => {
    if (!db || !ownerId) return;
    const timer = setTimeout(() => {
      void syncNow();
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, ownerId]);

  useEffect(() => {
    if (!ownerId) return;
    const interval = setInterval(() => { void syncNow(); }, FOREGROUND_SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [ownerId, syncNow]);

  // Automatically retry and sync when connection is restored (Web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    const handleOnline = () => {
      void syncNow();
    };
    try {
      window.addEventListener('online', handleOnline);
      return () => {
        try {
          window.removeEventListener?.('online', handleOnline);
        } catch (e) {
          console.warn('Error removing online listener:', e);
        }
      };
    } catch (e) {
      console.warn('Error adding online listener:', e);
    }
  }, [syncNow]);

  return {
    status, lastSyncedAt, errorMessage, syncNow,
    syncingRef,
  };
}
