import * as SQLite from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import * as profileRepo from '../db/profileRepo';
import { ProfileInput } from '../db/profileRepo';
import { FarmProfile } from '../db/schema';

export function useFarmProfile(db: SQLite.SQLiteDatabase | null, ready: boolean, ownerId: string | null, workspaceId: string = 'default') {
  const [profile, setProfile] = useState<FarmProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    (async () => {
      if (!db) {
        if (alive) setLoading(false);
        return;
      }
      const row = await profileRepo.getProfile(db, ownerId, workspaceId);
      if (alive) {
        setProfile(row);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [db, ready, ownerId, workspaceId]);

  const save = useCallback(async (input: ProfileInput) => {
    if (!db) return;
    await profileRepo.saveProfile(db, input, ownerId, workspaceId);
    setProfile(await profileRepo.getProfile(db, ownerId, workspaceId));
  }, [db, ownerId, workspaceId]);

  const refresh = useCallback(async () => {
    if (!db) return;
    setProfile(await profileRepo.getProfile(db, ownerId, workspaceId));
  }, [db, ownerId, workspaceId]);

  return { profile, loading, save, refresh };
}
