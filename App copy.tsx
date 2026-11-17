import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import { copy, Language, languages } from './src/i18n/copy';

type Entry = {
  id: number;
  title: string;
  category: string;
  note: string;
  createdAt: string;
};

type Tab = 'Home' | 'Diary' | 'Farm' | 'Records' | 'More';

const GREEN = '#246B3B';
const LIGHT_GREEN = '#EAF5EC';
const INK = '#183326';
const MUTED = '#66756B';

export default function App() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [tab, setTab] = useState<Tab>('Home');
  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [note, setNote] = useState('');

  const t = useMemo(() => copy[language], [language]);

  const refreshEntries = useCallback(async (database: SQLite.SQLiteDatabase) => {
    const rows = await database.getAllAsync<Entry>(
      'SELECT id, title, category, note, createdAt FROM diary_entries ORDER BY id DESC'
    );
    setEntries(rows);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const database = await SQLite.openDatabaseAsync('bhoomishakti-diary.db');
        await database.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS diary_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'General',
            note TEXT NOT NULL DEFAULT '',
            createdAt TEXT NOT NULL
          );
        `);
        if (!alive) return;
        setDb(database);
        await refreshEntries(database);
      } catch (error) {
        Alert.alert('Local storage error', 'Could not initialize the diary database. Please restart the app.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [refreshEntries]);

  const addEntry = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      Alert.alert(t.requiredTitle, t.enterActivity);
      return;
    }
    if (!db) {
      Alert.alert('Please wait', 'Local storage is still initializing.');
      return;
    }
    try {
      await db.runAsync(
        'INSERT INTO diary_entries (title, category, note, createdAt) VALUES (?, ?, ?, ?)',
        cleanTitle, category, note.trim(), new Date().toISOString()
      );
      await refreshEntries(db);
      setTitle('');
      setCategory('General');
      setNote('');
      setShowAdd(false);
      setTab('Diary');
    } catch {
      Alert.alert('Save failed', 'Your activity was not saved. Please try again.');
    }
  };

  const deleteEntry = (id: number) => {
    Alert.alert(t.deleteEntry, t.deleteConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: async () => {
        if (!db) return;
        await db.runAsync('DELETE FROM diary_entries WHERE id = ?', id);
        await refreshEntries(db);
      }},
    ]);
  };

  const dateLabel = new Date().toLocaleDateString(
    language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN',
    { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <View style={styles.brandMark}><Text style={styles.brandLeaf}>✦</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>BHOOMISHAKTI</Text>
          <Text style={styles.brandSub}>DIARY · {t.tagline}</Text>
        </View>
        <TouchableOpacity style={styles.langButton} onPress={() => {
          const next: Language = language === 'en' ? 'kn' : language === 'kn' ? 'hi' : 'en';
          setLanguage(next);
        }}>
          <Text style={styles.langButtonText}>{languages[language]}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {tab === 'Home' && <>
          <View style={styles.welcome}>
            <Text style={styles.date}>{dateLabel}</Text>
            <Text style={styles.greeting}>{t.greeting}</Text>
            <Text style={styles.intro}>{t.intro}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setShowAdd(true)}>
              <Text style={styles.primaryButtonText}>＋ {t.addActivity}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <Stat value={String(entries.length)} label={t.activities} />
            <Stat value="—" label={t.plots} />
            <Stat value="—" label={t.season} />
          </View>
          <SectionTitle title={t.recentActivities} action={t.viewAll} onPress={() => setTab('Diary')} />
          {loading ? <ActivityIndicator color={GREEN} style={{ marginTop: 20 }} /> :
            entries.length ? entries.slice(0, 3).map(entry =>
              <EntryCard key={entry.id} entry={entry} onDelete={() => deleteEntry(entry.id)} />
            ) : <EmptyState title={t.noActivities} detail={t.startDiary} />}
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🌱 {t.farmerTools}</Text>
            <Text style={styles.tipText}>{t.toolsComingSoon}</Text>
          </View>
        </>}

        {tab === 'Diary' && <>
          <Text style={styles.pageTitle}>{t.diary}</Text>
          <Text style={styles.pageSubtitle}>{t.diarySubtitle}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setShowAdd(true)}>
            <Text style={styles.primaryButtonText}>＋ {t.addActivity}</Text>
          </TouchableOpacity>
          {loading ? <ActivityIndicator color={GREEN} style={{ marginTop: 20 }} /> :
            entries.length ? entries.map(entry =>
              <EntryCard key={entry.id} entry={entry} onDelete={() => deleteEntry(entry.id)} />
            ) : <EmptyState title={t.noActivities} detail={t.startDiary} />}
        </>}

        {tab === 'Farm' && <Placeholder icon="🌾" title={t.myFarm} detail={t.farmPlaceholder} />}
        {tab === 'Records' && <Placeholder icon="📒" title={t.records} detail={t.recordsPlaceholder} />}
        {tab === 'More' && <>
          <Text style={styles.pageTitle}>{t.more}</Text>
          <Text style={styles.pageSubtitle}>{t.settingsSubtitle}</Text>
          <Text style={styles.fieldLabel}>{t.language}</Text>
          {(['en', 'kn', 'hi'] as Language[]).map(lang =>
            <TouchableOpacity key={lang} style={[styles.languageRow, language === lang && styles.languageSelected]} onPress={() => setLanguage(lang)}>
              <Text style={styles.languageName}>{languages[lang]}</Text>
              <Text style={styles.languageCheck}>{language === lang ? '✓' : ''}</Text>
            </TouchableOpacity>
          )}
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>{t.privacyTitle}</Text>
            <Text style={styles.tipText}>{t.privacyText}</Text>
          </View>
        </>}
      </ScrollView>

      <View style={styles.bottomNav}>
        {([
          ['Home', '⌂', t.home], ['Diary', '▤', t.diary], ['Farm', '♧', t.farm],
          ['Records', '▣', t.records], ['More', '•••', t.more],
        ] as [Tab, string, string][]).map(([key, icon, label]) =>
          <TouchableOpacity key={key} style={styles.navItem} onPress={() => setTab(key)}>
            <Text style={[styles.navIcon, tab === key && styles.navActive]}>{icon}</Text>
            <Text style={[styles.navLabel, tab === key && styles.navActive]}>{label}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.addActivity}</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}><Text style={styles.closeButton}>✕</Text></TouchableOpacity>
            </View>
            <Text style={styles.fieldLabel}>{t.activityTitle} *</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder={t.activityPlaceholder} style={styles.input} maxLength={120} />
            <Text style={styles.fieldLabel}>{t.category}</Text>
            <View style={styles.chipRow}>
              {['General', 'Sowing', 'Irrigation', 'Labour', 'Inputs', 'Harvest'].map(item =>
                <TouchableOpacity key={item} style={[styles.chip, category === item && styles.chipSelected]} onPress={() => setCategory(item)}>
                  <Text style={[styles.chipText, category === item && styles.chipTextSelected]}>{item}</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.fieldLabel}>{t.notes}</Text>
            <TextInput value={note} onChangeText={setNote} placeholder={t.notesPlaceholder} style={[styles.input, styles.notesInput]} multiline textAlignVertical="top" maxLength={1000} />
            <TouchableOpacity style={styles.primaryButton} onPress={addEntry}>
              <Text style={styles.primaryButtonText}>{t.saveActivity}</Text>
            </TouchableOpacity>
            <Text style={styles.localNote}>{t.localNote}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}
function SectionTitle({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text><TouchableOpacity onPress={onPress}><Text style={styles.link}>{action} →</Text></TouchableOpacity></View>;
}
function EntryCard({ entry, onDelete }: { entry: Entry; onDelete: () => void }) {
  const date = new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return <View style={styles.entryCard}>
    <View style={styles.entryIcon}><Text>🌿</Text></View>
    <View style={{ flex: 1 }}>
      <Text style={styles.entryTitle}>{entry.title}</Text>
      <Text style={styles.entryMeta}>{entry.category} · {date}</Text>
      {!!entry.note && <Text style={styles.entryNote}>{entry.note}</Text>}
    </View>
    <TouchableOpacity onPress={onDelete} accessibilityLabel="Delete activity"><Text style={styles.deleteIcon}>⋯</Text></TouchableOpacity>
  </View>;
}
function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <View style={styles.empty}><Text style={styles.emptyIcon}>🌱</Text><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{detail}</Text></View>;
}
function Placeholder({ icon, title, detail }: { icon: string; title: string; detail: string }) {
  return <View style={styles.placeholder}><Text style={styles.placeholderIcon}>{icon}</Text><Text style={styles.pageTitle}>{title}</Text><Text style={styles.pageSubtitle}>{detail}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { height: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: '#EDF1ED', gap: 10 },
  brandMark: { width: 40, height: 40, borderRadius: 13, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  brandLeaf: { color: '#FFFFFF', fontSize: 23, fontWeight: '800' },
  brand: { color: GREEN, fontSize: 13, fontWeight: '900', letterSpacing: 1.3 },
  brandSub: { color: MUTED, fontSize: 10, marginTop: 3, letterSpacing: 0.4 },
  langButton: { borderWidth: 1, borderColor: '#D9E7DC', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F8FCF8' },
  langButtonText: { color: GREEN, fontWeight: '700', fontSize: 12 },
  content: { padding: 18, paddingBottom: 30 },
  welcome: { backgroundColor: '#F0F8F1', borderRadius: 22, padding: 20, borderWidth: 1, borderColor: '#E0EFE2' },
  date: { color: MUTED, fontSize: 12, fontWeight: '600' },
  greeting: { fontSize: 26, lineHeight: 32, fontWeight: '800', color: INK, marginTop: 10 },
  intro: { color: '#52675A', fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 18 },
  primaryButton: { backgroundColor: GREEN, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 10, marginVertical: 18 },
  stat: { flex: 1, borderWidth: 1, borderColor: '#E7EDE8', borderRadius: 16, paddingVertical: 15, paddingHorizontal: 10, backgroundColor: '#FFFFFF' },
  statValue: { fontSize: 23, fontWeight: '800', color: GREEN },
  statLabel: { color: MUTED, fontSize: 11, marginTop: 5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: INK },
  link: { color: GREEN, fontWeight: '700', fontSize: 12 },
  entryCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: '#E8EEE9', borderRadius: 16, padding: 13, marginBottom: 10, backgroundColor: '#FFFFFF' },
  entryIcon: { width: 40, height: 40, backgroundColor: LIGHT_GREEN, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  entryTitle: { color: INK, fontWeight: '700', fontSize: 14, marginTop: 2 },
  entryMeta: { color: MUTED, fontSize: 11, marginTop: 5 },
  entryNote: { color: '#56665B', fontSize: 12, marginTop: 6, lineHeight: 17 },
  deleteIcon: { color: MUTED, fontSize: 22, paddingHorizontal: 4 },
  empty: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: '#DCE8DE', borderRadius: 18, marginBottom: 14 },
  emptyIcon: { fontSize: 30 },
  emptyTitle: { color: INK, fontWeight: '800', fontSize: 15, marginTop: 8 },
  emptyText: { color: MUTED, textAlign: 'center', lineHeight: 19, fontSize: 12, marginTop: 5 },
  tipCard: { backgroundColor: '#F8FAF8', borderRadius: 16, borderWidth: 1, borderColor: '#E8EEE8', padding: 15, marginTop: 14 },
  tipTitle: { color: INK, fontWeight: '800', fontSize: 14 },
  tipText: { color: MUTED, fontSize: 12, lineHeight: 18, marginTop: 6 },
  pageTitle: { color: INK, fontSize: 26, fontWeight: '800', marginTop: 8 },
  pageSubtitle: { color: MUTED, fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 18 },
  bottomNav: { flexDirection: 'row', paddingTop: 10, paddingBottom: 8, borderTopWidth: 1, borderTopColor: '#E8EEE9', backgroundColor: '#FFFFFF' },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 21, color: '#87948A', height: 25 },
  navLabel: { color: '#87948A', fontSize: 10, fontWeight: '600' },
  navActive: { color: GREEN, fontWeight: '900' },
  placeholder: { minHeight: 360, alignItems: 'center', justifyContent: 'center', padding: 24 },
  placeholderIcon: { fontSize: 46, marginBottom: 10 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(13,32,20,0.38)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 },
  modalHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: '#D5DED7', alignSelf: 'center', marginBottom: 14 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { color: INK, fontSize: 20, fontWeight: '800' },
  closeButton: { fontSize: 20, color: MUTED, padding: 5 },
  fieldLabel: { color: INK, fontWeight: '700', fontSize: 12, marginTop: 12, marginBottom: 7 },
  input: { borderWidth: 1, borderColor: '#DDE7DF', borderRadius: 13, paddingHorizontal: 13, paddingVertical: 12, fontSize: 14, color: INK, backgroundColor: '#FCFEFC' },
  notesInput: { minHeight: 76, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { borderWidth: 1, borderColor: '#DCE7DE', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF' },
  chipSelected: { borderColor: GREEN, backgroundColor: LIGHT_GREEN },
  chipText: { color: MUTED, fontSize: 11, fontWeight: '600' },
  chipTextSelected: { color: GREEN },
  localNote: { color: MUTED, textAlign: 'center', fontSize: 10, marginTop: 10 },
  languageRow: { padding: 15, borderRadius: 14, borderWidth: 1, borderColor: '#E6ECE7', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  languageSelected: { backgroundColor: LIGHT_GREEN, borderColor: '#A8CEAF' },
  languageName: { color: INK, fontSize: 14, fontWeight: '700' },
  languageCheck: { color: GREEN, fontWeight: '900' },
});
