import * as SQLite from 'expo-sqlite';
import { uuidv4 } from '../utils/uuid';
import { getProfile } from './profileRepo';

export type PaymentStatus = 'cash' | 'upi' | 'pending' | 'partial';

export type MarketVegetableItem = {
  id: number;
  recordId: number;
  vegetableName: string;
  grade: string;
  unit: string;
  quantity: number;
  weightPerUnitKg: number | null;
  ratePerUnit: number;
  totalAmount: number;
  sortOrder: number;
};

export type MarketVegetableItemInput = {
  vegetableName: string;
  grade?: string;
  unit?: string;
  quantity: number;
  weightPerUnitKg?: number | null;
  ratePerUnit: number;
  totalAmount?: number;
  sortOrder?: number;
};

export type MarketExpenseItem = {
  id: number;
  recordId: number;
  label: string;
  isPercentage: number;
  percentageValue: number | null;
  amount: number;
  sortOrder: number;
};

export type MarketExpenseItemInput = {
  label: string;
  isPercentage?: boolean | number;
  percentageValue?: number | null;
  amount?: number;
  sortOrder?: number;
};

type MarketRecordRow = {
  id: number;
  uuid: string;
  userId: string | null;
  workspaceId: string;
  marketDate: string;
  marketOpenTime: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
  marketName: string;
  grossIncome: number;
  totalExpense: number;
  netProfit: number;
  paymentStatus: string;
  pendingAmount: number;
  agentName: string;
  cratesSent: number;
  cratesReturned: number;
  pattiPhotoUri: string | null;
  notes: string;
  customItemsNote: string | null;
  buyerIncome: number;
  buyerExpense: number;
  settledAmount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lastSyncedAt: string | null;
};

export type MarketRecord = MarketRecordRow & {
  vegetables: MarketVegetableItem[];
  expenses: MarketExpenseItem[];
};

export type MarketRecordInput = {
  marketDate: string;
  marketOpenTime?: string;
  state?: string;
  district?: string;
  taluk?: string;
  village?: string;
  marketName?: string;
  grossIncome?: number;
  totalExpense?: number;
  netProfit?: number;
  paymentStatus?: PaymentStatus | string;
  pendingAmount?: number;
  agentName?: string;
  cratesSent?: number;
  cratesReturned?: number;
  pattiPhotoUri?: string | null;
  notes?: string;
  customItemsNote?: string | null;
  buyerIncome?: number;
  buyerExpense?: number;
  settledAmount?: number;
  vegetables: MarketVegetableItemInput[];
  expenses: MarketExpenseItemInput[];
};

export type MarketLocationDefaults = {
  state: string;
  district: string;
  taluk: string;
  village: string;
  marketName: string;
};

export type MarketEntitySummary = {
  key: string;
  marketName: string;
  agentName: string;
  displayName: string;
  locationSummary: string;
  tripsCount: number;
  totalBoxesUnits: number;
  totalItemLines: number;
  grossIncome: number;
  totalExpense: number;
  netProfit: number;
  pendingBaaki: number;
  pendingCrates: number;
  settledAmount: number;
  buyerIncome: number;
  buyerExpense: number;
  buyerNet: number;
  latestMarketDate: string;
};

/**
 * Returns a deterministic, human-readable slip reference code such as `BS-20261128-42`.
 */
export function formatMarketSlipCode(
  record: Pick<MarketRecord, 'id' | 'marketDate'>
): string {
  const digits = (record.marketDate ?? '').replace(/\D/g, '').slice(0, 8);
  const datePart = digits.length === 8 ? digits : '00000000';
  const idPart = Number.isFinite(record.id) ? Math.trunc(record.id) : 0;
  return `BS-${datePart}-${idPart}`;
}

/**
 * Groups market slips by normalized (marketName, agentName) pair and aggregates
 * trips, boxes/units, gross income, expenses, net profit, and pending baaki/crates.
 */
