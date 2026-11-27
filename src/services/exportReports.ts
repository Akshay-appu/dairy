import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { BackupData, buildBackup } from '../db/backupRepo';
import { CropSchedule, listCropSchedules } from '../db/cropSchedulesRepo';
import { computeCropProfile } from '../data/cropProfiles';
import { Copy, Language } from '../i18n/copy';
import { expenseCategoryLabel, incomeCategoryLabel, quantityUnitLabel } from '../i18n/vocab';
import { formatINR, formatShortDate } from '../utils/format';
import { downloadTextFile } from '../utils/share';
import { utf8ToBase64 } from './googleDriveSync';
import { notifyBhoomiEmailService } from './notifications';

export type FarmReportSnapshot = BackupData & {
  workspaceName: string;
  language: Language;
  cropSchedules: CropSchedule[];
};

function sanitizeFilenamePart(raw: string): string {
  const cleaned = raw.trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'farm';
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
  // Neutralize spreadsheet formula prefixes while keeping negative numbers intact
  if (/^[=+@]/.test(str) || (/^-/.test(str) && Number.isNaN(Number(str)))) {
    str = `'${str}`;
  }
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function computeDaysSinceSowing(sowingDateStr: string): number {
  const parts = sowingDateStr.trim().split('-');
  if (parts.length !== 3) return 0;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return 0;
  const sowing = new Date(y, m, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((today.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24));
}

export async function loadFarmReportSnapshot(
  db: SQLite.SQLiteDatabase,
  ownerId: string | null,
  workspaceId: string,
  workspaceName: string,
  language: Language
): Promise<FarmReportSnapshot> {
  const [backup, cropSchedules] = await Promise.all([
    buildBackup(db, ownerId, workspaceId),
    listCropSchedules(db, workspaceId),
  ]);
  return {
    ...backup,
    workspaceName: workspaceName || 'Default',
    language,
    cropSchedules,
  };
}

function buildReportHtml(snapshot: FarmReportSnapshot, t: Copy): string {
  const { language } = snapshot;
  const locale = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
  const totalIncome = snapshot.financeEntries
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);
  const totalExpenses = snapshot.financeEntries
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const totalHarvestValue = snapshot.harvests.reduce(
    (sum, h) => sum + (h.sellingPrice != null ? h.quantity * h.sellingPrice : 0),
    0
  );

  const generatedLabel = new Date().toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const farmLineParts = [
    snapshot.farmProfile?.farmName,
    snapshot.farmProfile?.farmerName,
    [snapshot.farmProfile?.village, snapshot.farmProfile?.district, snapshot.farmProfile?.state]
      .filter(Boolean)
      .join(', '),
  ].filter(Boolean);

  const plotNameById = new Map(snapshot.plots.map(p => [p.id, p.name]));
  const cropNameById = new Map(snapshot.crops.map(c => [c.id, c.cropName]));

  const financeRows = snapshot.financeEntries
    .map(f => {
      const typeText = f.type === 'income' ? t.income : t.expenses;
      const catText =
        f.type === 'income'
          ? incomeCategoryLabel(language, f.category)
          : expenseCategoryLabel(language, f.category);
      return `<tr>
        <td>${escapeHtml(f.date)}</td>
        <td><span class="pill ${f.type === 'income' ? 'pill-green' : 'pill-red'}">${escapeHtml(typeText)}</span></td>
        <td>${escapeHtml(catText)}</td>
        <td class="num">${escapeHtml(formatINR(f.amount))}</td>
        <td>${escapeHtml(f.notes || '—')}</td>
      </tr>`;
    })
    .join('');

  const harvestRows = snapshot.harvests
    .map(h => {
      const cName = (h.cropId != null ? cropNameById.get(h.cropId) : undefined) ?? t.noCropLinked;
      const pName = (h.plotId != null ? plotNameById.get(h.plotId) : undefined) ?? t.noPlotLinked;
      const val =
        h.sellingPrice != null ? formatINR(h.quantity * h.sellingPrice) : t.valueNotRecorded;
      return `<tr>
        <td>${escapeHtml(h.harvestDate)}</td>
        <td>${escapeHtml(cName)}</td>
        <td>${escapeHtml(pName)}</td>
        <td>${escapeHtml(`${h.quantity} ${quantityUnitLabel(language, h.quantityUnit)}`)}</td>
        <td class="num">${escapeHtml(val)}</td>
        <td>${escapeHtml(h.buyer || '—')}</td>
      </tr>`;
    })
    .join('');

  const activityRows = snapshot.diaryEntries
    .map(e => {
      const linked = [
        e.plotId != null ? plotNameById.get(e.plotId) : undefined,
        e.cropId != null ? cropNameById.get(e.cropId) : undefined,
      ]
        .filter(Boolean)
        .join(' · ');
      return `<tr>
        <td>${escapeHtml(formatShortDate(e.createdAt, locale))}</td>
        <td><strong>${escapeHtml(e.title)}</strong></td>
        <td>${escapeHtml(e.category)}</td>
        <td>${escapeHtml(linked || '—')}</td>
        <td>${escapeHtml(e.note || '—')}</td>
      </tr>`;
    })
    .join('');

  const scheduleRows = snapshot.cropSchedules
    .map(s => {
      const profile = computeCropProfile(s.cropName, language, s.totalDays);
      const elapsed = Math.max(0, computeDaysSinceSowing(s.sowingDate));
      const activeStage =
        profile.stages.find(st => elapsed >= st.startDay && elapsed <= st.endDay) ??
        profile.stages[profile.stages.length - 1];
      return `<tr>
        <td><strong>${escapeHtml(`${profile.emoji} ${s.cropName}`)}</strong></td>
        <td>${escapeHtml(s.sowingDate)}</td>
        <td>${escapeHtml(`${t.dayWord} ${elapsed} / ${profile.totalDays}`)}</td>
        <td>${escapeHtml(activeStage.name)}</td>
        <td>${escapeHtml(activeStage.fertilizerReminder)}</td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(language)}">
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #183326; margin: 0; padding: 24px; font-size: 12px; line-height: 1.45; }
    .header { background: #246B3B; color: #FFFFFF; padding: 18px 20px; border-radius: 12px; margin-bottom: 18px; }
    .header h1 { margin: 0; font-size: 20px; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0; font-size: 12px; opacity: 0.92; }
    .meta-bar { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; background: #F0F8F1; border: 1px solid #D5EBD9; border-radius: 10px; padding: 10px 14px; font-size: 11px; }
    .grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
    .stat-box { flex: 1; min-width: 120px; border: 1px solid #DCE8DE; border-radius: 10px; padding: 10px 12px; background: #FAFDFB; }
    .stat-label { font-size: 10px; color: #66756B; text-transform: uppercase; font-weight: 700; }
    .stat-val { font-size: 16px; font-weight: 800; color: #246B3B; margin-top: 4px; }
    .stat-val.neg { color: #B3261E; }
    h2 { font-size: 14px; color: #246B3B; border-bottom: 2px solid #E0EFE2; padding-bottom: 4px; margin: 18px 0 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    th, td { border: 1px solid #E2ECE4; padding: 7px 8px; text-align: left; vertical-align: top; font-size: 11px; }
    th { background: #F0F8F1; color: #183326; font-weight: 700; }
    td.num { text-align: right; font-weight: 700; white-space: nowrap; }
    .pill { display: inline-block; padding: 2px 7px; border-radius: 8px; font-size: 10px; font-weight: 700; }
    .pill-green { background: #DCFCE7; color: #15803D; }
    .pill-red { background: #FEE2E2; color: #B91C1C; }
    .empty { color: #66756B; font-style: italic; margin: 6px 0 12px; }
    .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #E2ECE4; font-size: 10px; color: #66756B; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>BS DIARY · BHOOMISHAKTI</h1>
    <p>${escapeHtml(t.tagline)}</p>
  </div>

  <div class="meta-bar">
    <div><strong>${escapeHtml(t.reportWorkspaceLabel)}:</strong> ${escapeHtml(snapshot.workspaceName)}${farmLineParts.length ? ` · ${escapeHtml(farmLineParts.join(' · '))}` : ''}</div>
    <div><strong>${escapeHtml(t.reportGeneratedOn)}:</strong> ${escapeHtml(generatedLabel)}</div>
  </div>

  <h2>${escapeHtml(t.reportSummaryHeading)}</h2>
  <div class="grid">
    <div class="stat-box"><div class="stat-label">${escapeHtml(t.totalIncome)}</div><div class="stat-val">${escapeHtml(formatINR(totalIncome))}</div></div>
    <div class="stat-box"><div class="stat-label">${escapeHtml(t.totalExpenses)}</div><div class="stat-val neg">${escapeHtml(formatINR(totalExpenses))}</div></div>
    <div class="stat-box"><div class="stat-label">${escapeHtml(t.netBalance)}</div><div class="stat-val ${netBalance < 0 ? 'neg' : ''}">${escapeHtml(formatINR(netBalance))}</div></div>
    <div class="stat-box"><div class="stat-label">${escapeHtml(t.totalValue)}</div><div class="stat-val">${escapeHtml(formatINR(totalHarvestValue))}</div></div>
    <div class="stat-box"><div class="stat-label">${escapeHtml(t.plotsTab)} / ${escapeHtml(t.cropsTab)}</div><div class="stat-val">${snapshot.plots.length} / ${snapshot.crops.length}</div></div>
    <div class="stat-box"><div class="stat-label">${escapeHtml(t.activities)}</div><div class="stat-val">${snapshot.diaryEntries.length}</div></div>
  </div>

  <h2>${escapeHtml(t.reportFinanceHeading)} (${snapshot.financeEntries.length})</h2>
  ${
    snapshot.financeEntries.length
      ? `<table>
          <thead><tr><th>${escapeHtml(t.financeDate)}</th><th>${escapeHtml(t.category)}</th><th>${escapeHtml(t.financeCategory)}</th><th>${escapeHtml(t.amount)}</th><th>${escapeHtml(t.notes)}</th></tr></thead>
          <tbody>${financeRows}</tbody>
        </table>`
      : `<p class="empty">${escapeHtml(t.reportNoRecords)}</p>`
  }

  <h2>${escapeHtml(t.reportHarvestsHeading)} (${snapshot.harvests.length})</h2>
  ${
    snapshot.harvests.length
      ? `<table>
          <thead><tr><th>${escapeHtml(t.harvestDate)}</th><th>${escapeHtml(t.cropName)}</th><th>${escapeHtml(t.plotName)}</th><th>${escapeHtml(t.quantity)}</th><th>${escapeHtml(t.totalValue)}</th><th>${escapeHtml(t.buyer)}</th></tr></thead>
          <tbody>${harvestRows}</tbody>
        </table>`
      : `<p class="empty">${escapeHtml(t.reportNoRecords)}</p>`
  }

  <h2>${escapeHtml(t.reportActivitiesHeading)} (${snapshot.diaryEntries.length})</h2>
  ${
    snapshot.diaryEntries.length
      ? `<table>
          <thead><tr><th>${escapeHtml(t.financeDate)}</th><th>${escapeHtml(t.activityTitle)}</th><th>${escapeHtml(t.category)}</th><th>${escapeHtml(t.plotsTab)} / ${escapeHtml(t.cropsTab)}</th><th>${escapeHtml(t.notes)}</th></tr></thead>
          <tbody>${activityRows}</tbody>
        </table>`
      : `<p class="empty">${escapeHtml(t.reportNoRecords)}</p>`
  }

  <h2>${escapeHtml(t.reportCropSchedulesHeading)} (${snapshot.cropSchedules.length})</h2>
  ${
    snapshot.cropSchedules.length
      ? `<table>
          <thead><tr><th>${escapeHtml(t.cropInputLabel)}</th><th>${escapeHtml(t.sowingDate)}</th><th>${escapeHtml(t.daysGrowth)}</th><th>${escapeHtml(t.stageLabel)}</th><th>${escapeHtml(t.bsjdkSystemLabel)}</th></tr></thead>
          <tbody>${scheduleRows}</tbody>
        </table>`
      : `<p class="empty">${escapeHtml(t.reportNoRecords)}</p>`
  }

  <div class="footer">BhoomiShakti Diary · bhoomishakti.in</div>
</body>
</html>`;
}

function buildReportCsv(snapshot: FarmReportSnapshot, t: Copy): string {
  const { language } = snapshot;
  const totalIncome = snapshot.financeEntries
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);
  const totalExpenses = snapshot.financeEntries
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const plotNameById = new Map(snapshot.plots.map(p => [p.id, p.name]));
  const cropNameById = new Map(snapshot.crops.map(c => [c.id, c.cropName]));

  const rows: (string | number | null | undefined)[][] = [];
  rows.push(['BhoomiShakti Diary Report', snapshot.workspaceName, snapshot.exportedAt.slice(0, 10)]);
  if (snapshot.farmProfile) {
    rows.push([
      t.farmName,
      snapshot.farmProfile.farmName,
      t.farmerName,
      snapshot.farmProfile.farmerName,
      t.village,
      snapshot.farmProfile.village,
      t.district,
      snapshot.farmProfile.district,
    ]);
  }
  rows.push([]);
  rows.push([t.reportSummaryHeading]);
  rows.push([t.totalIncome, totalIncome, t.totalExpenses, totalExpenses, t.netBalance, netBalance]);
  rows.push([t.plotsTab, snapshot.plots.length, t.cropsTab, snapshot.crops.length, t.activities, snapshot.diaryEntries.length]);

  rows.push([]);
  rows.push([t.reportFinanceHeading]);
  rows.push([t.financeDate, t.category, t.financeCategory, t.amount, t.notes]);
  for (const f of snapshot.financeEntries) {
    rows.push([
      f.date,
      f.type === 'income' ? t.income : t.expenses,
      f.type === 'income'
        ? incomeCategoryLabel(language, f.category)
        : expenseCategoryLabel(language, f.category),
      f.amount,
      f.notes,
    ]);
  }

  rows.push([]);
  rows.push([t.reportHarvestsHeading]);
  rows.push([t.harvestDate, t.cropName, t.plotName, t.quantity, t.unit, t.sellingPrice, t.totalValue, t.buyer, t.notes]);
  for (const h of snapshot.harvests) {
    rows.push([
      h.harvestDate,
      (h.cropId != null ? cropNameById.get(h.cropId) : undefined) ?? '',
      (h.plotId != null ? plotNameById.get(h.plotId) : undefined) ?? '',
      h.quantity,
      quantityUnitLabel(language, h.quantityUnit),
      h.sellingPrice ?? '',
      h.sellingPrice != null ? h.quantity * h.sellingPrice : '',
      h.buyer ?? '',
      h.notes,
    ]);
  }

  rows.push([]);
  rows.push([t.reportActivitiesHeading]);
  rows.push([t.financeDate, t.activityTitle, t.category, t.plotName, t.cropName, t.notes]);
  for (const a of snapshot.diaryEntries) {
    rows.push([
      a.createdAt.slice(0, 10),
      a.title,
      a.category,
      (a.plotId != null ? plotNameById.get(a.plotId) : undefined) ?? '',
      (a.cropId != null ? cropNameById.get(a.cropId) : undefined) ?? '',
      a.note,
    ]);
  }

  rows.push([]);
  rows.push([t.reportCropSchedulesHeading]);
  rows.push([t.cropInputLabel, t.sowingDate, t.daysGrowth, t.stageLabel, t.irrigation, t.bsjdkSystemLabel]);
  for (const s of snapshot.cropSchedules) {
    const profile = computeCropProfile(s.cropName, language, s.totalDays);
    const elapsed = Math.max(0, computeDaysSinceSowing(s.sowingDate));
    const activeStage =
      profile.stages.find(st => elapsed >= st.startDay && elapsed <= st.endDay) ??
      profile.stages[profile.stages.length - 1];
    rows.push([
      s.cropName,
      s.sowingDate,
      `${elapsed}/${profile.totalDays}`,
      activeStage.name,
      activeStage.irrigationReminder,
      activeStage.fertilizerReminder,
    ]);
  }

  const csvBody = rows.map(row => row.map(escapeCsvCell).join(',')).join('\r\n');
  // UTF-8 BOM ensures Excel opens Kannada & Hindi scripts cleanly without mojibake
  return `\uFEFF${csvBody}`;
}

export async function exportFarmReportPdf(
  snapshot: FarmReportSnapshot,
  t: Copy,
  options?: { userEmail?: string | null }
): Promise<void> {
  const html = buildReportHtml(snapshot, t);

  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
  } else {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    let finalUri = uri;

    if (baseDir) {
      const safeWs = sanitizeFilenamePart(snapshot.workspaceName);
      const dateStr = new Date().toISOString().slice(0, 10);
      const namedUri = `${baseDir}BhoomiShakti-Report-${safeWs}-${dateStr}.pdf`;
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
      dialogTitle: t.sharePdfDialogTitle,
      UTI: 'com.adobe.pdf',
    });
  }

  if (options?.userEmail) {
    void notifyBhoomiEmailService({
      event: 'report_requested',
      email: options.userEmail,
      farmerName: snapshot.farmProfile?.farmerName || undefined,
      village: snapshot.farmProfile?.village || undefined,
      workspaceName: snapshot.workspaceName,
      reportFormat: 'pdf',
      language: snapshot.language,
    });
  }
}

