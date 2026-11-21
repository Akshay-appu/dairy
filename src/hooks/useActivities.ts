import * as SQLite from 'expo-sqlite';
import * as activitiesRepo from '../db/activitiesRepo';
import { Entry } from '../db/schema';
import { useEntityList } from './useEntityList';

export function useActivities(db: SQLite.SQLiteDatabase | null, ready: boolean, ownerId: string | null, workspaceId: string = 'default') {
  const { items, loading, add, update, remove, refresh } = useEntityList<Entry, activitiesRepo.ActivityInput>(
    db, ready, ownerId,
    {
      list: activitiesRepo.listEntries,
      add: activitiesRepo.addEntry,
      update: activitiesRepo.updateEntry,
      remove: activitiesRepo.deleteEntry,
    },
    workspaceId
  );
  return { entries: items, loading, add, update, remove, refresh };
}
