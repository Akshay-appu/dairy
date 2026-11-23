import * as SQLite from 'expo-sqlite';
import { uuidv4 } from '../utils/uuid';

export type CropSchedule = {
  id: string;
  workspaceId: string;
  cropName: string;
  sowingDate: string;
  totalDays: number | null;
  createdAt: string;
};

export type CropScheduleInput = {
  cropName: string;
  sowingDate: string;
  totalDays?: number | null;
};

function sanitizeTotalDays(val: unknown): number | null {
  if (typeof val !== 'number' || !Number.isFinite(val)) return null;
  const rounded = Math.round(val);
  if (rounded < 20 || rounded > 730) return null;
  return rounded;
}

export async function listCropSchedules(
  db: SQLite.SQLiteDatabase,
  workspaceId: string = 'default'
): Promise<CropSchedule[]> {
  try {
    const rows = await db.getAllAsync<CropSchedule>(
      'SELECT * FROM crop_schedules WHERE workspaceId = ? ORDER BY sowingDate DESC, createdAt DESC',
      workspaceId
    );
    return rows.map(row => ({
      ...row,
      totalDays: sanitizeTotalDays(row.totalDays),
    }));
  } catch (err) {
    console.warn('Could not list crop schedules from SQLite:', err);
    return [];
  }
}

export async function addCropSchedule(
  db: SQLite.SQLiteDatabase,
  input: CropScheduleInput,
  workspaceId: string = 'default'
): Promise<CropSchedule> {
  const id = uuidv4();
  const now = new Date().toISOString();
  const cleanName = input.cropName.trim() || 'Custom Crop';
  const cleanDate = input.sowingDate.trim() || now.slice(0, 10);
  const cleanTotalDays = sanitizeTotalDays(input.totalDays);

  await db.runAsync(
    'INSERT INTO crop_schedules (id, workspaceId, cropName, sowingDate, totalDays, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    workspaceId,
    cleanName,
    cleanDate,
    cleanTotalDays,
    now
  );
  return {
    id,
    workspaceId,
    cropName: cleanName,
    sowingDate: cleanDate,
    totalDays: cleanTotalDays,
    createdAt: now,
  };
}

export async function deleteCropSchedule(
  db: SQLite.SQLiteDatabase,
  id: string,
  workspaceId: string = 'default'
): Promise<void> {
  await db.runAsync(
    'DELETE FROM crop_schedules WHERE id = ? AND workspaceId = ?',
    id,
    workspaceId
  );
}
