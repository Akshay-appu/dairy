import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS: ${name}`);
  } catch (err) {
    failed += 1;
    console.log(`FAIL: ${name}`);
    console.log(`   ${err.message}`);
  }
}

const db = new DatabaseSync(':memory:');

db.exec(`
  CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workspaceId TEXT NOT NULL,
    tableName TEXT NOT NULL,
    collection TEXT NOT NULL,
    recordUuid TEXT NOT NULL,
    payload TEXT NOT NULL,
    userId TEXT,
    createdAt TEXT NOT NULL,
    retryCount INTEGER NOT NULL DEFAULT 0
  );
`);

check('sync_queue table is created successfully', () => {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sync_queue'").get();
  if (!row || row.name !== 'sync_queue') {
    throw new Error('sync_queue table not found');
  }
});

check('can insert and retrieve pending sync mutation', () => {
  const now = new Date().toISOString();
  const payload = JSON.stringify({ name: 'Test Plot', area: 5 });
  db.prepare(`
    INSERT INTO sync_queue (workspaceId, tableName, collection, recordUuid, payload, userId, createdAt, retryCount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('default', 'plots', 'plots', crypto.randomUUID(), payload, 'user123', now, 0);

  const items = db.prepare('SELECT * FROM sync_queue WHERE workspaceId = ?').all('default');
  if (items.length !== 1) {
    throw new Error(`Expected 1 queued item, found ${items.length}`);
  }
  if (items[0].tableName !== 'plots' || items[0].userId !== 'user123') {
    throw new Error('Queued item fields do not match');
  }
});

check('can update / deduplicate or clear sync queue item', () => {
  db.prepare('DELETE FROM sync_queue').run();
  const itemsBefore = db.prepare('SELECT COUNT(*) as cnt FROM sync_queue').get();
  if (itemsBefore.cnt !== 0) {
    throw new Error('Queue should be empty');
  }
});

console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
}
