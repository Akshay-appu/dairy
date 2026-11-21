import React from 'react';
import { ActivityIndicator, DimensionValue, Text, TouchableOpacity, View } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { GridList } from '../components/GridList';
import { ListCard } from '../components/ListCard';
import { EmptyState } from '../components/EmptyState';
import { SectionTitle } from '../components/SectionTitle';
import { Stat } from '../components/Stat';
import { CropStageCalendar } from '../components/CropStageCalendar';
import { FarmerToolCard } from '../components/FarmerToolCard';
import { Copy } from '../i18n/copy';
import { Entry } from '../db/schema';
import { shared } from '../styles/shared';
import { GREEN } from '../theme';
import { formatShortDate } from '../utils/format';

export function HomeScreen({
  t, lg, gridColumns, cardWidth, dateLabel, entries, loading, plotsCount, cropsCount, workspaceName, workspaceId, db, financeTotals, currentSeasonLabel, onAddPress, onDeleteEntry, onViewAll,
}: {
  t: Copy;
  lg: boolean;
  gridColumns: number;
  cardWidth: DimensionValue;
  dateLabel: string;
  entries: Entry[];
  loading: boolean;
  plotsCount: number;
  cropsCount: number;
  workspaceName: string;
  workspaceId?: string;
  db?: SQLite.SQLiteDatabase | null;
  financeTotals: { totalIncome: number; totalExpenses: number; netBalance: number };
  currentSeasonLabel: string;
  onAddPress: () => void;
  onDeleteEntry: (id: number) => void;
  onViewAll: () => void;
}) {
  return (
    <>
      <View style={[shared.welcome, lg && shared.welcomeLg]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#2E7D32' }}>🏢 {workspaceName || 'Workspace'}</Text>
          </View>
          <Text style={[shared.date, lg && shared.dateLg, { marginBottom: 0 }]}>{dateLabel}</Text>
        </View>
        <Text style={[shared.greeting, lg && shared.greetingLg]}>{t.greeting}</Text>
        <Text style={[shared.intro, lg && shared.introLg]}>{t.intro}</Text>
        <TouchableOpacity style={[shared.primaryButton, lg && shared.primaryButtonLg]} onPress={onAddPress}>
          <Text style={[shared.primaryButtonText, lg && shared.primaryButtonTextLg]}>＋ {t.addActivity}</Text>
        </TouchableOpacity>
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
      {loading ? (
        <ActivityIndicator color={GREEN} style={{ marginTop: 20 }} />
      ) : entries.length ? (
        <GridList
          items={entries.slice(0, 3)}
          gridColumns={gridColumns}
          cardWidth={cardWidth}
          renderItem={entry => (
            <ListCard
              title={entry.title}
              meta={`${entry.category} · ${formatShortDate(entry.createdAt, 'en-IN')}`}
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
      />

      <FarmerToolCard
        t={t}
        lg={lg}
        workspaceName={workspaceName}
        plotsCount={plotsCount}
      />
    </>
  );
}
