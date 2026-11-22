import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { uuidv4 } from '../utils/uuid';

export type VaultCategory = 'Fertilizer Bill' | 'Mandi Slip' | 'Soil Report' | 'Other';

export type VaultDocument = {
  id: string;
  workspaceId: string;
  title: string;
  category: VaultCategory;
  localUri: string;
  capturedAt: string;
};

export type VaultDocumentInput = {
  title: string;
  category: VaultCategory;
  localUri: string;
  capturedAt?: string;
};

export async function listVaultDocuments(
  db: SQLite.SQLiteDatabase,
  workspaceId: string = 'default'
): Promise<VaultDocument[]> {
  try {
    return await db.getAllAsync<VaultDocument>(
      'SELECT * FROM vault_documents WHERE workspaceId = ? ORDER BY capturedAt DESC',
      workspaceId
    );
  } catch (err) {
    console.warn('Could not list vault documents from SQLite:', err);
    return [];
  }
}

export async function addVaultDocument(
  db: SQLite.SQLiteDatabase,
  input: VaultDocumentInput,
  workspaceId: string = 'default'
): Promise<VaultDocument> {
  const id = uuidv4();
  const capturedAt = input.capturedAt || new Date().toISOString();
  await db.runAsync(
    'INSERT INTO vault_documents (id, workspaceId, title, category, localUri, capturedAt) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    workspaceId,
    input.title,
    input.category,
    input.localUri,
    capturedAt
  );
  return {
    id,
    workspaceId,
    title: input.title,
    category: input.category,
    localUri: input.localUri,
    capturedAt,
  };
}

export async function deleteVaultDocument(
  db: SQLite.SQLiteDatabase,
  id: string,
  workspaceId: string = 'default'
): Promise<void> {
  const row = await db.getFirstAsync<VaultDocument>(
    'SELECT * FROM vault_documents WHERE id = ? AND workspaceId = ?',
    id,
    workspaceId
  );
  if (row && row.localUri) {
    try {
      if (FileSystem && typeof FileSystem.getInfoAsync === 'function' && typeof FileSystem.deleteAsync === 'function') {
        const fileInfo = await FileSystem.getInfoAsync(row.localUri);
        if (fileInfo?.exists) {
          await FileSystem.deleteAsync(row.localUri, { idempotent: true });
        }
      }
    } catch (e) {
      console.warn('Could not delete local file for vault document:', e);
    }
  }
  await db.runAsync(
    'DELETE FROM vault_documents WHERE id = ? AND workspaceId = ?',
    id,
    workspaceId
  );
}
