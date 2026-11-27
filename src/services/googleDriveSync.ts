import * as SQLite from 'expo-sqlite';
import {
  BackupCounts,
  BackupData,
  buildBackup,
  countBackup,
  parseBackup,
  restoreBackup,
} from '../db/backupRepo';
import { listWorkspaces } from '../db/workspacesRepo';
import type { Copy } from '../i18n/copy';
import { clearStoredDriveToken } from './googleDriveAuth';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';
const BS_DIARY_FOLDER_NAME = 'BS Diary';

export type GoogleDriveErrorCode =
  | 'drive/not-configured'
  | 'drive/not-connected'
  | 'drive/token-expired'
  | 'drive/quota-exceeded'
  | 'drive/network'
  | 'drive/no-backup'
  | 'drive/invalid-backup'
  | 'drive/cancelled'
  | 'drive/unknown';

export class GoogleDriveError extends Error {
  code: GoogleDriveErrorCode;
  status?: number;

  constructor(code: GoogleDriveErrorCode, message?: string, status?: number) {
    super(message || code);
    this.name = 'GoogleDriveError';
    this.code = code;
    this.status = status;
  }
}

export function driveErrorCopyKey(err: unknown): keyof Copy {
  const code =
    err instanceof GoogleDriveError
      ? err.code
      : err instanceof Error && 'code' in err
        ? String((err as { code: unknown }).code)
        : '';

  switch (code) {
    case 'drive/not-configured':
      return 'driveErrorNotConfigured';
    case 'drive/not-connected':
      return 'driveErrorNotConnected';
    case 'drive/token-expired':
      return 'driveErrorTokenExpired';
    case 'drive/quota-exceeded':
      return 'driveErrorQuotaExceeded';
    case 'drive/network':
    case 'auth/network-request-failed':
      return 'driveErrorNetwork';
    case 'drive/no-backup':
      return 'driveErrorNoBackup';
    case 'drive/invalid-backup':
      return 'driveErrorInvalidBackup';
    case 'drive/cancelled':
    case 'auth/popup-closed-by-user':
      return 'driveErrorCancelled';
    default:
      return 'driveErrorGeneric';
  }
}

// Pure UTF-8-safe Base64 encoder (works identically on Hermes Android/iOS and Web,
// supporting Kannada, Hindi, and emoji characters where btoa() would fail).
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function utf8ToBase64(input: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i += 1) {
    let codePoint = input.charCodeAt(i);
    if (codePoint >= 0xd800 && codePoint <= 0xdbff && i + 1 < input.length) {
      const next = input.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        codePoint = ((codePoint - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
        i += 1;
      }
    }
    if (codePoint < 0x80) {
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint < 0x10000) {
      bytes.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    }
  }

  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const hasB1 = i + 1 < bytes.length;
    const hasB2 = i + 2 < bytes.length;
    const b1 = hasB1 ? bytes[i + 1] : 0;
    const b2 = hasB2 ? bytes[i + 2] : 0;

    output += BASE64_CHARS[b0 >> 2];
    output += BASE64_CHARS[((b0 & 0x03) << 4) | (b1 >> 4)];
    output += hasB1 ? BASE64_CHARS[((b1 & 0x0f) << 2) | (b2 >> 6)] : '=';
    output += hasB2 ? BASE64_CHARS[b2 & 0x3f] : '=';
  }
  return output;
}

function escapeDriveQueryValue(val: string): string {
  return val.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function backupFileNameForWorkspace(workspaceId: string): string {
  const safeId = workspaceId.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'default';
  return `bs_diary_backup_${safeId}.json`;
}

async function driveFetch(
  url: string,
  accessToken: string,
  init: RequestInit = {}
): Promise<Response> {
  if (!accessToken || !accessToken.trim()) {
    throw new GoogleDriveError('drive/not-connected', 'Missing Google Drive access token');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init.headers || {}),
      },
    });
  } catch (err) {
    throw new GoogleDriveError(
      'drive/network',
      err instanceof Error ? err.message : 'Network error'
    );
  }

  if (response.ok) {
    return response;
  }

  const rawBody = await response.text().catch(() => '');
  if (response.status === 401) {
    clearStoredDriveToken();
    throw new GoogleDriveError('drive/token-expired', rawBody || 'Drive token expired', 401);
  }
  if (
    response.status === 403 &&
    /storageQuotaExceeded|quotaExceeded/i.test(rawBody)
  ) {
    throw new GoogleDriveError('drive/quota-exceeded', rawBody || 'Drive storage full', 403);
  }

  throw new GoogleDriveError(
    'drive/unknown',
    `Google Drive HTTP ${response.status}: ${rawBody.slice(0, 200)}`,
    response.status
  );
}

