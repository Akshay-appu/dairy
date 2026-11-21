import {
  collection, doc, getDoc, getDocs, setDoc, type Firestore,
} from 'firebase/firestore';
import * as SQLite from 'expo-sqlite';
import { uuidv4 } from '../utils/uuid';
import { enqueueSyncMutation, processSyncQueue } from './syncQueue';

export { processSyncQueue, enqueueSyncMutation };

export type RefColumn = { localColumn: string; refTable: string };

export type EntitySyncConfig = {
  table: string;
  collection: string;
  columns: string[];
  refColumns?: RefColumn[];
};

type SqlValue = string | number | null;

async function resolveLocalIdToUuid(db: SQLite.SQLiteDatabase, table: string, localId: SqlValue, workspaceId: string): Promise<string | null> {
  if (localId === null || localId === undefined) return null;
  const row = await db.getFirstAsync<{ uuid: string }>(`SELECT uuid FROM ${table} WHERE id = ? AND workspaceId = ?`, localId, workspaceId);
  return row?.uuid ?? null;
}

async function resolveUuidToLocalId(db: SQLite.SQLiteDatabase, table: string, uuid: unknown, ownerId: string, workspaceId: string): Promise<number | null> {
  if (typeof uuid !== 'string' || !uuid) return null;
  const row = await db.getFirstAsync<{ id: number }>(`SELECT id FROM ${table} WHERE uuid = ? AND (userId IS ?) AND workspaceId = ?`, uuid, ownerId, workspaceId);
  return row?.id ?? null;
}

export async function pushEntity(
  db: SQLite.SQLiteDatabase, firestore: Firestore, ownerId: string, workspaceId: string, config: EntitySyncConfig
): Promise<number> {
  const pending = await db.getAllAsync<Record<string, SqlValue>>(
    `SELECT * FROM ${config.table} WHERE (userId IS ?) AND workspaceId = ? AND (lastSyncedAt IS NULL OR updatedAt > lastSyncedAt)`,
    ownerId, workspaceId
  );
  const now = new Date().toISOString();
  for (const row of pending) {
    const data: Record<string, unknown> = {
      updatedAt: row.updatedAt, deletedAt: row.deletedAt ?? null, createdAt: row.createdAt ?? null,
    };
    for (const col of config.columns) data[col] = row[col];
    for (const ref of config.refColumns ?? []) {
      data[`${ref.localColumn}Uuid`] = await resolveLocalIdToUuid(db, ref.refTable, row[ref.localColumn] as SqlValue, workspaceId);
    }
    const docUuid = (row.uuid as string) ?? uuidv4();
    try {
      await setDoc(doc(firestore, `users/${ownerId}/workspaces/${workspaceId}/${config.collection}/${docUuid}`), data, { merge: true });
      await db.runAsync(`UPDATE ${config.table} SET lastSyncedAt = ?, uuid = COALESCE(uuid, ?) WHERE id = ?`, now, docUuid, row.id as number);
    } catch {
      await enqueueSyncMutation(db, workspaceId, config.table, config.collection, docUuid, data, ownerId);
    }
  }
  return pending.length;
}

export async function pullEntity(
  db: SQLite.SQLiteDatabase, firestore: Firestore, ownerId: string, workspaceId: string, config: EntitySyncConfig
): Promise<number> {
  const snap = await getDocs(collection(firestore, `users/${ownerId}/workspaces/${workspaceId}/${config.collection}`));
  const now = new Date().toISOString();
  let applied = 0;

  for (const docSnap of snap.docs) {
    const remote = docSnap.data();
    const remoteUpdatedAt = String(remote.updatedAt ?? '');
    const existing = await db.getFirstAsync<{ id: number; updatedAt: string }>(
      `SELECT id, updatedAt FROM ${config.table} WHERE uuid = ? AND (userId IS ?) AND workspaceId = ?`, docSnap.id, ownerId, workspaceId
    );

    if (existing) {
      if (existing.updatedAt >= remoteUpdatedAt) {
        if (existing.updatedAt === remoteUpdatedAt) {
          await db.runAsync(`UPDATE ${config.table} SET lastSyncedAt = ? WHERE id = ?`, now, existing.id);
        }
        continue;
      }
    }

    const refs: Record<string, number | null> = {};
    for (const ref of config.refColumns ?? []) {
      refs[ref.localColumn] = await resolveUuidToLocalId(db, ref.refTable, remote[`${ref.localColumn}Uuid`], ownerId, workspaceId);
    }

    const setColumns = ['updatedAt', 'deletedAt', ...config.columns, ...Object.keys(refs)];
    const setValues: SqlValue[] = [
      remoteUpdatedAt, (remote.deletedAt as SqlValue) ?? null,
      ...config.columns.map(c => (remote[c] as SqlValue) ?? null),
      ...Object.values(refs),
    ];

    if (existing) {
      await db.runAsync(
        `UPDATE ${config.table} SET ${setColumns.map(c => `${c} = ?`).join(', ')}, lastSyncedAt = ? WHERE id = ?`,
        ...setValues, now, existing.id
      );
    } else {
      const insertColumns = ['uuid', 'userId', 'workspaceId', 'lastSyncedAt', 'createdAt', ...setColumns];
      const insertValues: SqlValue[] = [
        docSnap.id, ownerId, workspaceId, now, (remote.createdAt as SqlValue) ?? remoteUpdatedAt, ...setValues,
      ];
      await db.runAsync(
        `INSERT INTO ${config.table} (${insertColumns.join(', ')}) VALUES (${insertColumns.map(() => '?').join(', ')})`,
        ...insertValues
      );
    }
    applied += 1;
  }
  return applied;
}

