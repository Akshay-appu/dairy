import * as SQLite from 'expo-sqlite';
import { uuidv4 } from '../utils/uuid';

export type Workspace = {
  id: string;
  name: string;
  isDefault: number;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  uuid: string | null;
  deletedAt: string | null;
  lastSyncedAt: string | null;
};

export type WorkspaceInput = {
  name: string;
};

export async function listWorkspaces(db: SQLite.SQLiteDatabase, ownerId: string | null): Promise<Workspace[]> {
  return db.getAllAsync<Workspace>(
    'SELECT * FROM workspaces WHERE deletedAt IS NULL AND (userId IS ?) ORDER BY isDefault DESC, createdAt ASC',
    ownerId
  );
}

export async function addWorkspace(db: SQLite.SQLiteDatabase, input: WorkspaceInput, ownerId: string | null): Promise<string> {
  const id = uuidv4();
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO workspaces (id, name, isDefault, createdAt, updatedAt, uuid, userId) VALUES (?, ?, 0, ?, ?, ?, ?)',
    id, input.name, now, now, id, ownerId
  );
  return id;
}

export async function updateWorkspace(db: SQLite.SQLiteDatabase, id: string, name: string, ownerId: string | null): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE workspaces SET name = ?, updatedAt = ? WHERE id = ? AND (userId IS ?)',
    name, now, id, ownerId
  );
}

export async function deleteWorkspace(db: SQLite.SQLiteDatabase, id: string, ownerId: string | null): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE workspaces SET deletedAt = ?, updatedAt = ? WHERE id = ? AND isDefault = 0 AND (userId IS ?)',
    now, now, id, ownerId
  );
}
