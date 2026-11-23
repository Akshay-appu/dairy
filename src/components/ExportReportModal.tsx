import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import { FormModal } from './FormModal';
import { Copy, Language } from '../i18n/copy';
import {
  exportFarmReportCsv,
  exportFarmReportPdf,
  loadFarmReportSnapshot,
} from '../services/exportReports';
import { GREEN, LIGHT_GREEN, DANGER, INK, MUTED } from '../theme';

export function ExportReportModal({
  visible,
  isMobile,
  t,
  language,
  db,
  ownerId,
  workspaceId,
  workspaceName,
  userEmail,
  counts,
  onClose,
}: {
  visible: boolean;
  isMobile: boolean;
  t: Copy;
  language: Language;
  db: SQLite.SQLiteDatabase | null;
  ownerId: string | null;
  workspaceId: string;
  workspaceName: string;
  userEmail?: string | null;
  counts: { activities: number; finance: number; harvests: number };
  onClose: () => void;
}) {
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleClose = () => {
    if (exporting) return;
    setStatusMessage('');
    setErrorMessage('');
    onClose();
  };

  const runExport = async (format: 'pdf' | 'csv') => {
    if (!db) {
      setErrorMessage(t.exportErrorGeneric);
      return;
    }
    setExporting(format);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const snapshot = await loadFarmReportSnapshot(
        db,
        ownerId,
        workspaceId,
        workspaceName,
        language
      );
      if (format === 'pdf') {
        await exportFarmReportPdf(snapshot, t, { userEmail });
        setStatusMessage(t.exportSuccessPdf);
      } else {
        await exportFarmReportCsv(snapshot, t, { userEmail });
        setStatusMessage(t.exportSuccessCsv);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error && err.message ? err.message : t.exportErrorGeneric);
    } finally {
      setExporting(null);
    }
  };

  return (
    <FormModal
      visible={visible}
      title={t.exportShareReportTitle}
      isMobile={isMobile}
      onClose={handleClose}
    >
      <Text style={styles.subtitle}>{t.exportShareReportSubtitle}</Text>

      <View style={styles.summaryPill}>
        <Ionicons name="folder-open-outline" size={16} color={GREEN} />
        <Text style={styles.summaryText} numberOfLines={2}>
          {workspaceName} · {t.activities}: {counts.activities} · {t.financeTab}: {counts.finance} · {t.harvestsTab}: {counts.harvests}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.optionCard, exporting === 'pdf' && styles.optionCardBusy]}
        onPress={() => void runExport('pdf')}
        disabled={exporting !== null}
        activeOpacity={0.75}
      >
        <View style={[styles.optionIconCircle, { backgroundColor: '#FEE2E2' }]}>
          {exporting === 'pdf' ? (
            <ActivityIndicator size="small" color="#B91C1C" />
          ) : (
            <MaterialCommunityIcons name="file-pdf-box" size={26} color="#B91C1C" />
          )}
        </View>
        <View style={styles.optionTextWrap}>
          <Text style={styles.optionTitle}>
            {exporting === 'pdf' ? t.exportGeneratingPdf : t.exportPdfReport}
          </Text>
          <Text style={styles.optionDesc}>{t.exportPdfReportDesc}</Text>
        </View>
        <Ionicons name="share-social-outline" size={20} color={GREEN} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionCard, exporting === 'csv' && styles.optionCardBusy]}
        onPress={() => void runExport('csv')}
        disabled={exporting !== null}
        activeOpacity={0.75}
      >
        <View style={[styles.optionIconCircle, { backgroundColor: LIGHT_GREEN }]}>
          {exporting === 'csv' ? (
            <ActivityIndicator size="small" color={GREEN} />
          ) : (
            <MaterialCommunityIcons name="file-excel-box" size={26} color={GREEN} />
          )}
        </View>
        <View style={styles.optionTextWrap}>
          <Text style={styles.optionTitle}>
            {exporting === 'csv' ? t.exportGeneratingCsv : t.exportCsvReport}
          </Text>
          <Text style={styles.optionDesc}>{t.exportCsvReportDesc}</Text>
        </View>
        <Ionicons name="share-social-outline" size={20} color={GREEN} />
      </TouchableOpacity>

      {!!statusMessage && (
        <View style={styles.statusBox}>
          <Ionicons name="checkmark-circle" size={16} color={GREEN} />
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      )}

      {!!errorMessage && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color={DANGER} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
    </FormModal>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 19,
    marginBottom: 12,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  summaryText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: INK,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DCE8DE',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  optionCardBusy: {
    opacity: 0.75,
    borderColor: GREEN,
  },
  optionIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
  },
  optionDesc: {
    fontSize: 12,
    color: MUTED,
    marginTop: 3,
    lineHeight: 17,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: LIGHT_GREEN,
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    color: DANGER,
    flex: 1,
  },
});
