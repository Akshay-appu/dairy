import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import {
  formatMarketSlipCode,
  summarizeMarketByBuyerOrMarket,
  type FarmProfile,
  type MarketRecord,
} from '../db/schema';
import type { Copy, Language } from '../i18n/copy';
import { marketPaymentStatusLabel, marketUnitLabel } from '../i18n/vocab';
import { formatDisplayTime12h, formatINR } from '../utils/format';
import { downloadTextFile } from '../utils/share';
import { utf8ToBase64 } from './googleDriveSync';

function sanitizeFilenamePart(raw: string): string {
  const cleaned = raw.trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'market';
}

function escapeHtml(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  let str = String(value);
  if (/^[=+@]/.test(str) || (/^-/.test(str) && Number.isNaN(Number(str)))) {
    str = `'${str}`;
  }
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatLocationLine(record: MarketRecord): string {
  return [record.village, record.taluk, record.district, record.state]
    .map(p => p.trim())
    .filter(Boolean)
    .join(', ');
}

function buildMarketPattiHtml(
  record: MarketRecord,
  t: Copy,
  language: Language,
  workspaceName: string,
  farmProfile?: FarmProfile | null
): string {
  const locationLine = formatLocationLine(record);
  const timeLabel = formatDisplayTime12h(record.marketOpenTime);
  const paymentLabel = marketPaymentStatusLabel(language, record.paymentStatus);
  const pendingCrates = Math.max(0, record.cratesSent - record.cratesReturned);
  const isLoss = record.netProfit < 0;
  const slipCode = formatMarketSlipCode(record);
  const hasBuyerAccounting = (record.buyerIncome ?? 0) > 0 || (record.buyerExpense ?? 0) > 0;
  const buyerNet = Math.round(((record.buyerIncome ?? 0) - (record.buyerExpense ?? 0)) * 100) / 100;

  const farmerMeta = [
    farmProfile?.farmName,
    farmProfile?.farmerName,
  ]
    .filter(Boolean)
    .join(' · ');

  const vegRows = record.vegetables
    .map((v, idx) => {
      const unitText = marketUnitLabel(language, v.unit);
      const qtyText =
        v.weightPerUnitKg != null && v.weightPerUnitKg > 0
          ? `${v.quantity} ${unitText} (${v.weightPerUnitKg} kg)`
          : `${v.quantity} ${unitText}`;
      return `<tr>
        <td>${idx + 1}</td>
        <td><strong>${escapeHtml(v.vegetableName)}</strong></td>
        <td>${escapeHtml(v.grade || '—')}</td>
        <td>${escapeHtml(qtyText)}</td>
        <td class="num">${escapeHtml(formatINR(v.ratePerUnit))}</td>
        <td class="num">${escapeHtml(formatINR(v.totalAmount))}</td>
      </tr>`;
    })
    .join('');

  const expenseRows = record.expenses
    .map((e, idx) => {
      const modeText =
        e.isPercentage && e.percentageValue != null
          ? `${e.percentageValue}%`
          : t.expenseFlatToggle;
      return `<tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(e.label)}</td>
        <td>${escapeHtml(modeText)}</td>
        <td class="num neg">${escapeHtml(formatINR(e.amount))}</td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(language)}">
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #183326; margin: 0; padding: 22px; font-size: 12px; line-height: 1.45; }
    .patti-header { background: #246B3B; color: #FFFFFF; padding: 16px 20px; border-radius: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
    .patti-header h1 { margin: 0; font-size: 18px; letter-spacing: 0.6px; }
    .patti-header p { margin: 3px 0 0; font-size: 11px; opacity: 0.92; }
    .patti-badge { background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 6px 10px; text-align: right; font-size: 11px; font-weight: 700; }
    .patti-ref { font-size: 12px; letter-spacing: 0.4px; margin-bottom: 2px; }
    .meta-grid { display: flex; flex-wrap: wrap; gap: 10px; background: #F4FAF5; border: 1px solid #D5EBD9; border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; }
    .meta-item { flex: 1; min-width: 180px; font-size: 11px; }
    .meta-item strong { color: #246B3B; display: block; font-size: 10px; text-transform: uppercase; margin-bottom: 2px; }
    h2 { font-size: 13px; color: #246B3B; border-bottom: 2px solid #E0EFE2; padding-bottom: 4px; margin: 14px 0 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    th, td { border: 1px solid #E2ECE4; padding: 7px 8px; text-align: left; font-size: 11px; }
    th { background: #F0F8F1; color: #183326; font-weight: 700; }
    td.num, th.num { text-align: right; font-weight: 700; white-space: nowrap; }
    .neg { color: #B3261E; }
    .settlement-box { border: 2px solid ${isLoss ? '#DC2626' : '#246B3B'}; background: ${isLoss ? '#FEF2F2' : '#F0FDF4'}; border-radius: 12px; padding: 14px 16px; margin-top: 14px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
    .summary-row.total { border-top: 1.5px dashed #A7C4AE; padding-top: 8px; margin-top: 8px; margin-bottom: 0; font-size: 16px; font-weight: 800; color: ${isLoss ? '#B91C1C' : '#15803D'}; }
    .pills-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .pill { display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; background: #F0F4F1; color: #183326; border: 1px solid #DCE8DE; }
    .pill-warn { background: #FEF3C7; color: #92400E; border-color: #FCD34D; }
    .notes-box { margin-top: 12px; padding: 10px 12px; background: #FAFDFB; border: 1px solid #E2ECE4; border-radius: 8px; font-size: 11px; }
    .empty { color: #66756B; font-style: italic; margin: 4px 0 10px; font-size: 11px; }
    .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #E2ECE4; font-size: 10px; color: #66756B; text-align: center; }
  </style>
</head>
<body>
  <div class="patti-header">
    <div>
      <h1>${escapeHtml(t.marketPattiTitle)}</h1>
      <p>BS DIARY · BHOOMISHAKTI${farmerMeta ? ` · ${escapeHtml(farmerMeta)}` : ''}</p>
    </div>
    <div class="patti-badge">
      <div class="patti-ref">${escapeHtml(slipCode)}</div>
      <div>${escapeHtml(record.marketDate)} · ${escapeHtml(timeLabel)}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <strong>${escapeHtml(t.marketSlipRefLabel)}</strong>
      ${escapeHtml(slipCode)}
    </div>
    <div class="meta-item">
      <strong>${escapeHtml(t.marketNameLabel)}</strong>
      ${escapeHtml(record.marketName || '—')}
    </div>
    <div class="meta-item">
      <strong>${escapeHtml(t.marketLocationHeading)}</strong>
      ${escapeHtml(locationLine || '—')}
    </div>
    <div class="meta-item">
      <strong>${escapeHtml(t.reportWorkspaceLabel)}</strong>
      ${escapeHtml(workspaceName || 'Default')}
    </div>
  </div>

  <h2>${escapeHtml(t.vegetableBoxesHeading)} (${record.vegetables.length})</h2>
  ${
    record.vegetables.length
      ? `<table>
          <thead>
            <tr>
              <th>#</th>
              <th>${escapeHtml(t.vegetableNameLabel)}</th>
              <th>${escapeHtml(t.gradeOptionalLabel)}</th>
              <th>${escapeHtml(t.quantity)}</th>
              <th class="num">${escapeHtml(t.ratePerUnitLabel)}</th>
              <th class="num">${escapeHtml(t.lineTotalLabel)}</th>
            </tr>
          </thead>
          <tbody>${vegRows}</tbody>
        </table>`
      : `<p class="empty">${escapeHtml(t.reportNoRecords)}</p>`
  }

  ${record.customItemsNote ? `<div class="notes-box"><strong>${escapeHtml(t.customItemsNoteLabel)}:</strong> ${escapeHtml(record.customItemsNote)}</div>` : ''}

  <h2>${escapeHtml(t.marketExpensesHeading)} (${record.expenses.length})</h2>
  ${
    record.expenses.length
      ? `<table>
          <thead>
            <tr>
              <th>#</th>
              <th>${escapeHtml(t.financeCategory)}</th>
              <th>${escapeHtml(t.unit)}</th>
              <th class="num">${escapeHtml(t.amount)}</th>
            </tr>
          </thead>
          <tbody>${expenseRows}</tbody>
        </table>`
      : `<p class="empty">${escapeHtml(t.reportNoRecords)}</p>`
  }

  <div class="settlement-box">
    <div class="summary-row">
      <span>${escapeHtml(t.marketGrossIncome)}</span>
      <strong>${escapeHtml(formatINR(record.grossIncome))}</strong>
    </div>
    <div class="summary-row">
      <span>${escapeHtml(t.marketTotalExpenses)}</span>
      <strong class="neg">- ${escapeHtml(formatINR(record.totalExpense))}</strong>
    </div>
    <div class="summary-row total">
      <span>${escapeHtml(isLoss ? t.marketNetLoss : t.marketNetProfit)}</span>
      <span>${escapeHtml(formatINR(record.netProfit))}</span>
    </div>
  </div>

  <div class="pills-row">
    <span class="pill">${escapeHtml(t.paymentStatusLabel)}: ${escapeHtml(paymentLabel)}</span>
    ${record.agentName ? `<span class="pill">${escapeHtml(t.agentNameLabel)}: ${escapeHtml(record.agentName)}</span>` : ''}
    ${(record.settledAmount ?? 0) > 0 ? `<span class="pill">${escapeHtml(t.settledAmountLabel)}: ${escapeHtml(formatINR(record.settledAmount))}</span>` : ''}
    ${record.pendingAmount > 0 ? `<span class="pill pill-warn">${escapeHtml(t.pendingBaaki)}: ${escapeHtml(formatINR(record.pendingAmount))}</span>` : ''}
    ${(record.cratesSent > 0 || record.cratesReturned > 0) ? `<span class="pill ${pendingCrates > 0 ? 'pill-warn' : ''}">${escapeHtml(t.cratesSentLabel)}: ${record.cratesSent} · ${escapeHtml(t.cratesReturnedLabel)}: ${record.cratesReturned}${pendingCrates > 0 ? ` (${escapeHtml(t.cratesPendingBadge.replace('{count}', String(pendingCrates)))})` : ''}</span>` : ''}
  </div>

  ${
    hasBuyerAccounting
      ? `<div class="notes-box">
          <strong>${escapeHtml(t.buyerMarketerSectionHeading)}</strong><br/>
          ${escapeHtml(t.buyerIncomeLabel)}: <strong>${escapeHtml(formatINR(record.buyerIncome))}</strong> ·
          ${escapeHtml(t.buyerExpenseLabel)}: <strong class="neg">${escapeHtml(formatINR(record.buyerExpense))}</strong> ·
          ${escapeHtml(t.buyerMarketerNetLabel)}: <strong${buyerNet < 0 ? ' class="neg"' : ''}>${escapeHtml(formatINR(buyerNet))}</strong>
        </div>`
      : ''
  }

  ${record.notes ? `<div class="notes-box"><strong>${escapeHtml(t.notes)}:</strong> ${escapeHtml(record.notes)}</div>` : ''}

  <div class="footer">${escapeHtml(t.marketPattiFooter)}</div>
</body>
</html>`;
}

function buildSingleRecordCsv(
  record: MarketRecord,
  t: Copy,
  language: Language,
  workspaceName: string
): string {
  const rows: (string | number | null | undefined)[][] = [];
  const pendingCrates = Math.max(0, record.cratesSent - record.cratesReturned);
  const slipCode = formatMarketSlipCode(record);

  rows.push([
    t.marketPattiTitle,
    t.marketSlipRefLabel,
    slipCode,
    workspaceName,
    record.marketDate,
    formatDisplayTime12h(record.marketOpenTime),
  ]);
  rows.push([t.marketNameLabel, record.marketName, t.village, record.village, t.taluk, record.taluk, t.district, record.district, t.stateField, record.state]);
  rows.push([
    t.paymentStatusLabel,
    marketPaymentStatusLabel(language, record.paymentStatus),
    t.settledAmountLabel,
    record.settledAmount ?? 0,
    t.pendingBaaki,
    record.pendingAmount,
    t.agentNameLabel,
    record.agentName,
    t.cratesSentLabel,
    record.cratesSent,
    t.cratesReturnedLabel,
    record.cratesReturned,
    t.pendingCrates,
    pendingCrates,
  ]);
  if (record.customItemsNote) {
    rows.push([t.customItemsNoteLabel, record.customItemsNote]);
  }
  rows.push([]);

  rows.push([t.vegetableBoxesHeading]);
  rows.push([
    t.vegetableNameLabel,
    t.gradeOptionalLabel,
    t.quantity,
    t.unit,
    t.weightPerUnitLabel,
    t.ratePerUnitLabel,
    t.lineTotalLabel,
  ]);
  for (const v of record.vegetables) {
    rows.push([
      v.vegetableName,
      v.grade,
      v.quantity,
      marketUnitLabel(language, v.unit),
      v.weightPerUnitKg ?? '',
      v.ratePerUnit,
      v.totalAmount,
    ]);
  }
  rows.push([]);

  rows.push([t.marketExpensesHeading]);
  rows.push([t.financeCategory, t.expensePercentToggle, t.amount]);
  for (const e of record.expenses) {
    rows.push([
      e.label,
      e.isPercentage && e.percentageValue != null ? `${e.percentageValue}%` : '',
      e.amount,
    ]);
  }
  rows.push([]);

  rows.push([t.marketGrossIncome, record.grossIncome]);
  rows.push([t.marketTotalExpenses, record.totalExpense]);
  rows.push([t.marketNetProfit, record.netProfit]);
  if ((record.buyerIncome ?? 0) > 0 || (record.buyerExpense ?? 0) > 0) {
    rows.push([]);
    rows.push([t.buyerMarketerSectionHeading]);
    rows.push([t.buyerIncomeLabel, record.buyerIncome ?? 0]);
    rows.push([t.buyerExpenseLabel, record.buyerExpense ?? 0]);
    rows.push([t.buyerMarketerNetLabel, Math.round(((record.buyerIncome ?? 0) - (record.buyerExpense ?? 0)) * 100) / 100]);
  }
  if (record.notes) {
    rows.push([t.notes, record.notes]);
  }

  const csvBody = rows.map(row => row.map(escapeCsvCell).join(',')).join('\r\n');
  return `\uFEFF${csvBody}`;
}

function buildLedgerCsv(
  records: MarketRecord[],
  t: Copy,
  language: Language,
  workspaceName: string
): string {
  const rows: (string | number | null | undefined)[][] = [];
  rows.push([t.dailyMarket, workspaceName, new Date().toISOString().slice(0, 10)]);
  rows.push([]);
  rows.push([
    t.marketSlipRefLabel,
    t.marketDateLabel,
    t.marketTimeLabel,
    t.marketNameLabel,
    t.village,
    t.taluk,
    t.district,
    t.stateField,
    t.vegetableBoxesHeading,
    t.customItemsNoteLabel,
    t.marketGrossIncome,
    t.marketTotalExpenses,
    t.marketNetProfit,
    t.paymentStatusLabel,
    t.settledAmountLabel,
    t.pendingBaaki,
    t.agentNameLabel,
    t.buyerIncomeLabel,
    t.buyerExpenseLabel,
    t.buyerMarketerNetLabel,
    t.cratesSentLabel,
    t.cratesReturnedLabel,
    t.pendingCrates,
    t.notes,
  ]);

  let totalGross = 0;
  let totalExp = 0;
  let totalNet = 0;
  let totalSettled = 0;
  let totalPending = 0;
  let totalBuyerIncome = 0;
  let totalBuyerExpense = 0;
  let totalPendingCrates = 0;

  for (const r of records) {
    const pendingCrates = Math.max(0, r.cratesSent - r.cratesReturned);
    const bInc = r.buyerIncome ?? 0;
    const bExp = r.buyerExpense ?? 0;
    const bNet = Math.round((bInc - bExp) * 100) / 100;
    const settled = r.settledAmount ?? 0;

    totalGross += r.grossIncome;
    totalExp += r.totalExpense;
    totalNet += r.netProfit;
    totalSettled += settled;
    totalPending += r.pendingAmount;
    totalBuyerIncome += bInc;
    totalBuyerExpense += bExp;
    totalPendingCrates += pendingCrates;

    const boxesSummary = r.vegetables
      .map(v => `${v.vegetableName}${v.grade ? ` (${v.grade})` : ''}: ${v.quantity} ${marketUnitLabel(language, v.unit)} x ${v.ratePerUnit}`)
      .join(' | ');

    rows.push([
      formatMarketSlipCode(r),
      r.marketDate,
      formatDisplayTime12h(r.marketOpenTime),
      r.marketName,
      r.village,
      r.taluk,
      r.district,
      r.state,
      boxesSummary,
      r.customItemsNote ?? '',
      r.grossIncome,
      r.totalExpense,
      r.netProfit,
      marketPaymentStatusLabel(language, r.paymentStatus),
      settled,
      r.pendingAmount,
      r.agentName,
      bInc,
      bExp,
      bNet,
      r.cratesSent,
      r.cratesReturned,
      pendingCrates,
      r.notes,
    ]);
  }

  rows.push([]);
  rows.push([
    t.totalValue,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    `${records.length}`,
    '',
    totalGross,
    totalExp,
    totalNet,
    '',
    totalSettled,
    totalPending,
    '',
    totalBuyerIncome,
    totalBuyerExpense,
    Math.round((totalBuyerIncome - totalBuyerExpense) * 100) / 100,
    '',
    '',
    totalPendingCrates,
    '',
  ]);

  const entitySummaries = summarizeMarketByBuyerOrMarket(records);
  if (entitySummaries.length > 0) {
    rows.push([]);
    rows.push([t.marketSummaryCsvHeading]);
    rows.push([
      t.marketViewByBuyerMarket,
      t.marketLocationHeading,
      t.tripsColumnLabel,
      t.totalUnitsColumnLabel,
      t.marketGrossIncome,
      t.marketTotalExpenses,
      t.marketNetProfit,
      t.settledAmountLabel,
      t.pendingBaaki,
      t.buyerIncomeLabel,
      t.buyerExpenseLabel,
      t.buyerMarketerNetLabel,
      t.pendingCrates,
      t.latestTripLabel,
    ]);
    for (const s of entitySummaries) {
      rows.push([
        s.displayName || t.unnamedMarketOrBuyer,
        s.locationSummary,
        s.tripsCount,
        s.totalBoxesUnits,
        s.grossIncome,
        s.totalExpense,
        s.netProfit,
        s.settledAmount,
        s.pendingBaaki,
        s.buyerIncome,
        s.buyerExpense,
        s.buyerNet,
        s.pendingCrates,
        s.latestMarketDate,
      ]);
    }
  }

  const csvBody = rows.map(row => row.map(escapeCsvCell).join(',')).join('\r\n');
  return `\uFEFF${csvBody}`;
}

async function shareCsvText(filename: string, csvContent: string, dialogTitle: string, t: Copy): Promise<void> {
  if (Platform.OS === 'web') {
    downloadTextFile(filename, csvContent, 'text/csv;charset=utf-8;');
    return;
  }

  const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDir) {
    throw new Error(t.exportSharingUnavailable);
  }
  const fileUri = `${baseDir}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error(t.exportSharingUnavailable);
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/csv',
    dialogTitle,
    UTI: 'public.comma-separated-values-text',
  });
}

export async function exportMarketRecordPdf(
  record: MarketRecord,
  t: Copy,
  language: Language,
  workspaceName: string,
  farmProfile?: FarmProfile | null
): Promise<void> {
  const html = buildMarketPattiHtml(record, t, language, workspaceName, farmProfile);

  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  let finalUri = uri;

  if (baseDir) {
    const safeMkt = sanitizeFilenamePart(record.marketName || workspaceName);
    const slipCode = formatMarketSlipCode(record);
    const namedUri = `${baseDir}BhoomiShakti-Patti-${safeMkt}-${slipCode}.pdf`;
    try {
      await FileSystem.deleteAsync(namedUri, { idempotent: true });
      await FileSystem.moveAsync({ from: uri, to: namedUri });
      finalUri = namedUri;
    } catch {
      finalUri = uri;
    }
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error(t.exportSharingUnavailable);
  }

  await Sharing.shareAsync(finalUri, {
    mimeType: 'application/pdf',
    dialogTitle: t.shareMarketPdfDialog,
    UTI: 'com.adobe.pdf',
  });
}

export async function exportMarketRecordCsv(
  record: MarketRecord,
  t: Copy,
  language: Language,
  workspaceName: string
): Promise<void> {
  const csvContent = buildSingleRecordCsv(record, t, language, workspaceName);
  const safeMkt = sanitizeFilenamePart(record.marketName || workspaceName);
  const slipCode = formatMarketSlipCode(record);
  const filename = `BhoomiShakti-Patti-${safeMkt}-${slipCode}.csv`;
  await shareCsvText(filename, csvContent, t.shareMarketCsvDialog, t);
}

export async function exportMarketLedgerCsv(
  records: MarketRecord[],
  t: Copy,
  language: Language,
  workspaceName: string
): Promise<void> {
  if (records.length === 0) {
    throw new Error(t.marketExportNoRecords);
  }
  const csvContent = buildLedgerCsv(records, t, language, workspaceName);
  const safeWs = sanitizeFilenamePart(workspaceName);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `BhoomiShakti-Market-Ledger-${safeWs}-${dateStr}.csv`;
  await shareCsvText(filename, csvContent, t.shareMarketCsvDialog, t);
}

export async function buildMarketRecordDrivePayload(
  record: MarketRecord,
  t: Copy,
  language: Language,
  workspaceName: string,
  farmProfile?: FarmProfile | null
): Promise<{ fileName: string; mimeType: string; contentBase64: string }> {
  const html = buildMarketPattiHtml(record, t, language, workspaceName, farmProfile);
  const safeMkt = sanitizeFilenamePart(record.marketName || workspaceName);
  const slipCode = formatMarketSlipCode(record);

  if (Platform.OS !== 'web') {
    const result = await Print.printToFileAsync({ html, base64: true });
    let base64 = result.base64;
    if (!base64 && result.uri) {
      base64 = await FileSystem.readAsStringAsync(result.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
    if (base64) {
      return {
        fileName: `BhoomiShakti-Patti-${safeMkt}-${slipCode}.pdf`,
        mimeType: 'application/pdf',
        contentBase64: base64,
      };
    }
  }

  return {
    fileName: `BhoomiShakti-Patti-${safeMkt}-${slipCode}.html`,
    mimeType: 'text/html',
    contentBase64: utf8ToBase64(html),
  };
}