function buildMultipartBody(
  metadata: Record<string, unknown>,
  mimeType: string,
  contentBase64: string
): { contentType: string; body: string } {
  const boundary = `bsdiary_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n` +
    `${contentBase64}\r\n` +
    `--${boundary}--`;
  return {
    contentType: `multipart/related; boundary=${boundary}`,
    body,
  };
}

export type DriveBackupMeta = {
  fileId: string;
  name: string;
  modifiedTime: string | null;
  size: number | null;
};

export async function getDriveBackupMeta(
  workspaceId: string,
  accessToken: string
): Promise<DriveBackupMeta | null> {
  const fileName = backupFileNameForWorkspace(workspaceId);
  const query = `name = '${escapeDriveQueryValue(fileName)}' and trashed = false`;
  const url =
    `${DRIVE_API_BASE}/files?spaces=appDataFolder` +
    `&q=${encodeURIComponent(query)}` +
    `&fields=${encodeURIComponent('files(id,name,modifiedTime,size)')}` +
    `&pageSize=1`;

  const response = await driveFetch(url, accessToken, { method: 'GET' });
  const json = (await response.json()) as {
    files?: { id?: string; name?: string; modifiedTime?: string; size?: string }[];
  };
  const file = json.files?.[0];
  if (!file?.id) return null;
  return {
    fileId: file.id,
    name: file.name || fileName,
    modifiedTime: file.modifiedTime ?? null,
    size: file.size ? Number(file.size) : null,
  };
}

export type DriveWorkspaceBackupResult = {
  workspaceId: string;
  fileId: string;
  fileName: string;
  exportedAt: string;
};

export async function backupAllWorkspacesToDrive(
  db: SQLite.SQLiteDatabase,
  ownerId: string | null,
  accessToken: string,
  activeWorkspaceId: string = 'default'
): Promise<{
  workspacesBackedUp: number;
  exportedAt: string;
  files: DriveWorkspaceBackupResult[];
}> {
  const workspaces = await listWorkspaces(db, ownerId).catch(() => []);
  const wsIdSet = new Set<string>([activeWorkspaceId || 'default']);
  for (const ws of workspaces) {
    const id = ws.uuid ?? ws.id;
    if (id) wsIdSet.add(id);
  }

  const results: DriveWorkspaceBackupResult[] = [];
  let latestExportedAt = new Date().toISOString();

  for (const wsId of Array.from(wsIdSet)) {
    const backup = await buildBackup(db, ownerId, wsId);
    latestExportedAt = backup.exportedAt;
    const fileName = backupFileNameForWorkspace(wsId);
    const jsonBase64 = utf8ToBase64(JSON.stringify(backup));
    const existing = await getDriveBackupMeta(wsId, accessToken);

    if (existing) {
      const { contentType, body } = buildMultipartBody(
        { name: fileName, mimeType: 'application/json' },
        'application/json',
        jsonBase64
      );
      const url = `${DRIVE_UPLOAD_BASE}/files/${encodeURIComponent(existing.fileId)}?uploadType=multipart&fields=id,name`;
      const res = await driveFetch(url, accessToken, {
        method: 'PATCH',
        headers: { 'Content-Type': contentType },
        body,
      });
      const updated = (await res.json()) as { id?: string };
      results.push({
        workspaceId: wsId,
        fileId: updated.id || existing.fileId,
        fileName,
        exportedAt: backup.exportedAt,
      });
    } else {
      const { contentType, body } = buildMultipartBody(
        { name: fileName, parents: ['appDataFolder'], mimeType: 'application/json' },
        'application/json',
        jsonBase64
      );
      const url = `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name`;
      const res = await driveFetch(url, accessToken, {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body,
      });
      const created = (await res.json()) as { id?: string };
      results.push({
        workspaceId: wsId,
        fileId: created.id || '',
        fileName,
        exportedAt: backup.exportedAt,
      });
    }
  }

  return {
    workspacesBackedUp: results.length,
    exportedAt: latestExportedAt,
    files: results,
  };
}

async function getLocalLatestUpdatedAt(
  db: SQLite.SQLiteDatabase,
  ownerId: string | null,
  workspaceId: string
): Promise<string | null> {
  const queries = [
    db.getFirstAsync<{ latest: string | null }>(
      'SELECT MAX(updatedAt) as latest FROM diary_entries WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?',
      ownerId, workspaceId
    ),
    db.getFirstAsync<{ latest: string | null }>(
      'SELECT MAX(updatedAt) as latest FROM plots WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?',
      ownerId, workspaceId
    ),
    db.getFirstAsync<{ latest: string | null }>(
      'SELECT MAX(updatedAt) as latest FROM crops WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?',
      ownerId, workspaceId
    ),
    db.getFirstAsync<{ latest: string | null }>(
      'SELECT MAX(updatedAt) as latest FROM finance_entries WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?',
      ownerId, workspaceId
    ),
    db.getFirstAsync<{ latest: string | null }>(
      'SELECT MAX(updatedAt) as latest FROM harvests WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?',
      ownerId, workspaceId
    ),
    db.getFirstAsync<{ latest: string | null }>(
      'SELECT MAX(updatedAt) as latest FROM market_records WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?',
      ownerId, workspaceId
    ),
    db.getFirstAsync<{ latest: string | null }>(
      "SELECT MAX(updatedAt) as latest FROM farm_profile WHERE workspaceId = ? AND COALESCE(userId, '') = COALESCE(?, '')",
      workspaceId, ownerId
    ),
  ];

  const rows = await Promise.all(queries.map(p => p.catch(() => null)));
  let latest: string | null = null;
  for (const row of rows) {
    if (row?.latest && (!latest || row.latest > latest)) {
      latest = row.latest;
    }
  }
  return latest;
}

