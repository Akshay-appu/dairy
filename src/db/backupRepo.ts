import * as SQLite from 'expo-sqlite';
import { Crop, Entry, FarmProfile, FinanceEntry, Harvest, Plot } from './schema';
import { uuidv4 } from '../utils/uuid';

export const BACKUP_FORMAT = 'bhoomishakti-backup';
export const BACKUP_VERSION = 1;

export type BackupData = {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  farmProfile: FarmProfile | null;
  plots: Plot[];
  crops: Crop[];
  diaryEntries: Entry[];
  financeEntries: FinanceEntry[];
  harvests: Harvest[];
};

export type BackupCounts = {
  farmProfile: number;
  plots: number;
  crops: number;
  diaryEntries: number;
  financeEntries: number;
  harvests: number;
};

export function countBackup(data: BackupData): BackupCounts {
  return {
    farmProfile: data.farmProfile ? 1 : 0,
    plots: data.plots.length,
    crops: data.crops.length,
    diaryEntries: data.diaryEntries.length,
    financeEntries: data.financeEntries.length,
    harvests: data.harvests.length,
  };
}

// Scoped to the active owner and workspace — a backup never includes another local
// account's or workspace's data.
export async function buildBackup(db: SQLite.SQLiteDatabase, ownerId: string | null, workspaceId: string = 'default'): Promise<BackupData> {
  const [farmProfile, plots, crops, diaryEntries, financeEntries, harvests] = await Promise.all([
    db.getFirstAsync<FarmProfile>('SELECT * FROM farm_profile WHERE id = 1 AND (userId IS ?) AND workspaceId = ?', ownerId, workspaceId),
    db.getAllAsync<Plot>('SELECT * FROM plots WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?', ownerId, workspaceId),
    db.getAllAsync<Crop>('SELECT * FROM crops WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?', ownerId, workspaceId),
    db.getAllAsync<Entry>('SELECT * FROM diary_entries WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?', ownerId, workspaceId),
    db.getAllAsync<FinanceEntry>('SELECT * FROM finance_entries WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?', ownerId, workspaceId),
    db.getAllAsync<Harvest>('SELECT * FROM harvests WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?', ownerId, workspaceId),
  ]);
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    farmProfile: farmProfile ?? null,
    plots, crops, diaryEntries, financeEntries, harvests,
  };
}

// Validates shape only (not exhaustively) before anything touches the DB.
export function parseBackup(text: string): BackupData {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('invalid-json');
  }
  if (
    typeof json !== 'object' || json === null ||
    (json as Record<string, unknown>).format !== BACKUP_FORMAT ||
    !Array.isArray((json as Record<string, unknown>).plots) ||
    !Array.isArray((json as Record<string, unknown>).crops) ||
    !Array.isArray((json as Record<string, unknown>).diaryEntries) ||
    !Array.isArray((json as Record<string, unknown>).financeEntries) ||
    !Array.isArray((json as Record<string, unknown>).harvests)
  ) {
    throw new Error('invalid-shape');
  }
  return json as BackupData;
}

