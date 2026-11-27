import * as SQLite from 'expo-sqlite';
import { uuidv4 } from '../utils/uuid';
export * from './cropSchedulesRepo';
export * from './vaultRepo';
export * from './marketRecordsRepo';

// Sync bookkeeping columns shared by every syncable table:
//   uuid         - stable cross-device identity; also the Firestore doc id
//   userId       - which signed-in account locally owns this row (null = unclaimed/guest)
//   deletedAt    - soft-delete tombstone so deletes can propagate instead of just disappearing
//   lastSyncedAt - local-only bookkeeping: last time this row's current updatedAt was pushed/pulled
type SyncColumns = {
  uuid: string;
  userId: string | null;
  deletedAt: string | null;
  lastSyncedAt: string | null;
};

export type Entry = {
  id: number;
  title: string;
  category: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  plotId: number | null;
  cropId: number | null;
} & SyncColumns;

export type FarmProfile = {
  id: number;
  farmName: string;
  farmerName: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  totalArea: number | null;
  areaUnit: string;
  updatedAt: string;
  userId: string | null;
  lastSyncedAt: string | null;
  workspaceId?: string;
};

export type Plot = {
  id: number;
  name: string;
  area: number | null;
  areaUnit: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
} & SyncColumns;

export type Crop = {
  id: number;
  cropName: string;
  season: string;
  plotId: number | null;
  sowingDate: string;
  expectedHarvestDate: string | null;
  createdAt: string;
  updatedAt: string;
} & SyncColumns;

export type FinanceType = 'expense' | 'income';

export type FinanceEntry = {
  id: number;
  type: FinanceType;
  amount: number;
  category: string;
  date: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
} & SyncColumns;

export type Harvest = {
  id: number;
  cropId: number | null;
  plotId: number | null;
  harvestDate: string;
  quantity: number;
  quantityUnit: string;
  sellingPrice: number | null;
  buyer: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
} & SyncColumns;

const SCHEMA_VERSION = 8;

// Every syncable table except farm_profile (singleton, no uuid/tombstone needed).
const SYNCABLE_TABLES = ['plots', 'crops', 'diary_entries', 'finance_entries', 'harvests'] as const;
const ALL_TABLES_WITH_WORKSPACE = [...SYNCABLE_TABLES, 'farm_profile'] as const;

async function columnExists(db: SQLite.SQLiteDatabase, table: string, column: string): Promise<boolean> {
  const rows = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  return rows.some(row => row.name === column);
}

async function addColumnIfMissing(db: SQLite.SQLiteDatabase, table: string, column: string, ddl: string): Promise<void> {
  if (!(await columnExists(db, table, column))) {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${ddl};`);
  }
}

async function migrateToV2(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS farm_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      farmName TEXT NOT NULL DEFAULT '',
      farmerName TEXT NOT NULL DEFAULT '',
      village TEXT NOT NULL DEFAULT '',
      district TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      totalArea REAL,
      areaUnit TEXT NOT NULL DEFAULT 'acres',
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      area REAL,
      areaUnit TEXT NOT NULL DEFAULT 'acres',
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS crops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cropName TEXT NOT NULL,
      season TEXT NOT NULL,
      plotId INTEGER,
      sowingDate TEXT NOT NULL,
      expectedHarvestDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS finance_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('expense','income')),
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS harvests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cropId INTEGER,
      plotId INTEGER,
      harvestDate TEXT NOT NULL,
      quantity REAL NOT NULL,
      quantityUnit TEXT NOT NULL DEFAULT 'kg',
      sellingPrice REAL,
      buyer TEXT,
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL
    );
  `);

  // Nullable, additive columns on the existing table — existing rows get
  // NULL for both, so old activities keep working unlinked.
  await addColumnIfMissing(db, 'diary_entries', 'plotId', 'plotId INTEGER');
  await addColumnIfMissing(db, 'diary_entries', 'cropId', 'cropId INTEGER');
}

