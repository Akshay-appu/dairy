import * as SQLite from 'expo-sqlite';
import type { FarmProfile } from './schema';

export type ProfileInput = {
  farmName: string;
  farmerName: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  totalArea: number | null;
  areaUnit: string;
};

// farm_profile holds one row per (workspaceId, COALESCE(userId, '')) pair.
export async function getProfile(
  db: SQLite.SQLiteDatabase,
  ownerId: string | null,
  workspaceId: string = 'default'
): Promise<FarmProfile | null> {
  return db.getFirstAsync<FarmProfile>(
    "SELECT * FROM farm_profile WHERE workspaceId = ? AND COALESCE(userId, '') = COALESCE(?, '')",
    workspaceId,
    ownerId
  );
}

export async function saveProfile(
  db: SQLite.SQLiteDatabase,
  input: ProfileInput,
  ownerId: string | null,
  workspaceId: string = 'default'
): Promise<void> {
  const now = new Date().toISOString();
  const taluk = input.taluk ?? '';
  const result = await db.runAsync(
    `UPDATE farm_profile
     SET farmName = ?, farmerName = ?, village = ?, taluk = ?, district = ?, state = ?,
         totalArea = ?, areaUnit = ?, updatedAt = ?, userId = ?
     WHERE workspaceId = ? AND COALESCE(userId, '') = COALESCE(?, '')`,
    input.farmName, input.farmerName, input.village, taluk, input.district, input.state,
    input.totalArea, input.areaUnit, now, ownerId, workspaceId, ownerId
  );
  if (result.changes === 0) {
    await db.runAsync(
      `INSERT INTO farm_profile (farmName, farmerName, village, taluk, district, state, totalArea, areaUnit, updatedAt, userId, workspaceId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      input.farmName, input.farmerName, input.village, taluk, input.district, input.state,
      input.totalArea, input.areaUnit, now, ownerId, workspaceId
    );
  }
}
