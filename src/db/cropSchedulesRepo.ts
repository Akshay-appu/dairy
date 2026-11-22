import * as SQLite from 'expo-sqlite';
import { uuidv4 } from '../utils/uuid';

export type CropSchedule = {
  id: string;
  workspaceId: string;
  cropName: string;
  sowingDate: string;
  createdAt: string;
};

export type CropScheduleInput = {
  cropName: string;
  sowingDate: string;
};

export async function listCropSchedules(
  db: SQLite.SQLiteDatabase,
  workspaceId: string = 'default'
): Promise<CropSchedule[]> {
  try {
    return await db.getAllAsync<CropSchedule>(
      'SELECT * FROM crop_schedules WHERE workspaceId = ? ORDER BY sowingDate DESC, createdAt DESC',
      workspaceId
    );
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
  await db.runAsync(
    'INSERT INTO crop_schedules (id, workspaceId, cropName, sowingDate, createdAt) VALUES (?, ?, ?, ?, ?)',
    id,
    workspaceId,
    input.cropName,
    input.sowingDate,
    now
  );
  return {
    id,
    workspaceId,
    cropName: input.cropName,
    sowingDate: input.sowingDate,
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
