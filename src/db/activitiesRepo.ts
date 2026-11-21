import * as SQLite from 'expo-sqlite';
import { uuidv4 } from '../utils/uuid';
import { Entry } from './schema';

export type ActivityInput = {
  title: string;
  category: string;
  note: string;
  plotId: number | null;
  cropId: number | null;
};

export async function listEntries(db: SQLite.SQLiteDatabase, ownerId: string | null, workspaceId: string = 'default'): Promise<Entry[]> {
  return db.getAllAsync<Entry>(
    'SELECT * FROM diary_entries WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ? ORDER BY id DESC',
    ownerId, workspaceId
  );
}

export async function addEntry(db: SQLite.SQLiteDatabase, input: ActivityInput, ownerId: string | null, workspaceId: string = 'default'): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO diary_entries (title, category, note, createdAt, updatedAt, plotId, cropId, uuid, userId, workspaceId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    input.title, input.category, input.note, now, now, input.plotId, input.cropId, uuidv4(), ownerId, workspaceId
  );
}

export async function updateEntry(db: SQLite.SQLiteDatabase, id: number, input: ActivityInput, ownerId: string | null, workspaceId: string = 'default'): Promise<void> {
  await db.runAsync(
    'UPDATE diary_entries SET title = ?, category = ?, note = ?, updatedAt = ?, plotId = ?, cropId = ? WHERE id = ? AND (userId IS ?) AND workspaceId = ?',
    input.title, input.category, input.note, new Date().toISOString(), input.plotId, input.cropId, id, ownerId, workspaceId
  );
}

export async function deleteEntry(db: SQLite.SQLiteDatabase, id: number, ownerId: string | null, workspaceId: string = 'default'): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE diary_entries SET deletedAt = ?, updatedAt = ? WHERE id = ? AND (userId IS ?) AND workspaceId = ?',
    now, now, id, ownerId, workspaceId
  );
}

export async function unlinkPlot(db: SQLite.SQLiteDatabase, plotId: number, workspaceId: string = 'default'): Promise<void> {
  await db.runAsync(
    'UPDATE diary_entries SET plotId = NULL, updatedAt = ? WHERE plotId = ? AND workspaceId = ?',
    new Date().toISOString(), plotId, workspaceId
  );
}

export async function unlinkCrop(db: SQLite.SQLiteDatabase, cropId: number, workspaceId: string = 'default'): Promise<void> {
  await db.runAsync(
    'UPDATE diary_entries SET cropId = NULL, updatedAt = ? WHERE cropId = ? AND workspaceId = ?',
    new Date().toISOString(), cropId, workspaceId
  );
}
