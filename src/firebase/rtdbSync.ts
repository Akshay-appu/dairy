import { ref, set, get, type Database } from 'firebase/database';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export type RtdbSyncResult = {
  success: boolean;
  activitiesCount: number;
  cropSchedulesCount: number;
  vaultItemsCount: number;
  timestamp: string;
  error?: string;
};

export async function syncToRealtimeDatabase(
  db: SQLite.SQLiteDatabase,
  rtdb: Database | null,
  ownerId: string
): Promise<RtdbSyncResult> {
  const now = new Date().toISOString();

  if (!rtdb) {
    return {
      success: false,
      activitiesCount: 0,
      cropSchedulesCount: 0,
      vaultItemsCount: 0,
      timestamp: now,
      error: 'Realtime Database not configured',
    };
  }

  try {
    // 1. Fetch local SQLite records
    const activities = await db.getAllAsync<Record<string, unknown>>(
      'SELECT id, title, category, note, createdAt, updatedAt, plotId, cropId, workspaceId FROM diary_entries WHERE (deletedAt IS NULL)'
    ).catch(() => []);

    const cropSchedules = await db.getAllAsync<Record<string, unknown>>(
      'SELECT id, workspaceId, cropName, sowingDate, createdAt FROM crop_schedules'
    ).catch(() => []);

    const vaultDocs = await db.getAllAsync<Record<string, unknown>>(
      'SELECT id, workspaceId, title, category, capturedAt FROM vault_documents'
    ).catch(() => []);

    const plots = await db.getAllAsync<Record<string, unknown>>(
      'SELECT id, name, area, areaUnit, notes, workspaceId FROM plots WHERE (deletedAt IS NULL)'
    ).catch(() => []);

    const crops = await db.getAllAsync<Record<string, unknown>>(
      'SELECT id, cropName, season, plotId, sowingDate, expectedHarvestDate, workspaceId FROM crops WHERE (deletedAt IS NULL)'
    ).catch(() => []);

    const profile = await db.getFirstAsync<Record<string, unknown>>(
      "SELECT farmName, farmerName, village, taluk, district, state, totalArea, areaUnit FROM farm_profile WHERE workspaceId = 'default' ORDER BY id ASC LIMIT 1"
    ).catch(() => null);

    const finance = await db.getAllAsync<Record<string, unknown>>(
      'SELECT id, type, amount, category, date, notes, workspaceId FROM finance_entries WHERE (deletedAt IS NULL)'
    ).catch(() => []);

    const harvests = await db.getAllAsync<Record<string, unknown>>(
      'SELECT id, cropId, plotId, harvestDate, quantity, quantityUnit, sellingPrice, buyer, notes, workspaceId FROM harvests WHERE (deletedAt IS NULL)'
    ).catch(() => []);

    const workspaces = await db.getAllAsync<Record<string, unknown>>(
      'SELECT id, name, isDefault, createdAt, updatedAt FROM workspaces WHERE (deletedAt IS NULL)'
    ).catch(() => []);

    // 2. Format as key-value objects for Realtime Database
    const activitiesMap: Record<string, unknown> = {};
    for (const item of activities) {
      activitiesMap[String(item.id)] = item;
    }

    const cropSchedulesMap: Record<string, unknown> = {};
    for (const item of cropSchedules) {
      cropSchedulesMap[String(item.id)] = item;
    }

    const vaultMetadataMap: Record<string, unknown> = {};
    for (const item of vaultDocs) {
      vaultMetadataMap[String(item.id)] = item;
    }

    const plotsMap: Record<string, unknown> = {};
    for (const item of plots) {
      plotsMap[String(item.id)] = item;
    }

    const cropsMap: Record<string, unknown> = {};
    for (const item of crops) {
      cropsMap[String(item.id)] = item;
    }

    const financeMap: Record<string, unknown> = {};
    for (const item of finance) {
      financeMap[String(item.id)] = item;
    }

    const harvestsMap: Record<string, unknown> = {};
    for (const item of harvests) {
      harvestsMap[String(item.id)] = item;
    }

    const workspacesMap: Record<string, unknown> = {};
    for (const item of workspaces) {
      workspacesMap[String(item.id)] = item;
    }

    const syncPayload = {
      profile: profile || {},
      activities: activitiesMap,
      cropSchedules: cropSchedulesMap,
      vaultMetadata: vaultMetadataMap,
      plots: plotsMap,
      crops: cropsMap,
      finance: financeMap,
      harvests: harvestsMap,
      workspaces: workspacesMap,
      syncMeta: {
        lastSyncedAt: now,
        platform: Platform.OS,
        appVersion: '1.0.0',
      },
    };

    // 3. Push to Realtime Database under users/{uid}
    const userDbRef = ref(rtdb, `users/${ownerId}`);
    await set(userDbRef, syncPayload);

    // 4. Update lastSyncedAt in local SQLite tables
    await db.runAsync('UPDATE diary_entries SET lastSyncedAt = ? WHERE (deletedAt IS NULL)', now).catch(() => {});
    await db.runAsync('UPDATE plots SET lastSyncedAt = ? WHERE (deletedAt IS NULL)', now).catch(() => {});
    await db.runAsync('UPDATE crops SET lastSyncedAt = ? WHERE (deletedAt IS NULL)', now).catch(() => {});
    await db.runAsync("UPDATE farm_profile SET lastSyncedAt = ? WHERE workspaceId = 'default'", now).catch(() => {});

    return {
      success: true,
      activitiesCount: activities.length,
      cropSchedulesCount: cropSchedules.length,
      vaultItemsCount: vaultDocs.length,
      timestamp: now,
    };
  } catch (err) {
    console.warn('Realtime Database push sync error:', err);
    return {
      success: false,
      activitiesCount: 0,
      cropSchedulesCount: 0,
      vaultItemsCount: 0,
      timestamp: now,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function pullFromRealtimeDatabase(
  db: SQLite.SQLiteDatabase,
  rtdb: Database | null,
  ownerId: string
): Promise<boolean> {
  if (!rtdb) return false;
  try {
    const userDbRef = ref(rtdb, `users/${ownerId}`);
    const snapshot = await get(userDbRef);
    if (!snapshot.exists()) return false;

    const data = snapshot.val() as Record<string, any>;
    if (!data) return false;

    // Pull crop schedules if present
    if (data.cropSchedules && typeof data.cropSchedules === 'object') {
      for (const key of Object.keys(data.cropSchedules)) {
        const sch = data.cropSchedules[key];
        if (sch && sch.id && sch.cropName) {
          await db.runAsync(
            `INSERT INTO crop_schedules (id, workspaceId, cropName, sowingDate, createdAt)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               workspaceId = excluded.workspaceId,
               cropName = excluded.cropName,
               sowingDate = excluded.sowingDate`,
            String(sch.id),
            String(sch.workspaceId || 'default'),
            String(sch.cropName),
            String(sch.sowingDate || ''),
            String(sch.createdAt || new Date().toISOString())
          ).catch(() => {});
        }
      }
    }

    // Pull profile if present
    if (data.profile && typeof data.profile === 'object') {
      const p = data.profile;
      if (p.farmerName || p.farmName || p.village) {
        const nowIso = new Date().toISOString();
        const existingProfile = await db.getFirstAsync<{ id: number }>(
          "SELECT id FROM farm_profile WHERE workspaceId = 'default' AND COALESCE(userId, '') = COALESCE(?, '')",
          ownerId
        ).catch(() => null);

        if (existingProfile) {
          await db.runAsync(
            `UPDATE farm_profile SET
               farmName = COALESCE(NULLIF(?, ''), farmName),
               farmerName = COALESCE(NULLIF(?, ''), farmerName),
               village = COALESCE(NULLIF(?, ''), village),
               taluk = COALESCE(NULLIF(?, ''), taluk),
               district = COALESCE(NULLIF(?, ''), district),
               state = COALESCE(NULLIF(?, ''), state),
               totalArea = COALESCE(?, totalArea),
               areaUnit = COALESCE(NULLIF(?, ''), areaUnit),
               updatedAt = ?
             WHERE id = ?`,
            p.farmName || '',
            p.farmerName || '',
            p.village || '',
            p.taluk || '',
            p.district || '',
            p.state || '',
            p.totalArea ?? null,
            p.areaUnit || 'acres',
            nowIso,
            existingProfile.id
          ).catch(() => {});
        } else {
          await db.runAsync(
            `INSERT INTO farm_profile (farmName, farmerName, village, taluk, district, state, totalArea, areaUnit, updatedAt, userId, workspaceId)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'default')`,
            p.farmName || '',
            p.farmerName || '',
            p.village || '',
            p.taluk || '',
            p.district || '',
            p.state || '',
            p.totalArea ?? null,
            p.areaUnit || 'acres',
            nowIso,
            ownerId
          ).catch(() => {});
        }
      }
    }

    return true;
  } catch (err) {
    console.warn('Realtime Database pull error:', err);
    return false;
  }
}