export type DriveBackupPreview = {
  fileId: string;
  modifiedTime: string | null;
  exportedAt: string;
  localLatestUpdatedAt: string | null;
  isLocalNewer: boolean;
  data: BackupData;
  counts: BackupCounts;
};

export async function downloadDriveBackupForPreview(
  db: SQLite.SQLiteDatabase,
  ownerId: string | null,
  workspaceId: string,
  accessToken: string
): Promise<DriveBackupPreview> {
  const meta = await getDriveBackupMeta(workspaceId, accessToken);
  if (!meta) {
    throw new GoogleDriveError('drive/no-backup', 'No backup found in Google Drive for this workspace');
  }

  const downloadUrl = `${DRIVE_API_BASE}/files/${encodeURIComponent(meta.fileId)}?alt=media`;
  const res = await driveFetch(downloadUrl, accessToken, { method: 'GET' });
  const rawText = await res.text();

  let data: BackupData;
  try {
    data = parseBackup(rawText);
  } catch {
    throw new GoogleDriveError('drive/invalid-backup', 'Backup file in Google Drive is invalid');
  }

  const localLatestUpdatedAt = await getLocalLatestUpdatedAt(db, ownerId, workspaceId);
  const exportedAt = data.exportedAt || meta.modifiedTime || '';
  const isLocalNewer = Boolean(localLatestUpdatedAt && exportedAt && localLatestUpdatedAt > exportedAt);

  return {
    fileId: meta.fileId,
    modifiedTime: meta.modifiedTime,
    exportedAt,
    localLatestUpdatedAt,
    isLocalNewer,
    data,
    counts: countBackup(data),
  };
}

export async function restoreFromDriveBackup(
  db: SQLite.SQLiteDatabase,
  ownerId: string | null,
  workspaceId: string,
  accessToken: string
): Promise<DriveBackupPreview> {
  const preview = await downloadDriveBackupForPreview(db, ownerId, workspaceId, accessToken);
  await restoreBackup(db, preview.data, ownerId, workspaceId);
  return preview;
}

async function findOrCreateBsDiaryFolder(accessToken: string): Promise<string> {
  const query =
    `mimeType = 'application/vnd.google-apps.folder' ` +
    `and name = '${escapeDriveQueryValue(BS_DIARY_FOLDER_NAME)}' ` +
    `and trashed = false`;
  const searchUrl =
    `${DRIVE_API_BASE}/files?spaces=drive` +
    `&q=${encodeURIComponent(query)}` +
    `&fields=${encodeURIComponent('files(id,name)')}` +
    `&pageSize=1`;

  const searchRes = await driveFetch(searchUrl, accessToken, { method: 'GET' });
  const searchJson = (await searchRes.json()) as { files?: { id?: string }[] };
  if (searchJson.files?.[0]?.id) {
    return searchJson.files[0].id;
  }

  const createRes = await driveFetch(
    `${DRIVE_API_BASE}/files?fields=id`,
    accessToken,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({
        name: BS_DIARY_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    }
  );
  const created = (await createRes.json()) as { id?: string };
  if (!created.id) {
    throw new GoogleDriveError('drive/unknown', 'Could not create BS Diary folder in Google Drive');
  }
  return created.id;
}

export async function uploadFileToBsDiaryDriveFolder(
  accessToken: string,
  file: {
    fileName: string;
    mimeType: string;
    contentBase64: string;
  }
): Promise<{ fileId: string; webViewLink: string | null }> {
  const folderId = await findOrCreateBsDiaryFolder(accessToken);
  const { contentType, body } = buildMultipartBody(
    {
      name: file.fileName,
      parents: [folderId],
      mimeType: file.mimeType,
    },
    file.mimeType,
    file.contentBase64
  );

  const uploadUrl = `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,webViewLink`;
  const res = await driveFetch(uploadUrl, accessToken, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  });
  const json = (await res.json()) as { id?: string; webViewLink?: string };
  return {
    fileId: json.id || '',
    webViewLink: json.webViewLink ?? null,
  };
}
