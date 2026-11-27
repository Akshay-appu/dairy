import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  DimensionValue,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { EmptyState } from '../components/EmptyState';
import { Stat } from '../components/Stat';
import type {
  MarketLocationDefaults,
  MarketRecord,
  MarketRecordInput,
} from '../db/marketRecordsRepo';
import type { FarmProfile } from '../db/schema';
import type { Copy, Language } from '../i18n/copy';
import { marketPaymentStatusLabel, marketUnitLabel } from '../i18n/vocab';
import {
  exportMarketLedgerCsv,
  exportMarketRecordCsv,
  exportMarketRecordPdf,
} from '../services/marketReports';
import { shared } from '../styles/shared';
import { DANGER, GREEN, INK, LIGHT_GREEN, MUTED } from '../theme';
import {
  currentLocalTimeHHMM,
  formatDisplayTime12h,
  formatINR,
  formatShortDate,
  todayDateString,
} from '../utils/format';
import { MarketRecordModal } from './MarketRecordModal';

export function MarketScreen({
  t,
  language,
  lg,
  isMobile,
  gridColumns,
  cardWidth,
  workspaceName,
  farmProfile,
  marketRecords,
  onDeleteMarketConfirm,
  onError,
}: {
  t: Copy;
  language: Language;
  lg: boolean;
  isMobile: boolean;
  gridColumns: number;
  cardWidth: DimensionValue;
  workspaceName: string;
  farmProfile?: FarmProfile | null;
  marketRecords: {
    items: MarketRecord[];
    loading: boolean;
    add: (input: MarketRecordInput) => Promise<void>;
    update: (id: number, input: MarketRecordInput) => Promise<void>;
    getLastLocation: () => Promise<MarketLocationDefaults>;
  };
  onDeleteMarketConfirm: (record: MarketRecord) => void;
  onError: (message: string) => void;
}) {
  const locale = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

  // Auto-fetching live local clock (updates on mount + every 30s)
  const [liveClock, setLiveClock] = useState(() => ({
    date: todayDateString(),
    time: currentLocalTimeHHMM(),
  }));
  const [lastLoc, setLastLoc] = useState<MarketLocationDefaults | null>(null);

  useEffect(() => {
    const tick = () => {
      setLiveClock({
        date: todayDateString(),
        time: currentLocalTimeHHMM(),
      });
    };
    tick();
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let alive = true;
    void marketRecords
      .getLastLocation()
      .then(loc => {
        if (alive) setLastLoc(loc);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [marketRecords, marketRecords.items.length]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MarketRecord | null>(null);
  const [busyExportKey, setBusyExportKey] = useState<string | null>(null);

  const summary = useMemo(() => {
    let grossIncome = 0;
    let totalExpense = 0;
    let netProfit = 0;
    let pendingBaaki = 0;
    let pendingCrates = 0;
    for (const r of marketRecords.items) {
      grossIncome += r.grossIncome;
      totalExpense += r.totalExpense;
      netProfit += r.netProfit;
      pendingBaaki += r.pendingAmount;
      pendingCrates += Math.max(0, r.cratesSent - r.cratesReturned);
    }
    return { grossIncome, totalExpense, netProfit, pendingBaaki, pendingCrates };
  }, [marketRecords.items]);

  const liveLocationText = useMemo(() => {
    const parts = [
      lastLoc?.marketName,
      lastLoc?.village || farmProfile?.village,
      lastLoc?.taluk || farmProfile?.taluk,
      lastLoc?.district || farmProfile?.district,
    ]
      .map(s => s?.trim())
      .filter(Boolean);
    return parts.join(', ');
  }, [lastLoc, farmProfile]);

  const openNewRecord = () => {
    setEditingRecord(null);
    setModalVisible(true);
  };

  const openEditRecord = (record: MarketRecord) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleSaveRecord = async (input: MarketRecordInput, editingId: number | null) => {
    if (editingId === null) {
      await marketRecords.add(input);
    } else {
      await marketRecords.update(editingId, input);
    }
  };

  const runExport = async (key: string, fn: () => Promise<void>) => {
    setBusyExportKey(key);
    try {
      await fn();
    } catch (err) {
      onError(err instanceof Error ? err.message : t.exportErrorGeneric);
    } finally {
      setBusyExportKey(null);
    }
  };

  return (
    <View>
      {/* Live Visit Clock + Location Pill */}
      <View style={styles.liveBanner}>
        <View style={styles.liveClockRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>
            {t.liveClockLabel} · {formatShortDate(liveClock.date, locale)} · {formatDisplayTime12h(liveClock.time)}
          </Text>
        </View>
        {!!liveLocationText && (
          <Text style={styles.liveLocText} numberOfLines={1}>
            📍 {liveLocationText}
          </Text>
        )}
      </View>

      <Text style={[shared.pageSubtitle, { marginTop: 8, marginBottom: 10 }]}>
        {t.dailyMarketSubtitle}
      </Text>

      {/* Workspace Summary Cards */}
      <View style={[shared.statsRow, { marginVertical: 10 }]}>
        <Stat value={formatINR(summary.grossIncome)} label={t.marketGrossIncome} lg={lg} />
        <Stat value={formatINR(summary.totalExpense)} label={t.marketTotalExpenses} lg={lg} />
        <Stat
          value={formatINR(summary.netProfit)}
          label={summary.netProfit < 0 ? t.marketNetLoss : t.marketNetProfit}
          lg={lg}
        />
      </View>

      {(summary.pendingBaaki > 0 || summary.pendingCrates > 0) && (
        <View style={styles.alertsRow}>
          {summary.pendingBaaki > 0 && (
            <View style={styles.alertPill}>
              <Ionicons name="wallet-outline" size={14} color="#92400E" />
              <Text style={styles.alertPillText}>
                {t.pendingBaaki}: {formatINR(summary.pendingBaaki)}
              </Text>
            </View>
          )}
          {summary.pendingCrates > 0 && (
            <View style={styles.alertPill}>
              <Ionicons name="cube-outline" size={14} color="#92400E" />
              <Text style={styles.alertPillText}>
                {t.pendingCrates}: {summary.pendingCrates}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Primary Action Buttons */}
      <View style={styles.topButtonsRow}>
        <View style={{ flex: 1, minWidth: 165 }}>
          <PrimaryButton label={`＋ ${t.newMarketRecord}`} onPress={openNewRecord} />
        </View>
        <View style={{ flex: 1, minWidth: 165 }}>
          <SecondaryButton
            label={busyExportKey === 'ledger' ? t.exportGeneratingCsv : `📊 ${t.exportMarketLedgerCsv}`}
            onPress={() =>
              void runExport('ledger', () =>
                exportMarketLedgerCsv(marketRecords.items, t, language, workspaceName)
              )
            }
          />
        </View>
      </View>

      {/* Records List */}
      {marketRecords.items.length === 0 ? (
        <EmptyState title={t.noMarketRecordsYet} detail={t.addFirstMarketRecord} lg={lg} />
      ) : (
        <View
          style={[
            styles.cardsGrid,
            gridColumns > 1 && { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
          ]}
        >
          {marketRecords.items.map(record => {
            const locText = [record.village, record.taluk, record.district, record.state]
              .map(p => p.trim())
              .filter(Boolean)
              .join(', ');
            const pendingCrates = Math.max(0, record.cratesSent - record.cratesReturned);
            const isLoss = record.netProfit < 0;
            const pdfKey = `pdf-${record.id}`;
            const csvKey = `csv-${record.id}`;

            return (
              <View
                key={record.id}
                style={[
                  styles.recordCard,
                  gridColumns > 1 ? { width: cardWidth } : { width: '100%' },
                ]}
              >
                {/* Card Top: Date, Time & Net Profit */}
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.dateTimeRow}>
                      <Text style={styles.cardDate}>
                        {formatShortDate(record.marketDate, locale)}
                      </Text>
                      <View style={styles.timePill}>
                        <Ionicons name="time-outline" size={12} color={GREEN} />
                        <Text style={styles.timePillText}>
                          {formatDisplayTime12h(record.marketOpenTime)}
                        </Text>
                      </View>
                      {record.pattiPhotoUri && (
                        <View style={styles.photoPill}>
                          <Ionicons name="image-outline" size={12} color={GREEN} />
                        </View>
                      )}
                    </View>
                    {(record.marketName || locText) && (
                      <Text style={styles.cardLocation} numberOfLines={2}>
                        🏪 {[record.marketName, locText].filter(Boolean).join(' · ')}
                      </Text>
                    )}
                  </View>

                  <View style={[styles.netBox, isLoss && styles.netBoxLoss]}>
                    <Text style={[styles.netBoxLabel, isLoss && styles.netBoxLabelLoss]}>
                      {isLoss ? t.marketNetLoss : t.marketNetProfit}
                    </Text>
                    <Text style={[styles.netBoxValue, isLoss && styles.netBoxValueLoss]}>
                      {formatINR(record.netProfit)}
                    </Text>
                  </View>
                </View>

                {/* Vegetable Boxes Preview Chips */}
                <View style={styles.vegChipsRow}>
                  <View style={styles.boxCountChip}>
                    <Text style={styles.boxCountText}>
                      {t.boxesCountLabel.replace('{count}', String(record.vegetables.length))}
                    </Text>
                  </View>
                  {record.vegetables.slice(0, 4).map(v => (
                    <View key={v.id} style={styles.vegChip}>
                      <Text style={styles.vegChipText} numberOfLines={1}>
                        {v.vegetableName} · {v.quantity} {marketUnitLabel(language, v.unit)}
                      </Text>
                    </View>
                  ))}
                  {record.vegetables.length > 4 && (
                    <View style={styles.vegChip}>
                      <Text style={styles.vegChipText}>+{record.vegetables.length - 4}</Text>
                    </View>
                  )}
                </View>

                {/* Gross / Expense Strip */}
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownText}>
                    {t.marketGrossIncome}: <Text style={styles.breakdownBold}>{formatINR(record.grossIncome)}</Text>
                  </Text>
                  <Text style={styles.breakdownText}>
                    {t.marketTotalExpenses}: <Text style={[styles.breakdownBold, { color: DANGER }]}>-{formatINR(record.totalExpense)}</Text>
                  </Text>
                </View>

                {/* Status, Baaki & Crates Badges */}
                <View style={styles.badgesRow}>
                  <View style={styles.statusChip}>
                    <Text style={styles.statusChipText}>
                      {marketPaymentStatusLabel(language, record.paymentStatus)}
                    </Text>
                  </View>
                  {record.pendingAmount > 0 && (
                    <View style={styles.warnBadge}>
                      <Text style={styles.warnBadgeText}>
                        {t.pendingBaaki}: {formatINR(record.pendingAmount)}
                      </Text>
                    </View>
                  )}
                  {pendingCrates > 0 && (
                    <View style={styles.warnBadge}>
                      <Text style={styles.warnBadgeText}>
                        {t.cratesPendingBadge.replace('{count}', String(pendingCrates))}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Action Bar: PDF Patti, Excel CSV, Edit, Delete */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    onPress={() =>
                      void runExport(pdfKey, () =>
                        exportMarketRecordPdf(record, t, language, workspaceName, farmProfile)
                      )
                    }
                    disabled={busyExportKey !== null}
                    style={styles.exportActionBtn}
                  >
                    {busyExportKey === pdfKey ? (
                      <ActivityIndicator size="small" color="#B91C1C" />
                    ) : (
                      <MaterialCommunityIcons name="file-pdf-box" size={16} color="#B91C1C" />
                    )}
                    <Text style={styles.exportActionText}>{t.exportPattiPdf}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      void runExport(csvKey, () =>
                        exportMarketRecordCsv(record, t, language, workspaceName)
                      )
                    }
                    disabled={busyExportKey !== null}
                    style={styles.exportActionBtn}
                  >
                    {busyExportKey === csvKey ? (
                      <ActivityIndicator size="small" color={GREEN} />
                    ) : (
                      <MaterialCommunityIcons name="file-excel-box" size={16} color={GREEN} />
                    )}
                    <Text style={styles.exportActionText}>{t.exportDayCsv}</Text>
                  </TouchableOpacity>

                  <View style={styles.rightIconActions}>
                    <TouchableOpacity
                      onPress={() => openEditRecord(record)}
                      style={styles.iconActionBtn}
                      accessibilityRole="button"
                      accessibilityLabel={t.editMarketRecord}
                    >
                      <Ionicons name="create-outline" size={16} color={INK} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => onDeleteMarketConfirm(record)}
                      style={styles.iconActionBtn}
                      accessibilityRole="button"
                      accessibilityLabel={t.delete}
                    >
                      <Ionicons name="trash-outline" size={16} color={DANGER} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <MarketRecordModal
        visible={modalVisible}
        isMobile={isMobile}
        t={t}
        language={language}
        editingRecord={editingRecord}
        getLastLocation={marketRecords.getLastLocation}
        onSave={handleSaveRecord}
        onClose={() => setModalVisible(false)}
        onError={onError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  liveClockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: GREEN,
  },
  liveLocText: {
    fontSize: 12,
    fontWeight: '600',
    color: INK,
    flexShrink: 1,
  },
  alertsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  alertPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  topButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  cardsGrid: {
    gap: 12,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE8DE',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  cardDate: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  timePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: GREEN,
  },
  photoPill: {
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardLocation: {
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
    lineHeight: 17,
  },
  netBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  netBoxLoss: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  netBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  netBoxLabelLoss: {
    color: DANGER,
  },
  netBoxValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#15803D',
  },
  netBoxValueLoss: {
    color: DANGER,
  },
  vegChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  boxCountChip: {
    backgroundColor: GREEN,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  boxCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  vegChip: {
    backgroundColor: '#F4F8F5',
    borderWidth: 1,
    borderColor: '#E1EBE3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  vegChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: INK,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#EDF2EE',
    paddingTop: 8,
  },
  breakdownText: {
    fontSize: 12,
    color: MUTED,
  },
  breakdownBold: {
    fontWeight: '800',
    color: INK,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusChip: {
    backgroundColor: '#F0F4F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: INK,
  },
  warnBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  warnBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#EDF2EE',
    paddingTop: 10,
    flexWrap: 'wrap',
  },
  exportActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F6FAF7',
    borderWidth: 1,
    borderColor: '#DCE8DE',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  exportActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
  },
  rightIconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
  },
  iconActionBtn: {
    backgroundColor: '#F6FAF7',
    borderWidth: 1,
    borderColor: '#DCE8DE',
    borderRadius: 10,
    padding: 7,
  },
});