export function summarizeMarketByBuyerOrMarket(
  records: MarketRecord[]
): MarketEntitySummary[] {
  const groups = new Map<
    string,
    {
      marketName: string;
      agentName: string;
      state: string;
      district: string;
      taluk: string;
      village: string;
      tripsCount: number;
      totalBoxesUnits: number;
      totalItemLines: number;
      grossIncome: number;
      totalExpense: number;
      netProfit: number;
      pendingBaaki: number;
      pendingCrates: number;
      settledAmount: number;
      buyerIncome: number;
      buyerExpense: number;
      latestMarketDate: string;
    }
  >();

  for (const r of records) {
    const marketName = (r.marketName ?? '').trim();
    const agentName = (r.agentName ?? '').trim();
    const key = `${marketName.toLowerCase()}||${agentName.toLowerCase()}`;
    const boxesUnits = (r.vegetables ?? []).reduce(
      (sum, v) => sum + (Number.isFinite(v.quantity) ? v.quantity : 0),
      0
    );
    const itemLines = (r.vegetables ?? []).length;
    const pendingCrates = Math.max(0, (r.cratesSent ?? 0) - (r.cratesReturned ?? 0));
    const settledAmt = toFiniteNumber(r.settledAmount, 0);
    const buyerInc = toFiniteNumber(r.buyerIncome, 0);
    const buyerExp = toFiniteNumber(r.buyerExpense, 0);

    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, {
        marketName,
        agentName,
        state: (r.state ?? '').trim(),
        district: (r.district ?? '').trim(),
        taluk: (r.taluk ?? '').trim(),
        village: (r.village ?? '').trim(),
        tripsCount: 1,
        totalBoxesUnits: boxesUnits,
        totalItemLines: itemLines,
        grossIncome: r.grossIncome,
        totalExpense: r.totalExpense,
        netProfit: r.netProfit,
        pendingBaaki: r.pendingAmount,
        pendingCrates,
        settledAmount: settledAmt,
        buyerIncome: buyerInc,
        buyerExpense: buyerExp,
        latestMarketDate: r.marketDate,
      });
    } else {
      existing.tripsCount += 1;
      existing.totalBoxesUnits += boxesUnits;
      existing.totalItemLines += itemLines;
      existing.grossIncome += r.grossIncome;
      existing.totalExpense += r.totalExpense;
      existing.netProfit += r.netProfit;
      existing.pendingBaaki += r.pendingAmount;
      existing.pendingCrates += pendingCrates;
      existing.settledAmount += settledAmt;
      existing.buyerIncome += buyerInc;
      existing.buyerExpense += buyerExp;
      if (r.marketDate >= existing.latestMarketDate) {
        existing.latestMarketDate = r.marketDate;
        if (r.state?.trim()) existing.state = r.state.trim();
        if (r.district?.trim()) existing.district = r.district.trim();
        if (r.taluk?.trim()) existing.taluk = r.taluk.trim();
        if (r.village?.trim()) existing.village = r.village.trim();
      } else {
        if (!existing.state && r.state?.trim()) existing.state = r.state.trim();
        if (!existing.district && r.district?.trim()) existing.district = r.district.trim();
        if (!existing.taluk && r.taluk?.trim()) existing.taluk = r.taluk.trim();
        if (!existing.village && r.village?.trim()) existing.village = r.village.trim();
      }
    }
  }

  const results: MarketEntitySummary[] = [];
  for (const [key, g] of groups.entries()) {
    const displayName = [g.marketName, g.agentName].filter(Boolean).join(' · ');
    const locationSummary = [g.state, g.district, g.taluk, g.village]
      .filter(Boolean)
      .join(' · ');
    const buyerIncome = Math.round(g.buyerIncome * 100) / 100;
    const buyerExpense = Math.round(g.buyerExpense * 100) / 100;
    results.push({
      key,
      marketName: g.marketName,
      agentName: g.agentName,
      displayName,
      locationSummary,
      tripsCount: g.tripsCount,
      totalBoxesUnits: Math.round(g.totalBoxesUnits * 100) / 100,
      totalItemLines: g.totalItemLines,
      grossIncome: Math.round(g.grossIncome * 100) / 100,
      totalExpense: Math.round(g.totalExpense * 100) / 100,
      netProfit: Math.round(g.netProfit * 100) / 100,
      pendingBaaki: Math.round(g.pendingBaaki * 100) / 100,
      pendingCrates: g.pendingCrates,
      settledAmount: Math.round(g.settledAmount * 100) / 100,
      buyerIncome,
      buyerExpense,
      buyerNet: Math.round((buyerIncome - buyerExpense) * 100) / 100,
      latestMarketDate: g.latestMarketDate,
    });
  }

  results.sort((a, b) => {
    if (b.netProfit !== a.netProfit) return b.netProfit - a.netProfit;
    if (b.tripsCount !== a.tripsCount) return b.tripsCount - a.tripsCount;
    return b.latestMarketDate.localeCompare(a.latestMarketDate);
  });

  return results;
}

