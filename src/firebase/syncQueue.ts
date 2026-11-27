import * as SQLite from 'expo-sqlite';
import { doc, setDoc, type Firestore } from 'firebase/firestore';

export async function ensureSyncQueueTable(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspaceId TEXT NOT NULL,
      tableName TEXT NOT NULL,
      collection TEXT NOT NULL,
      recordUuid TEXT NOT NULL,
      payload TEXT NOT NULL,
      userId TEXT,
      createdAt TEXT NOT NULL,
      retryCount INTEGER NOT NULL DEFAULT 0
    );
  `);
}

export async function enqueueSyncMutation(
  db: SQLite.SQLiteDatabase,
  workspaceId: string,
  tableName: string,
  collection: string,
  recordUuid: string,
  payload: Record<string, unknown>,
  userId: string | null
): Promise<void> {
  await ensureSyncQueueTable(db);
  const now = new Date().toISOString();
  const payloadStr = JSON.stringify(payload);
  const existing = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM sync_queue WHERE workspaceId = ? AND collection = ? AND recordUuid = ?`,
    workspaceId, collection, recordUuid
  );
  if (existing) {
    await db.runAsync(
      `UPDATE sync_queue SET payload = ?, createdAt = ? WHERE id = ?`,
      payloadStr, now, existing.id
    );
  } else {
    await db.runAsync(
      `INSERT INTO sync_queue (workspaceId, tableName, collection, recordUuid, payload, userId, createdAt, retryCount) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      workspaceId, tableName, collection, recordUuid, payloadStr, userId, now
    );
  }
}

export async function processSyncQueue(
  db: SQLite.SQLiteDatabase,
  firestore: Firestore,
  ownerId: string
): Promise<number> {
  await ensureSyncQueueTable(db);
  const queued = await db.getAllAsync<{
    id: number;
    workspaceId: string;
    tableName: string;
    collection: string;
    recordUuid: string;
    payload: string;
    userId: string | null;
    retryCount: number;
  }>(
    `SELECT * FROM sync_queue WHERE (userId IS ? OR userId IS NULL)`,
    ownerId
  );

  let processedCount = 0;
  for (const item of queued) {
    try {
      const data = JSON.parse(item.payload) as Record<string, unknown>;
      await setDoc(
        doc(firestore, `users/${ownerId}/workspaces/${item.workspaceId}/${item.collection}/${item.recordUuid}`),
        data,
        { merge: true }
      );
      await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, item.id);
      try {
        const now = new Date().toISOString();
        if (item.tableName === 'farm_profile') {
          await db.runAsync(
            "UPDATE farm_profile SET lastSyncedAt = ? WHERE workspaceId = ? AND COALESCE(userId, '') = COALESCE(?, '')",
            now, item.workspaceId, item.userId
          );
        } else {
          await db.runAsync(
            `UPDATE ${item.tableName} SET lastSyncedAt = ? WHERE uuid = ? AND workspaceId = ?`,
            now, item.recordUuid, item.workspaceId
          );
        }
      } catch {
        // Non-fatal table update error
      }
      processedCount++;
    } catch {
      await db.runAsync(
        `UPDATE sync_queue SET retryCount = retryCount + 1 WHERE id = ?`,
        item.id
      );
    }
  }
  return processedCount;
}
