// Isolated test script for SQLite database migration from version 3 to version 4
// introducing workspace scoping and the workspaces table.
// Runs using Node's native node:sqlite DatabaseSync.

import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';

function uuidv4(): string {
  return crypto.randomUUID();
}

let passed = 0;
let failed = 0;

function check(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`PASS: ${name}`);
  } catch (err: any) {
    failed += 1;
    console.log(`FAIL: ${name}`);
    console.log(`   ${err.message}`);
  }
}

// 1. Create an in-memory database and set up version 3 schema with mock data
const db = new DatabaseSync(':memory:');

db.exec(`
  PRAGMA user_version = 3;

  CREATE TABLE farm_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    farmName TEXT NOT NULL DEFAULT '',
    farmerName TEXT NOT NULL DEFAULT '',
    village TEXT NOT NULL DEFAULT '',
    district TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL DEFAULT '',
    totalArea REAL,
    areaUnit TEXT NOT NULL DEFAULT 'acres',
    updatedAt TEXT NOT NULL,
    userId TEXT,
    lastSyncedAt TEXT
  );

  CREATE TABLE plots (
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
    lastSyncedAt TEXT
  );

  CREATE TABLE crops (
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
    lastSyncedAt TEXT
  );

  CREATE TABLE diary_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    note TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    plotId INTEGER,
    cropId INTEGER,
    uuid TEXT,
    userId TEXT,
    deletedAt TEXT,
    lastSyncedAt TEXT
  );

  CREATE TABLE finance_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('expense','income')),
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    uuid TEXT,
    userId TEXT,
    deletedAt TEXT,
    lastSyncedAt TEXT
  );

  CREATE TABLE harvests (
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
    updatedAt TEXT NOT NULL,
    uuid TEXT,
    userId TEXT,
    deletedAt TEXT,
    lastSyncedAt TEXT
  );
`);

// Insert mock version 3 data
const now = new Date().toISOString();
db.prepare(`
  INSERT INTO farm_profile (id, farmName, farmerName, village, district, state, totalArea, areaUnit, updatedAt)
  VALUES (1, 'Green Valley Farm', 'Ramesh Patil', 'Shirpur', 'Dhule', 'Maharashtra', 12.5, 'acres', ?)
`).run(now);