function toFiniteNumber(val: unknown, fallback: number = 0): number {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}

function toNullableFiniteNumber(val: unknown): number | null {
  return typeof val === 'number' && Number.isFinite(val) ? val : null;
}

function normalizeMarketRecordInput(input: MarketRecordInput) {
  const vegetables = (input.vegetables ?? []).map((item, idx) => {
    const quantity = toFiniteNumber(item.quantity, 0);
    const ratePerUnit = toFiniteNumber(item.ratePerUnit, 0);
    const totalAmount =
      item.totalAmount !== undefined && Number.isFinite(item.totalAmount)
        ? item.totalAmount
        : quantity * ratePerUnit;
    return {
      vegetableName: (item.vegetableName ?? '').trim(),
      grade: (item.grade ?? '').trim(),
      unit: (item.unit ?? 'box').trim() || 'box',
      quantity,
      weightPerUnitKg: toNullableFiniteNumber(item.weightPerUnitKg),
      ratePerUnit,
      totalAmount,
      sortOrder: item.sortOrder !== undefined ? Math.round(toFiniteNumber(item.sortOrder, idx)) : idx,
    };
  });

  const computedGross = vegetables.reduce((sum, item) => sum + item.totalAmount, 0);
  const grossIncome =
    input.grossIncome !== undefined && Number.isFinite(input.grossIncome)
      ? input.grossIncome
      : computedGross;

  const expenses = (input.expenses ?? []).map((item, idx) => {
    const isPercentage = item.isPercentage ? 1 : 0;
    const percentageValue = isPercentage ? toNullableFiniteNumber(item.percentageValue) : null;
    const computedAmount =
      isPercentage && percentageValue !== null
        ? (grossIncome * percentageValue) / 100
        : 0;
    const amount =
      item.amount !== undefined && Number.isFinite(item.amount)
        ? item.amount
        : computedAmount;
    return {
      label: (item.label ?? '').trim(),
      isPercentage,
      percentageValue,
      amount,
      sortOrder: item.sortOrder !== undefined ? Math.round(toFiniteNumber(item.sortOrder, idx)) : idx,
    };
  });

  const computedExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense =
    input.totalExpense !== undefined && Number.isFinite(input.totalExpense)
      ? input.totalExpense
      : computedExpense;
  const netProfit =
    input.netProfit !== undefined && Number.isFinite(input.netProfit)
      ? input.netProfit
      : grossIncome - totalExpense;

  return {
    marketDate: input.marketDate.trim(),
    marketOpenTime: (input.marketOpenTime ?? '03:30').trim() || '03:30',
    state: (input.state ?? '').trim(),
    district: (input.district ?? '').trim(),
    taluk: (input.taluk ?? '').trim(),
    village: (input.village ?? '').trim(),
    marketName: (input.marketName ?? '').trim(),
    grossIncome,
    totalExpense,
    netProfit,
    paymentStatus: (input.paymentStatus ?? 'cash').trim() || 'cash',
    pendingAmount: toFiniteNumber(input.pendingAmount, 0),
    agentName: (input.agentName ?? '').trim(),
    cratesSent: Math.max(0, Math.round(toFiniteNumber(input.cratesSent, 0))),
    cratesReturned: Math.max(0, Math.round(toFiniteNumber(input.cratesReturned, 0))),
    pattiPhotoUri: input.pattiPhotoUri ?? null,
    notes: (input.notes ?? '').trim(),
    customItemsNote: (input.customItemsNote ?? '').trim() || null,
    buyerIncome: Math.max(0, toFiniteNumber(input.buyerIncome, 0)),
    buyerExpense: Math.max(0, toFiniteNumber(input.buyerExpense, 0)),
    settledAmount: Math.max(0, toFiniteNumber(input.settledAmount, 0)),
    vegetables,
    expenses,
  };
}

