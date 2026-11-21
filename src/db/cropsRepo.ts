import * as SQLite from 'expo-sqlite';
import { unlinkCrop as unlinkCropFromActivities } from './activitiesRepo';
import { Crop } from './schema';
import { uuidv4 } from '../utils/uuid';

export type CropInput = {
  cropName: string;
  season: string;
  plotId: number | null;
  sowingDate: string;
  expectedHarvestDate: string | null;
};

export async function listCrops(db: SQLite.SQLiteDatabase, ownerId: string | null, workspaceId: string = 'default'): Promise<Crop[]> {
  return db.getAllAsync<Crop>(
    'SELECT * FROM crops WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ? ORDER BY id DESC',
    ownerId, workspaceId
  );
}

export async function addCrop(db: SQLite.SQLiteDatabase, input: CropInput, ownerId: string | null, workspaceId: string = 'default'): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO crops (cropName, season, plotId, sowingDate, expectedHarvestDate, createdAt, updatedAt, uuid, userId, workspaceId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    input.cropName, input.season, input.plotId, input.sowingDate, input.expectedHarvestDate, now, now, uuidv4(), ownerId, workspaceId
  );
}

export async function updateCrop(db: SQLite.SQLiteDatabase, id: number, input: CropInput, ownerId: string | null, workspaceId: string = 'default'): Promise<void> {
  await db.runAsync(
    'UPDATE crops SET cropName = ?, season = ?, plotId = ?, sowingDate = ?, expectedHarvestDate = ?, updatedAt = ? WHERE id = ? AND (userId IS ?) AND workspaceId = ?',
    input.cropName, input.season, input.plotId, input.sowingDate, input.expectedHarvestDate, new Date().toISOString(), id, ownerId, workspaceId
  );
}

export async function deleteCrop(db: SQLite.SQLiteDatabase, id: number, ownerId: string | null, workspaceId: string = 'default'): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync('UPDATE harvests SET cropId = NULL, updatedAt = ? WHERE cropId = ?', now, id);
  await unlinkCropFromActivities(db, id, workspaceId);
  await db.runAsync('UPDATE crops SET deletedAt = ?, updatedAt = ? WHERE id = ? AND (userId IS ?) AND workspaceId = ?', now, now, id, ownerId, workspaceId);
}
