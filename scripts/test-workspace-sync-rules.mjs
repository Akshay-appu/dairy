// Verification script for workspace-scoped multi-user cloud synchronization rules.
import {
  initializeTestEnvironment, assertSucceeds, assertFails,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const PROJECT_ID = 'demo-bhoomishakti-ws';

let passed = 0;
let failed = 0;

async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS: ${name}`);
  } catch (err) {
    failed += 1;
    console.log(`FAIL: ${name}`);
    console.log(`   ${err.message}`);
  }
}

const testEnv = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: {
    rules: readFileSync('firestore.rules', 'utf8'),
    host: 'localhost',
    port: 8080,
  },
});

const alice = testEnv.authenticatedContext('alice-uid');
const bob = testEnv.authenticatedContext('bob-uid');
const anon = testEnv.unauthenticatedContext();

await check('alice can create and update her own workspace', async () => {
  await assertSucceeds(setDoc(doc(alice.firestore(), 'users/alice-uid/workspaces/ws-default'), { name: 'Default Workspace', isDefault: 1 }));
  await assertSucceeds(setDoc(doc(alice.firestore(), 'users/alice-uid/workspaces/ws-custom'), { name: 'South Farm', isDefault: 0 }, { merge: true }));
});

await check('alice can write plots and crops inside her workspace', async () => {
  await assertSucceeds(setDoc(doc(alice.firestore(), 'users/alice-uid/workspaces/ws-custom/plots/plot1'), { name: 'North Field', area: 2.5 }));
  await assertSucceeds(setDoc(doc(alice.firestore(), 'users/alice-uid/workspaces/ws-custom/crops/crop1'), { cropName: 'Soybean', season: 'kharif' }));
});

await check('alice can read back her workspace entities', async () => {
  const snap = await getDoc(doc(alice.firestore(), 'users/alice-uid/workspaces/ws-custom/plots/plot1'));
  if (!snap.exists() || snap.data().name !== 'North Field') throw new Error('expected plot to match');
});

await check('bob CANNOT read alice\'s workspace or workspace plots', async () => {
  await assertFails(getDoc(doc(bob.firestore(), 'users/alice-uid/workspaces/ws-custom')));
  await assertFails(getDoc(doc(bob.firestore(), 'users/alice-uid/workspaces/ws-custom/plots/plot1')));
});

await check('bob CANNOT write into alice\'s workspaces', async () => {
  await assertFails(setDoc(doc(bob.firestore(), 'users/alice-uid/workspaces/ws-intrusion'), { name: 'Hack' }));
  await assertFails(setDoc(doc(bob.firestore(), 'users/alice-uid/workspaces/ws-custom/plots/plot2'), { name: 'Intrusion Plot' }));
});

await check('account deletion lock blocks writes under workspaces for alice', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users/alice-uid/meta/deletionInProgress'), { startedAt: new Date().toISOString() });
  });

  await assertFails(setDoc(doc(alice.firestore(), 'users/alice-uid/workspaces/ws-custom/plots/plot3'), { name: 'Blocked' }));
  await assertSucceeds(getDoc(doc(alice.firestore(), 'users/alice-uid/workspaces/ws-custom/plots/plot1')));
});

await testEnv.cleanup();

console.log(`\nWorkspace Sync Rules Tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
