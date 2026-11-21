import {
  collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch, type Firestore,
} from 'firebase/firestore';
import { ALL_ENTITY_SYNC_CONFIGS } from './sync';

const BATCH_LIMIT = 500;

function deletionLockRef(firestore: Firestore, uid: string) {
  return doc(firestore, `users/${uid}/meta/deletionInProgress`);
}

export async function ensureDeletionLock(firestore: Firestore, uid: string): Promise<void> {
  const ref = deletionLockRef(firestore, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { startedAt: new Date().toISOString() });
  }
}

export async function releaseDeletionLock(firestore: Firestore, uid: string): Promise<void> {
  await deleteDoc(deletionLockRef(firestore, uid));
}

export async function deleteCloudAccountData(firestore: Firestore, uid: string): Promise<void> {
  const workspacesSnap = await getDocs(collection(firestore, `users/${uid}/workspaces`));
  const workspaceIds = workspacesSnap.docs.map(d => d.id);
  const allWsIds = Array.from(new Set(['default', ...workspaceIds]));

  for (const wsId of allWsIds) {
    for (const config of ALL_ENTITY_SYNC_CONFIGS) {
      const snap = await getDocs(collection(firestore, `users/${uid}/workspaces/${wsId}/${config.collection}`));
      const refs = snap.docs.map(d => d.ref);
      for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
        const batch = writeBatch(firestore);
        for (const ref of refs.slice(i, i + BATCH_LIMIT)) batch.delete(ref);
        await batch.commit();
      }
    }
    await deleteDoc(doc(firestore, `users/${uid}/workspaces/${wsId}/meta/profile`));
  }

  const wsRefs = workspacesSnap.docs.map(d => d.ref);
  for (let i = 0; i < wsRefs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(firestore);
    for (const ref of wsRefs.slice(i, i + BATCH_LIMIT)) batch.delete(ref);
    await batch.commit();
  }

  await deleteDoc(doc(firestore, `users/${uid}/meta/profile`));
}