export const PLOTS_SYNC: EntitySyncConfig = {
  table: 'plots', collection: 'plots', columns: ['name', 'area', 'areaUnit', 'notes'],
};
export const CROPS_SYNC: EntitySyncConfig = {
  table: 'crops', collection: 'crops',
  columns: ['cropName', 'season', 'sowingDate', 'expectedHarvestDate'],
  refColumns: [{ localColumn: 'plotId', refTable: 'plots' }],
};
export const ACTIVITIES_SYNC: EntitySyncConfig = {
  table: 'diary_entries', collection: 'activities', columns: ['title', 'category', 'note'],
  refColumns: [{ localColumn: 'plotId', refTable: 'plots' }, { localColumn: 'cropId', refTable: 'crops' }],
};
export const FINANCE_SYNC: EntitySyncConfig = {
  table: 'finance_entries', collection: 'financeEntries', columns: ['type', 'amount', 'category', 'date', 'notes'],
};
export const HARVESTS_SYNC: EntitySyncConfig = {
  table: 'harvests', collection: 'harvests',
  columns: ['harvestDate', 'quantity', 'quantityUnit', 'sellingPrice', 'buyer', 'notes'],
  refColumns: [{ localColumn: 'plotId', refTable: 'plots' }, { localColumn: 'cropId', refTable: 'crops' }],
};

export const ALL_ENTITY_SYNC_CONFIGS: EntitySyncConfig[] = [
  PLOTS_SYNC, CROPS_SYNC, ACTIVITIES_SYNC, FINANCE_SYNC, HARVESTS_SYNC,
];

export async function pushWorkspaces(db: SQLite.SQLiteDatabase, firestore: Firestore, ownerId: string): Promise<number> {
  const pending = await db.getAllAsync<Record<string, SqlValue>>(
    `SELECT * FROM workspaces WHERE (userId IS ?) AND (deletedAt IS NULL) AND (lastSyncedAt IS NULL OR updatedAt > lastSyncedAt)`,
    ownerId
  );
  const now = new Date().toISOString();
  for (const row of pending) {
    const wsUuid = (row.uuid as string) ?? (row.id === 'default' ? 'default' : uuidv4());
    const data = {
      name: row.name,
      isDefault: row.isDefault,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    };
    try {
      await setDoc(doc(firestore, `users/${ownerId}/workspaces/${wsUuid}`), data, { merge: true });
      await db.runAsync(`UPDATE workspaces SET lastSyncedAt = ?, uuid = COALESCE(uuid, ?) WHERE id = ?`, now, wsUuid, row.id as string);
    } catch {
      await enqueueSyncMutation(db, wsUuid, 'workspaces', 'workspaces', wsUuid, data, ownerId);
    }
  }
  return pending.length;
}

