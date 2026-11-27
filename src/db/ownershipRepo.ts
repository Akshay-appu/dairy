import * as SQLite from 'expo-sqlite';

const SYNCABLE_TABLES = [
  'plots',
  'crops',
  'diary_entries',
  'finance_entries',
  'harvests',
  'market_records',
] as const;

// "Unclaimed" = userId IS NULL — data entered before any account existed on
// this device (today's only mode, untouched for anyone who never signs in).
export async function hasUnclaimedData(db: SQLite.SQLiteDatabase): Promise<boolean> {
  for (const table of SYNCABLE_TABLES) {
    const row = await db.getFirstAsync<{ c: number }>(`SELECT COUNT(*) as c FROM ${table} WHERE userId IS NULL`);
    if ((row?.c ?? 0) > 0) return true;
  }
  const profile = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM farm_profile WHERE userId IS NULL');
  return (profile?.c ?? 0) > 0;
}

// One-time claim: every row this device has never associated with any
// account becomes this user's. Bumps updatedAt so the next sync pass treats
// them as pending (they've never been pushed to this account's cloud data).
export async function claimUnclaimedData(db: SQLite.SQLiteDatabase, uid: string): Promise<void> {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    for (const table of SYNCABLE_TABLES) {
      await db.runAsync(`UPDATE ${table} SET userId = ?, updatedAt = ? WHERE userId IS NULL`, uid, now);
    }
    await db.runAsync(
      `UPDATE farm_profile SET userId = ?, updatedAt = ?
       WHERE userId IS NULL
         AND NOT EXISTS (
           SELECT 1 FROM farm_profile fp2
           WHERE fp2.workspaceId = farm_profile.workspaceId AND fp2.userId = ?
         )`,
      uid, now, uid
    );
  });
}

// Account deletion only: permanently removes this uid's rows, including
// tombstones (unlike every other delete path in this app, which soft-deletes
// via deletedAt so sync can propagate it — there is no "other device" left
// to sync a tombstone to once the account itself is gone). Scoped strictly
// to `uid`, never a wildcard, so one account can never purge another's rows
// even though they may share this device's SQLite file. Idempotent: deleting
// rows that are already gone is a no-op, safe to retry.
export async function purgeAccountData(db: SQLite.SQLiteDatabase, uid: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'DELETE FROM market_vegetable_items WHERE recordId IN (SELECT id FROM market_records WHERE userId = ?)',
      uid
    );
    await db.runAsync(
      'DELETE FROM market_expenses WHERE recordId IN (SELECT id FROM market_records WHERE userId = ?)',
      uid
    );
    for (const table of SYNCABLE_TABLES) {
      await db.runAsync(`DELETE FROM ${table} WHERE userId = ?`, uid);
    }
    await db.runAsync('DELETE FROM farm_profile WHERE userId = ?', uid);
  });
}