export async function listMarketRecords(
  db: SQLite.SQLiteDatabase,
  ownerId: string | null,
  workspaceId: string = 'default'
): Promise<MarketRecord[]> {
  let hydratedRecords: MarketRecord[] = [];
  await db.withTransactionAsync(async () => {
    const records = await db.getAllAsync<MarketRecordRow>(
      `SELECT * FROM market_records
       WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?
       ORDER BY marketDate DESC, id DESC`,
      ownerId,
      workspaceId
    );

    if (records.length === 0) {
      hydratedRecords = [];
      return;
    }

    const recordIds = records.map(r => r.id);
    const placeholders = recordIds.map(() => '?').join(', ');

    const [vegRows, expenseRows] = await Promise.all([
      db.getAllAsync<MarketVegetableItem>(
        `SELECT * FROM market_vegetable_items
         WHERE recordId IN (${placeholders})
         ORDER BY sortOrder ASC, id ASC`,
        ...recordIds
      ),
      db.getAllAsync<MarketExpenseItem>(
        `SELECT * FROM market_expenses
         WHERE recordId IN (${placeholders})
         ORDER BY sortOrder ASC, id ASC`,
        ...recordIds
      ),
    ]);

    const vegByRecord = new Map<number, MarketVegetableItem[]>();
    for (const item of vegRows) {
      const list = vegByRecord.get(item.recordId);
      if (list) list.push(item);
      else vegByRecord.set(item.recordId, [item]);
    }

    const expenseByRecord = new Map<number, MarketExpenseItem[]>();
    for (const item of expenseRows) {
      const list = expenseByRecord.get(item.recordId);
      if (list) list.push(item);
      else expenseByRecord.set(item.recordId, [item]);
    }

    hydratedRecords = records.map(record => ({
      ...record,
      customItemsNote: record.customItemsNote ?? null,
      buyerIncome: toFiniteNumber(record.buyerIncome, 0),
      buyerExpense: toFiniteNumber(record.buyerExpense, 0),
      settledAmount: toFiniteNumber(record.settledAmount, 0),
      vegetables: vegByRecord.get(record.id) ?? [],
      expenses: expenseByRecord.get(record.id) ?? [],
    }));
  });

  return hydratedRecords;
}

