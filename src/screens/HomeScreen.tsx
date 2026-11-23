import React from 'react';
import { DimensionValue, Text, TouchableOpacity, View } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { GridList } from '../components/GridList';
import { ListCard } from '../components/ListCard';
import { EmptyState } from '../components/EmptyState';
import { SectionTitle } from '../components/SectionTitle';
import { Stat } from '../components/Stat';
import { CropStageCalendar } from '../components/CropStageCalendar';
import { ReceiptVault } from '../components/ReceiptVault';
import { FarmerToolCard } from '../components/FarmerToolCard';
import { Copy, Language } from '../i18n/copy';
import { Entry, FarmProfile } from '../db/schema';
import { shared } from '../styles/shared';
import { formatShortDate } from '../utils/format';

export function HomeScreen({
  t,
  language,
  lg,
  gridColumns,
  cardWidth,
  dateLabel,
  entries,
  plotsCount,
  cropsCount,
  workspaceName,
  workspaceId,
  db,
  farmProfile,
  financeTotals,
  currentSeasonLabel,
  onAddPress,
  onDeleteEntry,
  onViewAll,
  onOpenExport,
}: {
  t: Copy;
  language: Language;
  lg: boolean;
  gridColumns: number;
  cardWidth: DimensionValue;
  dateLabel: string;
  entries: Entry[];
  plotsCount: number;
  cropsCount: number;
  workspaceName: string;
  workspaceId?: string;
  db?: SQLite.SQLiteDatabase | null;
  farmProfile?: FarmProfile | null;
  financeTotals: { totalIncome: number; totalExpenses: number; netBalance: number };
  currentSeasonLabel: string;
  onAddPress: () => void;
  onDeleteEntry: (id: number) => void;
  onViewAll: () => void;
  onOpenExport: () => void;
}) {
  const locale = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

  return (
    <>
      <View style={[shared.welcome, lg && shared.welcomeLg]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
          <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 4, flexShrink: 0 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#2E7D32' }}>
              🏢 {workspaceName || t.defaultWorkspaceName}
            </Text>
          </View>
          <Text style={[shared.date, lg && shared.dateLg, { marginBottom: 0, flexShrink: 1 }]}>{dateLabel}</Text>
        </View>
        <Text style={[shared.greeting, lg && shared.greetingLg]}>{t.greeting}</Text>
        <Text style={[shared.intro, lg && shared.introLg]}>{t.intro}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <TouchableOpacity
            style={[shared.primaryButton, lg && shared.primaryButtonLg, { flex: 1, minWidth: 150 }]}
            onPress={onAddPress}
          >
            <Text style={[shared.primaryButtonText, lg && shared.primaryButtonTextLg]}>＋ {t.addActivity}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[shared.secondaryButton, { flex: 1, minWidth: 140 }]}
            onPress={onOpenExport}
          >
            <Text style={shared.secondaryButtonText}>📄 {t.exportReportButton}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={shared.statsRow}>
        <Stat value={String(plotsCount)} label={t.plots} lg={lg} />
        <Stat value={String(cropsCount)} label={t.cropsTab} lg={lg} />
        <Stat value={currentSeasonLabel || '—'} label={t.season} lg={lg} />
      </View>

      <View style={[shared.statsRow, { marginTop: 12 }]}>
        <Stat value={`₹${financeTotals.totalIncome.toLocaleString('en-IN')}`} label={t.totalIncome} lg={lg} />
        <Stat value={`₹${financeTotals.totalExpenses.toLocaleString('en-IN')}`} label={t.totalExpenses} lg={lg} />
        <Stat value={`₹${financeTotals.netBalance.toLocaleString('en-IN')}`} label={t.netBalance} lg={lg} />
      </View>

      <SectionTitle title={t.recentActivities} action={t.viewAll} onPress={onViewAll} lg={lg} />
      {entries.length ? (
        <GridList
          items={entries.slice(0, 3)}
          gridColumns={gridColumns}
          cardWidth={cardWidth}
          renderItem={entry => (
            <ListCard
              title={entry.title}
              meta={`${entry.category} · ${formatShortDate(entry.createdAt, locale)}`}
              note={entry.note}
              onDelete={() => onDeleteEntry(entry.id)}
              lg={lg}
            />
          )}
        />
      ) : (
        <EmptyState title={t.noActivities} detail={t.startDiary} lg={lg} />
      )}

      <CropStageCalendar
        db={db ?? null}
        workspaceId={workspaceId || 'default'}
        lg={lg}
        t={t}
        language={language}
      />

      <ReceiptVault
        db={db ?? null}
        workspaceId={workspaceId || 'default'}
        lg={lg}
        t={t}
        language={language}
      />

      <FarmerToolCard
        t={t}
        language={language}
        lg={lg}
        workspaceName={workspaceName}
        plotsCount={plotsCount}
        farmProfile={farmProfile}
      />
    </>
  );
}
