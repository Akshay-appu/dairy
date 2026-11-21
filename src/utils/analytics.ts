import * as SQLite from 'expo-sqlite';
import { getFinanceTotals } from '../db/financeRepo';
import * as workspacesRepo from '../db/workspacesRepo';

export type WorkspaceDashboardMetrics = {
  workspaceId: string;
  workspaceName: string;
  plotsCount: number;
  cropsCount: number;
  activitiesCount: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  harvestsCount: number;
  totalHarvestQuantity: number;
  totalHarvestValue: number;
};

export type MultiWorkspaceAnalytics = {
  workspaces: WorkspaceDashboardMetrics[];
  totalPlotsAcrossAllWorkspaces: number;
  totalIncomeAcrossAllWorkspaces: number;
  totalExpensesAcrossAllWorkspaces: number;
  netBalanceAcrossAllWorkspaces: number;
};

export async function getWorkspaceDashboardMetrics(
  db: SQLite.SQLiteDatabase,
  ownerId: string | null,
  workspaceId: string,
  workspaceNameOverride?: string
): Promise<WorkspaceDashboardMetrics> {
  let wsName = workspaceNameOverride;
  if (!wsName) {
    const ws = await db.getFirstAsync<{ name: string }>(
      'SELECT name FROM workspaces WHERE id = ? OR uuid = ?',
      workspaceId, workspaceId
    );
    wsName = ws?.name ?? workspaceId;
  }

  const plotsRow = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM plots WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?',
    ownerId, workspaceId
  );

  const cropsRow = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM crops WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?',
    ownerId, workspaceId
  );

  const activitiesRow = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM diary_entries WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?',
    ownerId, workspaceId
  );

  const finance = await getFinanceTotals(db, ownerId, workspaceId);
  const netBalance = finance.totalIncome - finance.totalExpenses;

  const harvestRow = await db.getFirstAsync<{ cnt: number; totalQty: number; totalVal: number | null }>(
    `SELECT COUNT(*) as cnt, COALESCE(SUM(quantity), 0) as totalQty, COALESCE(SUM(sellingPrice), 0) as totalVal
     FROM harvests WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?`,
    ownerId, workspaceId
  );

  return {
    workspaceId,
    workspaceName: wsName,
    plotsCount: plotsRow?.cnt ?? 0,
    cropsCount: cropsRow?.cnt ?? 0,
    activitiesCount: activitiesRow?.cnt ?? 0,
    totalIncome: finance.totalIncome,
    totalExpenses: finance.totalExpenses,
    netBalance,
    harvestsCount: harvestRow?.cnt ?? 0,
    totalHarvestQuantity: harvestRow?.totalQty ?? 0,
    totalHarvestValue: harvestRow?.totalVal ?? 0,
  };
}

export async function getAllWorkspacesDashboardAnalytics(
  db: SQLite.SQLiteDatabase,
  ownerId: string | null
): Promise<MultiWorkspaceAnalytics> {
  const workspaces = await workspacesRepo.listWorkspaces(db, ownerId);
  const metricsList: WorkspaceDashboardMetrics[] = [];

  let totalPlots = 0;
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const ws of workspaces) {
    const wsId = ws.uuid ?? ws.id;
    const metrics = await getWorkspaceDashboardMetrics(db, ownerId, wsId, ws.name);
    metricsList.push(metrics);
    totalPlots += metrics.plotsCount;
    totalIncome += metrics.totalIncome;
    totalExpenses += metrics.totalExpenses;
  }

  return {
    workspaces: metricsList,
    totalPlotsAcrossAllWorkspaces: totalPlots,
    totalIncomeAcrossAllWorkspaces: totalIncome,
    totalExpensesAcrossAllWorkspaces: totalExpenses,
    netBalanceAcrossAllWorkspaces: totalIncome - totalExpenses,
  };
}