export async function addMarketRecord(
  db: SQLite.SQLiteDatabase,
  input: MarketRecordInput,
  ownerId: string | null,
  workspaceId: string = 'default'
): Promise<number> {
  const normalized = normalizeMarketRecordInput(input);
  const now = new Date().toISOString();
  const uuid = uuidv4();
  let insertedId = 0;

  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      `INSERT INTO market_records (
        uuid, userId, workspaceId,
        marketDate, marketOpenTime,
        state, district, taluk, village, marketName,
        grossIncome, totalExpense, netProfit,
        paymentStatus, pendingAmount, agentName,
        cratesSent, cratesReturned,
        pattiPhotoUri, notes,
        customItemsNote, buyerIncome, buyerExpense, settledAmount,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      uuid,
      ownerId,
      workspaceId,
      normalized.marketDate,
      normalized.marketOpenTime,
      normalized.state,
      normalized.district,
      normalized.taluk,
      normalized.village,
      normalized.marketName,
      normalized.grossIncome,
      normalized.totalExpense,
      normalized.netProfit,
      normalized.paymentStatus,
      normalized.pendingAmount,
      normalized.agentName,
      normalized.cratesSent,
      normalized.cratesReturned,
      normalized.pattiPhotoUri,
      normalized.notes,
      normalized.customItemsNote,
      normalized.buyerIncome,
      normalized.buyerExpense,
      normalized.settledAmount,
      now,
      now
    );

    insertedId = result.lastInsertRowId;

    for (const veg of normalized.vegetables) {
      await db.runAsync(
        `INSERT INTO market_vegetable_items (
          recordId, vegetableName, grade, unit, quantity, weightPerUnitKg, ratePerUnit, totalAmount, sortOrder
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        insertedId,
        veg.vegetableName,
        veg.grade,
        veg.unit,
        veg.quantity,
        veg.weightPerUnitKg,
        veg.ratePerUnit,
        veg.totalAmount,
        veg.sortOrder
      );
    }

    for (const exp of normalized.expenses) {
      await db.runAsync(
        `INSERT INTO market_expenses (
          recordId, label, isPercentage, percentageValue, amount, sortOrder
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        insertedId,
        exp.label,
        exp.isPercentage,
        exp.percentageValue,
        exp.amount,
        exp.sortOrder
      );
    }
  });

  return insertedId;
}

export async function updateMarketRecord(
  db: SQLite.SQLiteDatabase,
  id: number,
  input: MarketRecordInput,
  ownerId: string | null,
  workspaceId: string = 'default'
): Promise<void> {
  const normalized = normalizeMarketRecordInput(input);
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      `UPDATE market_records SET
        marketDate = ?, marketOpenTime = ?,
        state = ?, district = ?, taluk = ?, village = ?, marketName = ?,
        grossIncome = ?, totalExpense = ?, netProfit = ?,
        paymentStatus = ?, pendingAmount = ?, agentName = ?,
        cratesSent = ?, cratesReturned = ?,
        pattiPhotoUri = ?, notes = ?,
        customItemsNote = ?, buyerIncome = ?, buyerExpense = ?, settledAmount = ?,
        updatedAt = ?
       WHERE id = ? AND (userId IS ?) AND workspaceId = ? AND deletedAt IS NULL`,
      normalized.marketDate,
      normalized.marketOpenTime,
      normalized.state,
      normalized.district,
      normalized.taluk,
      normalized.village,
      normalized.marketName,
      normalized.grossIncome,
      normalized.totalExpense,
      normalized.netProfit,
      normalized.paymentStatus,
      normalized.pendingAmount,
      normalized.agentName,
      normalized.cratesSent,
      normalized.cratesReturned,
      normalized.pattiPhotoUri,
      normalized.notes,
      normalized.customItemsNote,
      normalized.buyerIncome,
      normalized.buyerExpense,
      normalized.settledAmount,
      now,
      id,
      ownerId,
      workspaceId
    );

    if (result.changes === 0) {
      return;
    }

    await db.runAsync('DELETE FROM market_vegetable_items WHERE recordId = ?', id);
    for (const veg of normalized.vegetables) {
      await db.runAsync(
        `INSERT INTO market_vegetable_items (
          recordId, vegetableName, grade, unit, quantity, weightPerUnitKg, ratePerUnit, totalAmount, sortOrder
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        veg.vegetableName,
        veg.grade,
        veg.unit,
        veg.quantity,
        veg.weightPerUnitKg,
        veg.ratePerUnit,
        veg.totalAmount,
        veg.sortOrder
      );
    }

    await db.runAsync('DELETE FROM market_expenses WHERE recordId = ?', id);
    for (const exp of normalized.expenses) {
      await db.runAsync(
        `INSERT INTO market_expenses (
          recordId, label, isPercentage, percentageValue, amount, sortOrder
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        id,
        exp.label,
        exp.isPercentage,
        exp.percentageValue,
        exp.amount,
        exp.sortOrder
      );
    }
  });
}

export async function deleteMarketRecord(
  db: SQLite.SQLiteDatabase,
  id: number,
  ownerId: string | null,
  workspaceId: string = 'default'
): Promise<void> {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE market_records
       SET deletedAt = ?, updatedAt = ?
       WHERE id = ? AND (userId IS ?) AND workspaceId = ? AND deletedAt IS NULL`,
      now,
      now,
      id,
      ownerId,
      workspaceId
    );
  });
}

export async function getLastMarketLocation(
  db: SQLite.SQLiteDatabase,
  ownerId: string | null,
  workspaceId: string = 'default'
): Promise<MarketLocationDefaults> {
  const [lastRecord, profile] = await Promise.all([
    db.getFirstAsync<{
      state: string;
      district: string;
      taluk: string;
      village: string;
      marketName: string;
    }>(
      `SELECT state, district, taluk, village, marketName
       FROM market_records
       WHERE deletedAt IS NULL AND (userId IS ?) AND workspaceId = ?
       ORDER BY marketDate DESC, id DESC
       LIMIT 1`,
      ownerId,
      workspaceId
    ),
    getProfile(db, ownerId, workspaceId),
  ]);

  return {
    state: lastRecord?.state?.trim() || profile?.state?.trim() || '',
    district: lastRecord?.district?.trim() || profile?.district?.trim() || '',
    taluk: lastRecord?.taluk?.trim() || profile?.taluk?.trim() || '',
    village: lastRecord?.village?.trim() || profile?.village?.trim() || '',
    marketName: lastRecord?.marketName?.trim() || '',
  };
}
