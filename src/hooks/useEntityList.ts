import * as SQLite from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

export function useEntityList<T extends { id: number }, Input>(
  db: SQLite.SQLiteDatabase | null,
  ready: boolean,
  ownerId: string | null,
  repo: {
    list: (db: SQLite.SQLiteDatabase, ownerId: string | null, workspaceId: string) => Promise<T[]>;
    add: (db: SQLite.SQLiteDatabase, input: Input, ownerId: string | null, workspaceId: string) => Promise<void>;
    update: (db: SQLite.SQLiteDatabase, id: number, input: Input, ownerId: string | null, workspaceId: string) => Promise<void>;
    remove: (db: SQLite.SQLiteDatabase, id: number, ownerId: string | null, workspaceId: string) => Promise<void>;
  },
  workspaceId: string = 'default'
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!db) return;
    setItems(await repo.list(db, ownerId, workspaceId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, ownerId, workspaceId]);

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    (async () => {
      if (!db) {
        if (alive) setLoading(false);
        return;
      }
      const rows = await repo.list(db, ownerId, workspaceId);
      if (alive) {
        setItems(rows);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, ready, ownerId, workspaceId]);

  const add = useCallback(async (input: Input) => {
    if (!db) return;
    await repo.add(db, input, ownerId, workspaceId);
    await refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, ownerId, workspaceId, refresh]);

  const update = useCallback(async (id: number, input: Input) => {
    if (!db) return;
    await repo.update(db, id, input, ownerId, workspaceId);
    await refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, ownerId, workspaceId, refresh]);

  const remove = useCallback(async (id: number) => {
    if (!db) return;
    await repo.remove(db, id, ownerId, workspaceId);
    await refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, ownerId, workspaceId, refresh]);

  return { items, loading, add, update, remove, refresh };
}
