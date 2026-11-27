import * as SQLite from 'expo-sqlite';
import {
  Crop,
  CropSchedule,
  Entry,
  FarmProfile,
  FinanceEntry,
  Harvest,
  MarketRecord,
  Plot,
  VaultDocument,
} from './schema';
import { listCropSchedules } from './cropSchedulesRepo';
import { listMarketRecords } from './marketRecordsRepo';
import { getProfile } from './profileRepo';
import { listVaultDocuments } from './vaultRepo';
import { uuidv4 } from '../utils/uuid';

export const BACKUP_FORMAT = 'bhoomishakti-backup';
export const BACKUP_VERSION = 2;

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
  marketRecords: MarketRecord[];
  cropSchedules: CropSchedule[];
  vaultDocuments: VaultDocument[];
};

export type BackupCounts = {
  farmProfile: number;
  plots: number;
  crops: number;
  diaryEntries: number;
  financeEntries: number;
  harvests: number;
  marketRecords: number;
  cropSchedules: number;
  vaultDocuments: number;
};

export function countBackup(data: BackupData): BackupCounts {
  return {
    farmProfile: data.farmProfile ? 1 : 0,
    plots: data.plots.length,
    crops: data.crops.length,
    diaryEntries: data.diaryEntries.length,
    financeEntries: data.financeEntries.length,
    harvests: data.harvests.length,
    marketRecords: (data.marketRecords ?? []).length,
    cropSchedules: (data.cropSchedules ?? []).length,
    vaultDocuments: (data.vaultDocuments ?? []).length,
  };
}

// Scoped to the active owner and workspace — a backup never includes another local
// account's or workspace's data.
export async function buildBackup(db: SQLite.SQLiteDatabase, ownerId: string | null, workspaceId: string = 'default'): Promise<BackupData> {
  const [
    farmProfile,
    plots,
    crops,
    diaryEntries,
    financeEntries,
    harvests,
    marketRecords,
    cropSchedules,
    vaultDocuments,
  ] = await Promise.all([
    getProfile(db, ownerId, workspaceId),
    db.getAllAsync<Plot>('SELECT * FROM plots WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?', ownerId, workspaceId),
    db.getAllAsync<Crop>('SELECT * FROM crops WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?', ownerId, workspaceId),
    db.getAllAsync<Entry>('SELECT * FROM diary_entries WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?', ownerId, workspaceId),
    db.getAllAsync<FinanceEntry>('SELECT * FROM finance_entries WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?', ownerId, workspaceId),
    db.getAllAsync<Harvest>('SELECT * FROM harvests WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?', ownerId, workspaceId),
    listMarketRecords(db, ownerId, workspaceId),
    listCropSchedules(db, workspaceId),
    listVaultDocuments(db, workspaceId),
  ]);
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    farmProfile: farmProfile ?? null,
    plots,
    crops,
    diaryEntries,
    financeEntries,
    harvests,
    marketRecords,
    cropSchedules,
    vaultDocuments,
  };
}

// Validates shape only (not exhaustively) before anything touches the DB.
// Backward-compatible with v1 backups where marketRecords, cropSchedules, and
// vaultDocuments were not present (defaults them to empty arrays).
export function parseBackup(text: string): BackupData {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('invalid-json');
  }
  const obj = json as Record<string, unknown>;
  if (
    typeof json !== 'object' || json === null ||
    obj.format !== BACKUP_FORMAT ||
    !Array.isArray(obj.plots) ||
    !Array.isArray(obj.crops) ||
    !Array.isArray(obj.diaryEntries) ||
    !Array.isArray(obj.financeEntries) ||
    !Array.isArray(obj.harvests) ||
    (obj.marketRecords !== undefined && !Array.isArray(obj.marketRecords)) ||
    (obj.cropSchedules !== undefined && !Array.isArray(obj.cropSchedules)) ||
    (obj.vaultDocuments !== undefined && !Array.isArray(obj.vaultDocuments))
  ) {
    throw new Error('invalid-shape');
  }
  return {
    ...(obj as BackupData),
    marketRecords: Array.isArray(obj.marketRecords) ? (obj.marketRecords as MarketRecord[]) : [],
    cropSchedules: Array.isArray(obj.cropSchedules) ? (obj.cropSchedules as CropSchedule[]) : [],
    vaultDocuments: Array.isArray(obj.vaultDocuments) ? (obj.vaultDocuments as VaultDocument[]) : [],
  };
}