export async function pullWorkspaces(db: SQLite.SQLiteDatabase, firestore: Firestore, ownerId: string): Promise<number> {
  const snap = await getDocs(collection(firestore, `users/${ownerId}/workspaces`));
  const now = new Date().toISOString();
  let applied = 0;

  for (const docSnap of snap.docs) {
    const remote = docSnap.data();
    const remoteUpdatedAt = String(remote.updatedAt ?? '');
    const wsUuid = docSnap.id;
    const existing = await db.getFirstAsync<{ id: string; updatedAt: string }>(
      `SELECT id, updatedAt FROM workspaces WHERE uuid = ? OR id = ?`, wsUuid, wsUuid
    );

    if (existing) {
      if (existing.updatedAt >= remoteUpdatedAt) {
        if (existing.updatedAt === remoteUpdatedAt) {
          await db.runAsync(`UPDATE workspaces SET lastSyncedAt = ? WHERE id = ?`, now, existing.id);
        }
        continue;
      }
      await db.runAsync(
        `UPDATE workspaces SET name = ?, isDefault = ?, updatedAt = ?, deletedAt = ?, lastSyncedAt = ?, userId = ? WHERE id = ?`,
        remote.name, remote.isDefault ?? 0, remoteUpdatedAt, remote.deletedAt ?? null, now, ownerId, existing.id
      );
    } else {
      await db.runAsync(
        `INSERT INTO workspaces (id, name, isDefault, createdAt, updatedAt, userId, uuid, deletedAt, lastSyncedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        wsUuid, remote.name, remote.isDefault ?? 0, remote.createdAt ?? remoteUpdatedAt, remoteUpdatedAt, ownerId, wsUuid, remote.deletedAt ?? null, now
      );
    }
    applied += 1;
  }
  return applied;
}

export async function pushProfile(db: SQLite.SQLiteDatabase, firestore: Firestore, ownerId: string, workspaceId: string): Promise<boolean> {
  const row = await db.getFirstAsync<Record<string, SqlValue>>(
    'SELECT * FROM farm_profile WHERE id = 1 AND (userId IS ?) AND workspaceId = ? AND (lastSyncedAt IS NULL OR updatedAt > lastSyncedAt)',
    ownerId, workspaceId
  );
  if (!row) return false;
  const now = new Date().toISOString();
  const data = {
    farmName: row.farmName, farmerName: row.farmerName, village: row.village, district: row.district,
    state: row.state, totalArea: row.totalArea, areaUnit: row.areaUnit, updatedAt: row.updatedAt,
  };
  try {
    await setDoc(doc(firestore, `users/${ownerId}/workspaces/${workspaceId}/meta/profile`), data);
    await db.runAsync('UPDATE farm_profile SET lastSyncedAt = ? WHERE id = 1 AND workspaceId = ?', now, workspaceId);
    return true;
  } catch {
    await enqueueSyncMutation(db, workspaceId, 'farm_profile', 'meta/profile', workspaceId, data, ownerId);
    return false;
  }
}

export async function pullProfile(db: SQLite.SQLiteDatabase, firestore: Firestore, ownerId: string, workspaceId: string): Promise<boolean> {
  const snap = await getDoc(doc(firestore, `users/${ownerId}/workspaces/${workspaceId}/meta/profile`));
  if (!snap.exists()) return false;
  const remote = snap.data();
  const remoteUpdatedAt = String(remote.updatedAt ?? '');
  const now = new Date().toISOString();
  const existing = await db.getFirstAsync<{ updatedAt: string }>(
    'SELECT updatedAt FROM farm_profile WHERE id = 1 AND (userId IS ?) AND workspaceId = ?', ownerId, workspaceId
  );
  if (existing && existing.updatedAt >= remoteUpdatedAt) {
    if (existing.updatedAt === remoteUpdatedAt) {
      await db.runAsync('UPDATE farm_profile SET lastSyncedAt = ? WHERE id = 1 AND workspaceId = ?', now, workspaceId);
    }
    return false;
  }
  await db.runAsync(
    `INSERT INTO farm_profile (id, farmName, farmerName, village, district, state, totalArea, areaUnit, updatedAt, userId, workspaceId, lastSyncedAt)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET farmName=excluded.farmName, farmerName=excluded.farmerName, village=excluded.village,
       district=excluded.district, state=excluded.state, totalArea=excluded.totalArea, areaUnit=excluded.areaUnit,
       updatedAt=excluded.updatedAt, userId=excluded.userId, workspaceId=excluded.workspaceId, lastSyncedAt=excluded.lastSyncedAt`,
    remote.farmName, remote.farmerName, remote.village, remote.district, remote.state,
    remote.totalArea, remote.areaUnit, remoteUpdatedAt, ownerId, workspaceId, now
  );
  return true;
}