// Replaces only the *active owner's and workspace's* rows with the backup's contents, inside
// one transaction (all-or-nothing).
export async function restoreBackup(db: SQLite.SQLiteDatabase, data: BackupData, ownerId: string | null, workspaceId: string = 'default'): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM harvests WHERE (userId IS ?) AND workspaceId = ?', ownerId, workspaceId);
    await db.runAsync('DELETE FROM finance_entries WHERE (userId IS ?) AND workspaceId = ?', ownerId, workspaceId);
    await db.runAsync('DELETE FROM diary_entries WHERE (userId IS ?) AND workspaceId = ?', ownerId, workspaceId);
    await db.runAsync('DELETE FROM crops WHERE (userId IS ?) AND workspaceId = ?', ownerId, workspaceId);
    await db.runAsync('DELETE FROM plots WHERE (userId IS ?) AND workspaceId = ?', ownerId, workspaceId);
    await db.runAsync('DELETE FROM farm_profile WHERE id = 1 AND (userId IS ?) AND workspaceId = ?', ownerId, workspaceId);

    if (data.farmProfile) {
      const p = data.farmProfile;
      const result = await db.runAsync(
        `UPDATE farm_profile SET farmName = ?, farmerName = ?, village = ?, district = ?, state = ?,
           totalArea = ?, areaUnit = ?, updatedAt = ?, userId = ? WHERE id = 1 AND workspaceId = ?`,
        p.farmName, p.farmerName, p.village, p.district, p.state, p.totalArea, p.areaUnit, p.updatedAt, ownerId, workspaceId
      );
      if (result.changes === 0) {
        await db.runAsync(
          `INSERT INTO farm_profile (id, farmName, farmerName, village, district, state, totalArea, areaUnit, updatedAt, userId, workspaceId)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          p.farmName, p.farmerName, p.village, p.district, p.state, p.totalArea, p.areaUnit, p.updatedAt, ownerId, workspaceId
        );
      }
    }

    const plotIdMap = new Map<number, number>();
    for (const plot of data.plots) {
      const result = await db.runAsync(
        'INSERT INTO plots (name, area, areaUnit, notes, createdAt, updatedAt, uuid, userId, workspaceId, deletedAt, lastSyncedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)',
        plot.name, plot.area, plot.areaUnit, plot.notes, plot.createdAt, plot.updatedAt, plot.uuid ?? uuidv4(), ownerId, workspaceId
      );
      plotIdMap.set(plot.id, result.lastInsertRowId);
    }

    const cropIdMap = new Map<number, number>();
    for (const crop of data.crops) {
      const mappedPlotId = crop.plotId !== null ? (plotIdMap.get(crop.plotId) ?? null) : null;
      const result = await db.runAsync(
        `INSERT INTO crops (cropName, season, plotId, sowingDate, expectedHarvestDate, createdAt, updatedAt, uuid, userId, workspaceId, deletedAt, lastSyncedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
        crop.cropName, crop.season, mappedPlotId, crop.sowingDate, crop.expectedHarvestDate, crop.createdAt, crop.updatedAt, crop.uuid ?? uuidv4(), ownerId, workspaceId
      );
      cropIdMap.set(crop.id, result.lastInsertRowId);
    }

    for (const entry of data.diaryEntries) {
      const mappedPlotId = entry.plotId !== null ? (plotIdMap.get(entry.plotId) ?? null) : null;
      const mappedCropId = entry.cropId !== null ? (cropIdMap.get(entry.cropId) ?? null) : null;
      await db.runAsync(
        `INSERT INTO diary_entries (title, category, note, createdAt, updatedAt, plotId, cropId, uuid, userId, workspaceId, deletedAt, lastSyncedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
        entry.title, entry.category, entry.note, entry.createdAt, entry.updatedAt, mappedPlotId, mappedCropId, entry.uuid ?? uuidv4(), ownerId, workspaceId
      );
    }
    for (const fin of data.financeEntries) {
      await db.runAsync(
        'INSERT INTO finance_entries (type, amount, category, date, notes, createdAt, updatedAt, uuid, userId, workspaceId, deletedAt, lastSyncedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)',
        fin.type, fin.amount, fin.category, fin.date, fin.notes, fin.createdAt, fin.updatedAt, fin.uuid ?? uuidv4(), ownerId, workspaceId
      );
    }
    for (const h of data.harvests) {
      const mappedPlotId = h.plotId !== null ? (plotIdMap.get(h.plotId) ?? null) : null;
      const mappedCropId = h.cropId !== null ? (cropIdMap.get(h.cropId) ?? null) : null;
      await db.runAsync(
        `INSERT INTO harvests (cropId, plotId, harvestDate, quantity, quantityUnit, sellingPrice, buyer, notes, createdAt, updatedAt, uuid, userId, workspaceId, deletedAt, lastSyncedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
        mappedCropId, mappedPlotId, h.harvestDate, h.quantity, h.quantityUnit, h.sellingPrice, h.buyer, h.notes, h.createdAt, h.updatedAt, h.uuid ?? uuidv4(), ownerId, workspaceId
      );
    }
  });
}