// Replaces only the *active owner's and workspace's* rows with the backup's contents, inside
// one transaction (all-or-nothing).
export async function restoreBackup(db: SQLite.SQLiteDatabase, data: BackupData, ownerId: string | null, workspaceId: string = 'default'): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'DELETE FROM market_vegetable_items WHERE recordId IN (SELECT id FROM market_records WHERE (userId IS ?) AND workspaceId = ?)',
      ownerId, workspaceId
    );
    await db.runAsync(
      'DELETE FROM market_expenses WHERE recordId IN (SELECT id FROM market_records WHERE (userId IS ?) AND workspaceId = ?)',
      ownerId, workspaceId
    );
    await db.runAsync('DELETE FROM market_records WHERE (userId IS ?) AND workspaceId = ?', ownerId, workspaceId);
    await db.runAsync('DELETE FROM crop_schedules WHERE workspaceId = ?', workspaceId);
    await db.runAsync('DELETE FROM vault_documents WHERE workspaceId = ?', workspaceId);
    await db.runAsync('DELETE FROM harvests WHERE (userId IS ?) AND workspaceId = ?', ownerId, workspaceId);
    await db.runAsync('DELETE FROM finance_entries WHERE (userId IS ?) AND workspaceId = ?', ownerId, workspaceId);
    await db.runAsync('DELETE FROM diary_entries WHERE (userId IS ?) AND workspaceId = ?', ownerId, workspaceId);
    await db.runAsync('DELETE FROM crops WHERE (userId IS ?) AND workspaceId = ?', ownerId, workspaceId);
    await db.runAsync('DELETE FROM plots WHERE (userId IS ?) AND workspaceId = ?', ownerId, workspaceId);
    await db.runAsync(
      "DELETE FROM farm_profile WHERE workspaceId = ? AND COALESCE(userId, '') = COALESCE(?, '')",
      workspaceId, ownerId
    );

    if (data.farmProfile) {
      const p = data.farmProfile;
      await db.runAsync(
        `INSERT INTO farm_profile (farmName, farmerName, village, taluk, district, state, totalArea, areaUnit, updatedAt, userId, workspaceId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        p.farmName ?? '',
        p.farmerName ?? '',
        p.village ?? '',
        p.taluk ?? '',
        p.district ?? '',
        p.state ?? '',
        p.totalArea ?? null,
        p.areaUnit ?? 'acres',
        p.updatedAt ?? new Date().toISOString(),
        ownerId,
        workspaceId
      );
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

    const now = new Date().toISOString();
    for (const rec of data.marketRecords ?? []) {
      const result = await db.runAsync(
        `INSERT INTO market_records (
          uuid, userId, workspaceId,
          marketDate, marketOpenTime,
          state, district, taluk, village, marketName,
          grossIncome, totalExpense, netProfit,
          paymentStatus, pendingAmount, agentName,
          cratesSent, cratesReturned,
          pattiPhotoUri, notes,
          customItemsNote, buyerIncome, buyerExpense, settledAmount,
          createdAt, updatedAt, deletedAt, lastSyncedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
        rec.uuid ?? uuidv4(),
        ownerId,
        workspaceId,
        rec.marketDate,
        rec.marketOpenTime ?? '03:30',
        rec.state ?? '',
        rec.district ?? '',
        rec.taluk ?? '',
        rec.village ?? '',
        rec.marketName ?? '',
        rec.grossIncome ?? 0,
        rec.totalExpense ?? 0,
        rec.netProfit ?? 0,
        rec.paymentStatus ?? 'cash',
        rec.pendingAmount ?? 0,
        rec.agentName ?? '',
        rec.cratesSent ?? 0,
        rec.cratesReturned ?? 0,
        rec.pattiPhotoUri ?? null,
        rec.notes ?? '',
        rec.customItemsNote ?? null,
        rec.buyerIncome ?? 0,
        rec.buyerExpense ?? 0,
        rec.settledAmount ?? 0,
        rec.createdAt ?? now,
        rec.updatedAt ?? now
      );
      const recordId = result.lastInsertRowId;

      for (let i = 0; i < (rec.vegetables ?? []).length; i += 1) {
        const veg = rec.vegetables[i];
        await db.runAsync(
          `INSERT INTO market_vegetable_items (
            recordId, vegetableName, grade, unit, quantity, weightPerUnitKg, ratePerUnit, totalAmount, sortOrder
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          recordId,
          veg.vegetableName ?? '',
          veg.grade ?? '',
          veg.unit ?? 'box',
          veg.quantity ?? 0,
          veg.weightPerUnitKg ?? null,
          veg.ratePerUnit ?? 0,
          veg.totalAmount ?? 0,
          veg.sortOrder ?? i
        );
      }

      for (let i = 0; i < (rec.expenses ?? []).length; i += 1) {
        const exp = rec.expenses[i];
        await db.runAsync(
          `INSERT INTO market_expenses (
            recordId, label, isPercentage, percentageValue, amount, sortOrder
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          recordId,
          exp.label ?? '',
          exp.isPercentage ? 1 : 0,
          exp.percentageValue ?? null,
          exp.amount ?? 0,
          exp.sortOrder ?? i
        );
      }
    }

    for (const sch of data.cropSchedules ?? []) {
      await db.runAsync(
        `INSERT OR REPLACE INTO crop_schedules (id, workspaceId, cropName, sowingDate, totalDays, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        sch.id || uuidv4(),
        workspaceId,
        sch.cropName,
        sch.sowingDate,
        sch.totalDays ?? null,
        sch.createdAt ?? now
      );
    }

    for (const doc of data.vaultDocuments ?? []) {
      await db.runAsync(
        `INSERT OR REPLACE INTO vault_documents (
           id, workspaceId, title, category, localUri, capturedAt,
           warrantyExpiryDate, warrantyItemName, warrantyAlertDaysBefore
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        doc.id || uuidv4(),
        workspaceId,
        doc.title,
        doc.category,
        doc.localUri,
        doc.capturedAt ?? now,
        doc.warrantyExpiryDate ?? null,
        doc.warrantyItemName ?? null,
        doc.warrantyAlertDaysBefore ?? null
      );
    }
  });
}
