import * as SQLite from 'expo-sqlite';
import { FarmProfile } from './schema';

export type ProfileInput = {
  farmName: string;
  farmerName: string;
  village: string;
  district: string;
  state: string;
  totalArea: number | null;
  areaUnit: string;
};

// farm_profile is a single local row (id=1, enforced by a CHECK constraint)
// per workspace/account. Reads and writes are scoped by ownerId and workspaceId.
export async function getProfile(db: SQLite.SQLiteDatabase, ownerId: string | null, workspaceId: string = 'default'): Promise<FarmProfile | null> {
  return db.getFirstAsync<FarmProfile>('SELECT * FROM farm_profile WHERE id = 1 AND (userId IS ?) AND workspaceId = ?', ownerId, workspaceId);
}

export async function saveProfile(db: SQLite.SQLiteDatabase, input: ProfileInput, ownerId: string | null, workspaceId: string = 'default'): Promise<void> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `UPDATE farm_profile SET farmName = ?, farmerName = ?, village = ?, district = ?, state = ?,
       totalArea = ?, areaUnit = ?, updatedAt = ?, userId = ? WHERE id = 1 AND workspaceId = ?`,
    input.farmName, input.farmerName, input.village, input.district, input.state,
    input.totalArea, input.areaUnit, now, ownerId, workspaceId
  );
  if (result.changes === 0) {
    await db.runAsync(
      `INSERT INTO farm_profile (id, farmName, farmerName, village, district, state, totalArea, areaUnit, updatedAt, userId, workspaceId)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      input.farmName, input.farmerName, input.village, input.district, input.state,
      input.totalArea, input.areaUnit, now, ownerId, workspaceId
    );
  }
}