async function migrateToV3(db: SQLite.SQLiteDatabase): Promise<void> {
  // updatedAt was missing on these three tables (plots/crops/farm_profile
  // already had it). Backfill existing rows from createdAt so last-write-wins
  // sync has a sane starting point instead of NULL.
  await addColumnIfMissing(db, 'diary_entries', 'updatedAt', 'updatedAt TEXT');
  await addColumnIfMissing(db, 'finance_entries', 'updatedAt', 'updatedAt TEXT');
  await addColumnIfMissing(db, 'harvests', 'updatedAt', 'updatedAt TEXT');
  await db.execAsync(`
    UPDATE diary_entries SET updatedAt = createdAt WHERE updatedAt IS NULL;
    UPDATE finance_entries SET updatedAt = createdAt WHERE updatedAt IS NULL;
    UPDATE harvests SET updatedAt = createdAt WHERE updatedAt IS NULL;
  `);

  await addColumnIfMissing(db, 'farm_profile', 'userId', 'userId TEXT');
  await addColumnIfMissing(db, 'farm_profile', 'lastSyncedAt', 'lastSyncedAt TEXT');

  for (const table of SYNCABLE_TABLES) {
    await addColumnIfMissing(db, table, 'uuid', 'uuid TEXT');
    await addColumnIfMissing(db, table, 'userId', 'userId TEXT');
    await addColumnIfMissing(db, table, 'deletedAt', 'deletedAt TEXT');
    await addColumnIfMissing(db, table, 'lastSyncedAt', 'lastSyncedAt TEXT');

    // Backfill a unique uuid per existing row — can't be a column DEFAULT
    // since every row needs a *different* value.
    const rows = await db.getAllAsync<{ id: number }>(`SELECT id FROM ${table} WHERE uuid IS NULL`);
    for (const row of rows) {
      await db.runAsync(`UPDATE ${table} SET uuid = ? WHERE id = ?`, uuidv4(), row.id);
    }
  }
}

