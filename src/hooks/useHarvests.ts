import * as SQLite from 'expo-sqlite';
import { Harvest } from '../db/schema';
import { useEntityList } from './useEntityList';
import * as harvestsRepo from '../db/harvestsRepo';

export function useHarvests(db: SQLite.SQLiteDatabase | null, ready: boolean, ownerId: string | null, workspaceId: string = 'default') {
  return useEntityList<Harvest, harvestsRepo.HarvestInput>(db, ready, ownerId, {
    list: harvestsRepo.listHarvests,
    add: harvestsRepo.addHarvest,
    update: harvestsRepo.updateHarvest,
    remove: harvestsRepo.deleteHarvest,
  }, workspaceId);
}
