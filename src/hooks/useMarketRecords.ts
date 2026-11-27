import * as SQLite from 'expo-sqlite';
import { useCallback } from 'react';
import * as marketRecordsRepo from '../db/marketRecordsRepo';
import type {
  MarketLocationDefaults,
  MarketRecord,
  MarketRecordInput,
} from '../db/marketRecordsRepo';
import { useEntityList } from './useEntityList';

export function useMarketRecords(
  db: SQLite.SQLiteDatabase | null,
  ready: boolean,
  ownerId: string | null,
  workspaceId: string = 'default'
) {
  const listState = useEntityList<MarketRecord, MarketRecordInput>(
    db,
    ready,
    ownerId,
    {
      list: marketRecordsRepo.listMarketRecords,
      add: async (database, input, owner, wsId) => {
        await marketRecordsRepo.addMarketRecord(database, input, owner, wsId);
      },
      update: marketRecordsRepo.updateMarketRecord,
      remove: marketRecordsRepo.deleteMarketRecord,
    },
    workspaceId
  );

  const getLastLocation = useCallback(async (): Promise<MarketLocationDefaults> => {
    if (!db) {
      return { state: '', district: '', taluk: '', village: '', marketName: '' };
    }
    return marketRecordsRepo.getLastMarketLocation(db, ownerId, workspaceId);
  }, [db, ownerId, workspaceId]);

  return {
    ...listState,
    getLastLocation,
  };
}