db.prepare(`
  INSERT INTO plots (name, area, areaUnit, notes, createdAt, updatedAt, uuid)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run('North Plot', 5.0, 'acres', 'Near river', now, now, uuidv4());

db.prepare(`
  INSERT INTO crops (cropName, season, plotId, sowingDate, createdAt, updatedAt, uuid)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run('Cotton', 'Kharif', 1, '2026-06-01', now, now, uuidv4());

db.prepare(`
  INSERT INTO diary_entries (title, category, note, createdAt, updatedAt, plotId, cropId, uuid)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run('Applied fertilizer', 'Irrigation', 'Watered the crops', now, now, 1, 1, uuidv4());

db.prepare(`
  INSERT INTO finance_entries (type, amount, category, date, notes, createdAt, updatedAt, uuid)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run('expense', 1500.0, 'Seeds', '2026-06-02', 'Bought Bt cotton seeds', now, now, uuidv4());

db.prepare(`
  INSERT INTO harvests (cropId, plotId, harvestDate, quantity, quantityUnit, notes, createdAt, updatedAt, uuid)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(1, 1, '2026-11-01', 450, 'kg', 'Good yield', now, now, uuidv4());

// Verify v3 state before migration
const v3Version = db.prepare('PRAGMA user_version').get() as { user_version: number };
check('Database starts at version 3', () => {
  if (v3Version.user_version !== 3) throw new Error(`Expected version 3, got ${v3Version.user_version}`);
});

// 2. Run Version 4 Migration
function runMigrationToV4(database: DatabaseSync) {
  database.exec(`
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

  const existing = database.prepare('SELECT id FROM workspaces WHERE id = ?').get('default');
  if (!existing) {
    const migrationTime = new Date().toISOString();
    database.prepare(`
      INSERT INTO workspaces (id, name, isDefault, createdAt, updatedAt, uuid)
      VALUES (?, ?, 1, ?, ?, ?)
    `).run('default', 'Default Workspace', migrationTime, migrationTime, uuidv4());
  }

  const tables = ['plots', 'crops', 'diary_entries', 'finance_entries', 'harvests', 'farm_profile'];
  for (const table of tables) {
    const cols = database.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
    const hasWorkspaceId = cols.some(c => c.name === 'workspaceId');
    if (!hasWorkspaceId) {
      database.exec(`ALTER TABLE ${table} ADD COLUMN workspaceId TEXT;`);
    }
    database.exec(`UPDATE ${table} SET workspaceId = 'default' WHERE workspaceId IS NULL;`);
  }

  database.exec('PRAGMA user_version = 4');
}

runMigrationToV4(db);

// 3. Verifications
check('Database user_version is updated to 4', () => {
  const ver = db.prepare('PRAGMA user_version').get() as { user_version: number };
  if (ver.user_version !== 4) throw new Error(`Expected version 4, got ${ver.user_version}`);
});

check('Workspaces table exists and contains default offline workspace', () => {
  const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get('default') as any;
  if (!workspace) throw new Error('Default workspace not found in workspaces table');
  if (workspace.name !== 'Default Workspace') throw new Error(`Expected name 'Default Workspace', got '${workspace.name}'`);
  if (workspace.isDefault !== 1) throw new Error(`Expected isDefault = 1, got ${workspace.isDefault}`);
});

check('Farm profile singleton is preserved and scoped to default workspace', () => {
  const profile = db.prepare('SELECT * FROM farm_profile WHERE id = 1').get() as any;
  if (!profile) throw new Error('Farm profile not found');
  if (profile.farmName !== 'Green Valley Farm') throw new Error('Farm profile data corrupted');
  if (profile.workspaceId !== 'default') throw new Error(`Expected workspaceId 'default', got '${profile.workspaceId}'`);
});

check('Plots data is preserved and scoped to default workspace', () => {
  const plots = db.prepare('SELECT * FROM plots').all() as any[];
  if (plots.length !== 1) throw new Error(`Expected 1 plot, got ${plots.length}`);
  if (plots[0].name !== 'North Plot') throw new Error('Plot data corrupted');
  if (plots[0].workspaceId !== 'default') throw new Error('Plot workspaceId not set to default');
});

check('Crops data is preserved and scoped to default workspace', () => {
  const crops = db.prepare('SELECT * FROM crops').all() as any[];
  if (crops.length !== 1) throw new Error(`Expected 1 crop, got ${crops.length}`);
  if (crops[0].cropName !== 'Cotton') throw new Error('Crop data corrupted');
  if (crops[0].workspaceId !== 'default') throw new Error('Crop workspaceId not set to default');
});

check('Diary entries data is preserved and scoped to default workspace', () => {
  const entries = db.prepare('SELECT * FROM diary_entries').all() as any[];
  if (entries.length !== 1) throw new Error(`Expected 1 diary entry, got ${entries.length}`);
  if (entries[0].title !== 'Applied fertilizer') throw new Error('Diary entry data corrupted');
  if (entries[0].workspaceId !== 'default') throw new Error('Diary entry workspaceId not set to default');
});

check('Finance entries data is preserved and scoped to default workspace', () => {
  const finance = db.prepare('SELECT * FROM finance_entries').all() as any[];
  if (finance.length !== 1) throw new Error(`Expected 1 finance entry, got ${finance.length}`);
  if (finance[0].category !== 'Seeds') throw new Error('Finance entry data corrupted');
  if (finance[0].workspaceId !== 'default') throw new Error('Finance entry workspaceId not set to default');
});

check('Harvests data is preserved and scoped to default workspace', () => {
  const harvests = db.prepare('SELECT * FROM harvests').all() as any[];
  if (harvests.length !== 1) throw new Error(`Expected 1 harvest entry, got ${harvests.length}`);
  if (harvests[0].quantity !== 450) throw new Error('Harvest data corrupted');
  if (harvests[0].workspaceId !== 'default') throw new Error('Harvest workspaceId not set to default');
});

console.log(`\nMigration test results: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
