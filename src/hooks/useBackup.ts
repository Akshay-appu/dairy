import * as SQLite from 'expo-sqlite';
import { useCallback } from 'react';
import * as backupRepo from '../db/backupRepo';

export function useBackup(db: SQLite.SQLiteDatabase | null, ownerId: string | null, workspaceId: string = 'default') {
  const exportBackup = useCallback(async (): Promise<string> => {
    if (!db) throw new Error('Local storage is still initializing.');
    const data = await backupRepo.buildBackup(db, ownerId, workspaceId);
    return JSON.stringify(data, null, 2);
  }, [db, ownerId, workspaceId]);

  const previewRestore = useCallback((text: string): { data: backupRepo.BackupData; counts: backupRepo.BackupCounts } => {
    const data = backupRepo.parseBackup(text);
    return { data, counts: backupRepo.countBackup(data) };
  }, []);

  const restore = useCallback(async (data: backupRepo.BackupData): Promise<void> => {
    if (!db) throw new Error('Local storage is still initializing.');
    await backupRepo.restoreBackup(db, data, ownerId, workspaceId);
  }, [db, ownerId, workspaceId]);

  return { exportBackup, previewRestore, restore };
}
