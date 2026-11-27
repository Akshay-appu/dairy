import React from 'react';
import { DimensionValue, Text } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { GridList } from '../components/GridList';
import { ListCard } from '../components/ListCard';
import { PrimaryButton } from '../components/Buttons';
import { Entry } from '../db/schema';
import { Copy, Language } from '../i18n/copy';
import { useActiveLanguage } from '../i18n/LanguageContext';
import { shared } from '../styles/shared';
import { formatShortDate } from '../utils/format';

export function DiaryScreen({
  t, language, lg, gridColumns, cardWidth, entries, onAddPress, onEditEntry, onDeleteEntry,
}: {
  t: Copy;
  language?: Language;
  lg: boolean;
  gridColumns: number;
  cardWidth: DimensionValue;
  entries: Entry[];
  onAddPress: () => void;
  onEditEntry?: (entry: Entry) => void;
  onDeleteEntry: (id: number) => void;
}) {
  const { language: activeLanguage } = useActiveLanguage();
  const effectiveLanguage = language ?? activeLanguage;
  const locale = effectiveLanguage === 'kn' ? 'kn-IN' : effectiveLanguage === 'hi' ? 'hi-IN' : 'en-IN';

  return (
    <>
      <Text style={[shared.pageTitle, lg && shared.pageTitleLg]}>{t.diary}</Text>
      <Text style={[shared.pageSubtitle, lg && shared.pageSubtitleLg]}>{t.diarySubtitle}</Text>
      <PrimaryButton label={`＋ ${t.addActivity}`} onPress={onAddPress} lg={lg} />
      {entries.length ? (
        <GridList
          items={entries}
          gridColumns={gridColumns}
          cardWidth={cardWidth}
          renderItem={entry => (
            <ListCard
              title={entry.title}
              meta={`${entry.category} · ${formatShortDate(entry.createdAt, locale)}`}
              note={entry.note}
              onPress={onEditEntry ? () => onEditEntry(entry) : undefined}
              onDelete={() => onDeleteEntry(entry.id)}
              lg={lg}
            />
          )}
        />
      ) : (
        <EmptyState title={t.noActivities} detail={t.startDiary} lg={lg} />
      )}
    </>
  );
}