export async function exportFarmReportCsv(
  snapshot: FarmReportSnapshot,
  t: Copy,
  options?: { userEmail?: string | null }
): Promise<void> {
  const csvContent = buildReportCsv(snapshot, t);
  const safeWs = sanitizeFilenamePart(snapshot.workspaceName);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `BhoomiShakti-Report-${safeWs}-${dateStr}.csv`;

  if (Platform.OS === 'web') {
    downloadTextFile(filename, csvContent, 'text/csv;charset=utf-8;');
  } else {
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
      dialogTitle: t.shareCsvDialogTitle,
      UTI: 'public.comma-separated-values-text',
    });
  }

  if (options?.userEmail) {
    void notifyBhoomiEmailService({
      event: 'report_requested',
      email: options.userEmail,
      farmerName: snapshot.farmProfile?.farmerName || undefined,
      village: snapshot.farmProfile?.village || undefined,
      workspaceName: snapshot.workspaceName,
      reportFormat: 'csv',
      language: snapshot.language,
    });
  }
}

export async function buildFarmReportDrivePayload(
  snapshot: FarmReportSnapshot,
  t: Copy
): Promise<{ fileName: string; mimeType: string; contentBase64: string }> {
  const html = buildReportHtml(snapshot, t);
  const safeWs = sanitizeFilenamePart(snapshot.workspaceName);
  const dateStr = new Date().toISOString().slice(0, 10);

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
        fileName: `BhoomiShakti-Report-${safeWs}-${dateStr}.pdf`,
        mimeType: 'application/pdf',
        contentBase64: base64,
      };
    }
  }

  return {
    fileName: `BhoomiShakti-Report-${safeWs}-${dateStr}.html`,
    mimeType: 'text/html',
    contentBase64: utf8ToBase64(html),
  };
}