async function migrateToV4(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      isDefault INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      userId TEXT,
      uuid TEXT,
      deletedAt TEXT,
      lastSyncedAt TEXT
    );
  `);

  const existingDefault = await db.getFirstAsync<{ id: string }>('SELECT id FROM workspaces WHERE id = ?', 'default');
  if (!existingDefault) {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO workspaces (id, name, isDefault, createdAt, updatedAt, uuid) VALUES (?, ?, 1, ?, ?, ?)`,
      'default', 'Default Workspace', now, now, uuidv4()
    );
  }

  for (const table of ALL_TABLES_WITH_WORKSPACE) {
    await addColumnIfMissing(db, table, 'workspaceId', 'workspaceId TEXT');
    await db.execAsync(`UPDATE ${table} SET workspaceId = 'default' WHERE workspaceId IS NULL;`);
  }
}

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function createFreshV8Schema(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      note TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      plotId INTEGER,
      cropId INTEGER,
      updatedAt TEXT,
      uuid TEXT,
      userId TEXT,
      deletedAt TEXT,
      lastSyncedAt TEXT,
      workspaceId TEXT DEFAULT 'default'
    );

    CREATE TABLE IF NOT EXISTS farm_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmName TEXT NOT NULL DEFAULT '',
      farmerName TEXT NOT NULL DEFAULT '',
      village TEXT NOT NULL DEFAULT '',
      taluk TEXT NOT NULL DEFAULT '',
      district TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      totalArea REAL,
      areaUnit TEXT NOT NULL DEFAULT 'acres',
      updatedAt TEXT NOT NULL,
      userId TEXT,
      lastSyncedAt TEXT,
      workspaceId TEXT NOT NULL DEFAULT 'default'
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_farm_profile_ws_owner
      ON farm_profile (workspaceId, COALESCE(userId, ''));

    CREATE TABLE IF NOT EXISTS plots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      area REAL,
      areaUnit TEXT NOT NULL DEFAULT 'acres',
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      uuid TEXT,
      userId TEXT,
      deletedAt TEXT,
      lastSyncedAt TEXT,
      workspaceId TEXT DEFAULT 'default'
    );

    CREATE TABLE IF NOT EXISTS crops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cropName TEXT NOT NULL,
      season TEXT NOT NULL,
      plotId INTEGER,
      sowingDate TEXT NOT NULL,
      expectedHarvestDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      uuid TEXT,
      userId TEXT,
      deletedAt TEXT,
      lastSyncedAt TEXT,
      workspaceId TEXT DEFAULT 'default'
    );

    CREATE TABLE IF NOT EXISTS finance_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('expense','income')),
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT,
      uuid TEXT,
      userId TEXT,
      deletedAt TEXT,
      lastSyncedAt TEXT,
      workspaceId TEXT DEFAULT 'default'
    );

    CREATE TABLE IF NOT EXISTS harvests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cropId INTEGER,
      plotId INTEGER,
      harvestDate TEXT NOT NULL,
      quantity REAL NOT NULL,
      quantityUnit TEXT NOT NULL DEFAULT 'kg',
      sellingPrice REAL,
      buyer TEXT,
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT,
      uuid TEXT,
      userId TEXT,
      deletedAt TEXT,
      lastSyncedAt TEXT,
      workspaceId TEXT DEFAULT 'default'
    );

    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      isDefault INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      userId TEXT,
      uuid TEXT,
      deletedAt TEXT,
      lastSyncedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS crop_schedules (
      id TEXT PRIMARY KEY,
      workspaceId TEXT NOT NULL,
      cropName TEXT NOT NULL,
      sowingDate TEXT NOT NULL,
      totalDays INTEGER,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_crop_schedules_workspace ON crop_schedules(workspaceId);

    CREATE TABLE IF NOT EXISTS vault_documents (
      id TEXT PRIMARY KEY,
      workspaceId TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      localUri TEXT NOT NULL,
      capturedAt TEXT NOT NULL,
      warrantyExpiryDate TEXT,
      warrantyItemName TEXT,
      warrantyAlertDaysBefore INTEGER DEFAULT 7
    );
    CREATE INDEX IF NOT EXISTS idx_vault_documents_workspace ON vault_documents(workspaceId);

    CREATE TABLE IF NOT EXISTS market_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL,
      userId TEXT,
      workspaceId TEXT NOT NULL DEFAULT 'default',
      marketDate TEXT NOT NULL,
      marketOpenTime TEXT NOT NULL DEFAULT '03:30',
      state TEXT NOT NULL DEFAULT '',
      district TEXT NOT NULL DEFAULT '',
      taluk TEXT NOT NULL DEFAULT '',
      village TEXT NOT NULL DEFAULT '',
      marketName TEXT NOT NULL DEFAULT '',
      grossIncome REAL NOT NULL DEFAULT 0,
      totalExpense REAL NOT NULL DEFAULT 0,
      netProfit REAL NOT NULL DEFAULT 0,
      paymentStatus TEXT NOT NULL DEFAULT 'cash',
      pendingAmount REAL NOT NULL DEFAULT 0,
      agentName TEXT NOT NULL DEFAULT '',
      cratesSent INTEGER NOT NULL DEFAULT 0,
      cratesReturned INTEGER NOT NULL DEFAULT 0,
      pattiPhotoUri TEXT,
      notes TEXT NOT NULL DEFAULT '',
      customItemsNote TEXT,
      buyerIncome REAL DEFAULT 0,
      buyerExpense REAL DEFAULT 0,
      settledAmount REAL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      deletedAt TEXT,
      lastSyncedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_market_records_workspace_date
      ON market_records(workspaceId, marketDate);

    CREATE TABLE IF NOT EXISTS market_vegetable_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recordId INTEGER NOT NULL,
      vegetableName TEXT NOT NULL,
      grade TEXT NOT NULL DEFAULT '',
      unit TEXT NOT NULL DEFAULT 'box',
      quantity REAL NOT NULL DEFAULT 0,
      weightPerUnitKg REAL,
      ratePerUnit REAL NOT NULL DEFAULT 0,
      totalAmount REAL NOT NULL DEFAULT 0,
      sortOrder INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_market_vegetable_items_record
      ON market_vegetable_items(recordId);

    CREATE TABLE IF NOT EXISTS market_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recordId INTEGER NOT NULL,
      label TEXT NOT NULL,
      isPercentage INTEGER NOT NULL DEFAULT 0,
      percentageValue REAL,
      amount REAL NOT NULL DEFAULT 0,
      sortOrder INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_market_expenses_record
      ON market_expenses(recordId);
  `);

  const now = new Date().toISOString();
  await database.runAsync(
    `INSERT OR IGNORE INTO workspaces (id, name, isDefault, createdAt, updatedAt, uuid) VALUES (?, ?, 1, ?, ?, ?)`,
    'default', 'Default Workspace', now, now, 'default'
  );
  await database.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

async function migrateToV5(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS crop_schedules (
      id TEXT PRIMARY KEY,
      workspaceId TEXT NOT NULL,
      cropName TEXT NOT NULL,
      sowingDate TEXT NOT NULL,
      totalDays INTEGER,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_crop_schedules_workspace ON crop_schedules(workspaceId);

    CREATE TABLE IF NOT EXISTS vault_documents (
      id TEXT PRIMARY KEY,
      workspaceId TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      localUri TEXT NOT NULL,
      capturedAt TEXT NOT NULL,
      warrantyExpiryDate TEXT,
      warrantyItemName TEXT,
      warrantyAlertDaysBefore INTEGER DEFAULT 7
    );
    CREATE INDEX IF NOT EXISTS idx_vault_documents_workspace ON vault_documents(workspaceId);
  `);

  await addColumnIfMissing(database, 'crop_schedules', 'workspaceId', "workspaceId TEXT NOT NULL DEFAULT 'default'");
  await addColumnIfMissing(database, 'crop_schedules', 'cropName', "cropName TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing(database, 'crop_schedules', 'sowingDate', "sowingDate TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing(database, 'crop_schedules', 'totalDays', 'totalDays INTEGER');
  await addColumnIfMissing(database, 'crop_schedules', 'createdAt', "createdAt TEXT NOT NULL DEFAULT ''");

  await addColumnIfMissing(database, 'vault_documents', 'workspaceId', "workspaceId TEXT NOT NULL DEFAULT 'default'");
  await addColumnIfMissing(database, 'vault_documents', 'title', "title TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing(database, 'vault_documents', 'category', "category TEXT NOT NULL DEFAULT 'Other'");
  await addColumnIfMissing(database, 'vault_documents', 'localUri', "localUri TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing(database, 'vault_documents', 'capturedAt', "capturedAt TEXT NOT NULL DEFAULT ''");
}

async function migrateToV6(database: SQLite.SQLiteDatabase): Promise<void> {
  // 1. Normalize any existing workspaces where uuid != id (or uuid IS NULL) so uuid = id
  await database.execAsync(`
    UPDATE workspaces SET uuid = id WHERE uuid IS NULL OR uuid != id;
  `);

  // 2. Migrate farm_profile to remove CHECK (id = 1) so each workspace/account can hold its
  //    own profile row keyed by (workspaceId, COALESCE(userId, '')), and add taluk column.
  const hasTaluk = await columnExists(database, 'farm_profile', 'taluk');
  const hasWorkspaceId = await columnExists(database, 'farm_profile', 'workspaceId');
  const talukSelect = hasTaluk ? "COALESCE(taluk, '')" : "''";
  const workspaceSelect = hasWorkspaceId ? "COALESCE(workspaceId, 'default')" : "'default'";

  await database.withTransactionAsync(async () => {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS farm_profile_v6 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farmName TEXT NOT NULL DEFAULT '',
        farmerName TEXT NOT NULL DEFAULT '',
        village TEXT NOT NULL DEFAULT '',
        taluk TEXT NOT NULL DEFAULT '',
        district TEXT NOT NULL DEFAULT '',
        state TEXT NOT NULL DEFAULT '',
        totalArea REAL,
        areaUnit TEXT NOT NULL DEFAULT 'acres',
        updatedAt TEXT NOT NULL,
        userId TEXT,
        lastSyncedAt TEXT,
        workspaceId TEXT NOT NULL DEFAULT 'default'
      );

      INSERT INTO farm_profile_v6 (
        farmName, farmerName, village, taluk, district, state,
        totalArea, areaUnit, updatedAt, userId, lastSyncedAt, workspaceId
      )
      SELECT
        COALESCE(farmName, ''),
        COALESCE(farmerName, ''),
        COALESCE(village, ''),
        ${talukSelect},
        COALESCE(district, ''),
        COALESCE(state, ''),
        totalArea,
        COALESCE(areaUnit, 'acres'),
        COALESCE(updatedAt, ''),
        userId,
        lastSyncedAt,
        ${workspaceSelect}
      FROM farm_profile;

      DROP TABLE farm_profile;
      ALTER TABLE farm_profile_v6 RENAME TO farm_profile;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_farm_profile_ws_owner
        ON farm_profile (workspaceId, COALESCE(userId, ''));
    `);
  });

  // 3. Create Daily Market Records tables + indexes
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS market_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL,
      userId TEXT,
      workspaceId TEXT NOT NULL DEFAULT 'default',
      marketDate TEXT NOT NULL,
      marketOpenTime TEXT NOT NULL DEFAULT '03:30',
      state TEXT NOT NULL DEFAULT '',
      district TEXT NOT NULL DEFAULT '',
      taluk TEXT NOT NULL DEFAULT '',
      village TEXT NOT NULL DEFAULT '',
      marketName TEXT NOT NULL DEFAULT '',
      grossIncome REAL NOT NULL DEFAULT 0,
      totalExpense REAL NOT NULL DEFAULT 0,
      netProfit REAL NOT NULL DEFAULT 0,
      paymentStatus TEXT NOT NULL DEFAULT 'cash',
      pendingAmount REAL NOT NULL DEFAULT 0,
      agentName TEXT NOT NULL DEFAULT '',
      cratesSent INTEGER NOT NULL DEFAULT 0,
      cratesReturned INTEGER NOT NULL DEFAULT 0,
      pattiPhotoUri TEXT,
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      deletedAt TEXT,
      lastSyncedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_market_records_workspace_date
      ON market_records(workspaceId, marketDate);

    CREATE TABLE IF NOT EXISTS market_vegetable_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recordId INTEGER NOT NULL,
      vegetableName TEXT NOT NULL,
      grade TEXT NOT NULL DEFAULT '',
      unit TEXT NOT NULL DEFAULT 'box',
      quantity REAL NOT NULL DEFAULT 0,
      weightPerUnitKg REAL,
      ratePerUnit REAL NOT NULL DEFAULT 0,
      totalAmount REAL NOT NULL DEFAULT 0,
      sortOrder INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_market_vegetable_items_record
      ON market_vegetable_items(recordId);

    CREATE TABLE IF NOT EXISTS market_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recordId INTEGER NOT NULL,
      label TEXT NOT NULL,
      isPercentage INTEGER NOT NULL DEFAULT 0,
      percentageValue REAL,
      amount REAL NOT NULL DEFAULT 0,
      sortOrder INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_market_expenses_record
      ON market_expenses(recordId);
  `);
}

async function migrateToV7(database: SQLite.SQLiteDatabase): Promise<void> {
  await addColumnIfMissing(database, 'vault_documents', 'warrantyExpiryDate', 'warrantyExpiryDate TEXT');
  await addColumnIfMissing(database, 'vault_documents', 'warrantyItemName', 'warrantyItemName TEXT');
  await addColumnIfMissing(database, 'vault_documents', 'warrantyAlertDaysBefore', 'warrantyAlertDaysBefore INTEGER DEFAULT 7');
}

async function migrateToV8(database: SQLite.SQLiteDatabase): Promise<void> {
  await addColumnIfMissing(database, 'market_records', 'customItemsNote', 'customItemsNote TEXT');
  await addColumnIfMissing(database, 'market_records', 'buyerIncome', 'buyerIncome REAL DEFAULT 0');
  await addColumnIfMissing(database, 'market_records', 'buyerExpense', 'buyerExpense REAL DEFAULT 0');
  await addColumnIfMissing(database, 'market_records', 'settledAmount', 'settledAmount REAL DEFAULT 0');
}

async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync('bhoomishakti-diary.db');
  await database.execAsync('PRAGMA journal_mode = WAL;');

  const row = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  // Fast path: schema already at current version
  if (version >= SCHEMA_VERSION) {
    return database;
  }

  // Fast path: brand-new fresh install creates all V8 tables in one batched SQL exec
  if (version === 0) {
    const existingLegacy = await database.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'diary_entries'"
    );
    if (!existingLegacy) {
      await createFreshV8Schema(database);
      return database;
    }
  }

  // Incremental migration path for pre-existing installations
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      note TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL
    );
  `);

  if (version < 1) {
    version = 1;
  }
  if (version < 2) {
    await migrateToV2(database);
    version = 2;
  }
  if (version < 3) {
    await migrateToV3(database);
    version = 3;
  }
  if (version < 4) {
    await migrateToV4(database);
    version = 4;
  }
  if (version < 5) {
    await migrateToV5(database);
    version = 5;
  }
  if (version < 6) {
    await migrateToV6(database);
    version = 6;
  }
  if (version < 7) {
    await migrateToV7(database);
    version = 7;
  }
  if (version < 8) {
    await migrateToV8(database);
  }

  await database.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);

  return database;
}

export function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = initDatabase().catch((err) => {
      databasePromise = null;
      throw err;
    });
  }
  return databasePromise;
}
