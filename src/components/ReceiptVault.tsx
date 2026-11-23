import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {
  VaultCategory,
  VaultDocument,
  listVaultDocuments,
  addVaultDocument,
  deleteVaultDocument,
} from '../db/vaultRepo';
import { Copy, Language } from '../i18n/copy';
import { useActiveLanguage } from '../i18n/LanguageContext';
import { GREEN, LIGHT_GREEN, DANGER, INK, MUTED } from '../theme';
import { shared } from '../styles/shared';
import { uuidv4 } from '../utils/uuid';
import { formatShortDate } from '../utils/format';

export type ReceiptVaultProps = {
  db: SQLite.SQLiteDatabase | null;
  workspaceId: string;
  lg?: boolean;
  t?: Copy;
  language?: Language;
};

const CATEGORIES: { key: VaultCategory; icon: string; bg: string; text: string }[] = [
  { key: 'Fertilizer Bill', icon: '🧪', bg: '#E8F5E9', text: '#2E7D32' },
  { key: 'Mandi Slip', icon: '🌾', bg: '#FFF8E1', text: '#B78103' },
  { key: 'Soil Report', icon: '🔬', bg: '#E1F5FE', text: '#0277BD' },
  { key: 'Other', icon: '📄', bg: '#F1F3F4', text: '#5F6368' },
];

function getVaultCategoryLabel(category: VaultCategory, t: Copy): string {
  switch (category) {
    case 'Fertilizer Bill':
      return t.vaultCatFertilizerBill;
    case 'Mandi Slip':
      return t.vaultCatMandiSlip;
    case 'Soil Report':
      return t.vaultCatSoilReport;
    case 'Other':
    default:
      return t.vaultCatOther;
  }
}

export function ReceiptVault({
  db,
  workspaceId,
  lg = false,
  t: propT,
  language: propLanguage,
}: ReceiptVaultProps) {
  const activeLang = useActiveLanguage();
  const t = propT || activeLang.t;
  const language = propLanguage || activeLang.language || 'en';
  const locale = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | VaultCategory>('All');

  // New document draft modal state
  const [draftUri, setDraftUri] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCategory, setDraftCategory] = useState<VaultCategory>('Fertilizer Bill');
  const [isSaving, setIsSaving] = useState(false);

  // Fullscreen preview modal state
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);

  const loadDocuments = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const list = await listVaultDocuments(db, workspaceId);
      setDocuments(list);
    } catch (e) {
      console.warn('Failed to load vault documents:', e);
    } finally {
      setLoading(false);
    }
  }, [db, workspaceId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!db) return;
      try {
        const list = await listVaultDocuments(db, workspaceId);
        if (alive) {
          setDocuments(list);
        }
      } catch (e) {
        console.warn('Failed to load vault documents:', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [db, workspaceId]);

  const handleCapturePhoto = async () => {
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        Alert.alert(t.vaultPermRequiredTitle, t.vaultCameraPermMsg);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const picked = result.assets[0];
        setDraftUri(picked.uri);
        setDraftCategory('Fertilizer Bill');
        setDraftTitle(`${t.vaultCatFertilizerBill} - ${new Date().toLocaleDateString(locale)}`);
      }
    } catch (e) {
      console.error('Camera capture error:', e);
      Alert.alert(t.vaultCameraErrorTitle, t.vaultCameraErrorMsg);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert(t.vaultPermRequiredTitle, t.vaultGalleryPermMsg);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const picked = result.assets[0];
        setDraftUri(picked.uri);
        setDraftCategory('Soil Report');
        setDraftTitle(`${t.vaultCatSoilReport} - ${new Date().toLocaleDateString(locale)}`);
      }
    } catch (e) {
      console.error('Gallery pick error:', e);
      Alert.alert(t.vaultGalleryErrorTitle, t.vaultGalleryErrorMsg);
    }
  };

  const handleSaveDraft = async () => {
    if (!draftUri || !db) return;
    const cleanTitle = draftTitle.trim();
    if (!cleanTitle) {
      Alert.alert(t.vaultTitleRequiredTitle, t.vaultTitleRequiredMsg);
      return;
    }

    setIsSaving(true);
    try {
      let destUri = draftUri;
      try {
        const docDir = FileSystem?.documentDirectory;
        if (
          docDir &&
          typeof FileSystem.getInfoAsync === 'function' &&
          typeof FileSystem.makeDirectoryAsync === 'function' &&
          typeof FileSystem.copyAsync === 'function'
        ) {
          const vaultDir = `${docDir}vault/`;
          const dirInfo = await FileSystem.getInfoAsync(vaultDir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(vaultDir, { intermediates: true });
          }

          const ext = draftUri.split('.').pop() || 'jpg';
          destUri = `${vaultDir}vault_${Date.now()}_${uuidv4().slice(0, 8)}.${ext}`;
          await FileSystem.copyAsync({ from: draftUri, to: destUri });
        }
      } catch (fsErr) {
        console.warn('Could not copy receipt image into vault folder, using picked URI:', fsErr);
        destUri = draftUri;
      }

      await addVaultDocument(
        db,
        {
          title: cleanTitle,
          category: draftCategory,
          localUri: destUri,
        },
        workspaceId
      );

      setDraftUri(null);
      setDraftTitle('');
      await loadDocuments();
    } catch (e) {
      console.error('Failed to save document:', e);
      Alert.alert(t.vaultSaveErrorTitle, t.vaultSaveErrorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (doc: VaultDocument) => {
    const doDelete = async () => {
      if (!db) return;
      try {
        await deleteVaultDocument(db, doc.id, workspaceId);
        if (previewDoc?.id === doc.id) {
          setPreviewDoc(null);
        }
        await loadDocuments();
      } catch (e) {
        console.warn('Failed to delete document:', e);
      }
    };

    const confirmMsg = t.vaultDeleteConfirm.replace('{title}', doc.title);
    if (Platform.OS === 'web') {
      const confirmFn = (globalThis as { confirm?: (message: string) => boolean }).confirm;
      if (confirmFn ? confirmFn(confirmMsg) : true) {
        void doDelete();
      }
      return;
    }

    Alert.alert(
      t.vaultDeleteTitle,
      confirmMsg,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.delete, style: 'destructive', onPress: doDelete },
      ]
    );
  };

  const filteredDocs = documents.filter(d =>
    activeFilter === 'All' ? true : d.category === activeFilter
  );

  const activeFilterLabel =
    activeFilter === 'All' ? t.vaultFilterAll : getVaultCategoryLabel(activeFilter, t);

  return (
    <View style={[shared.tipCard, lg && shared.tipCardLg, styles.container]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 18 }}>📸</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
            <Text style={[shared.tipTitle, lg && shared.tipTitleLg, { color: INK, flexWrap: 'wrap' }]}>
              {t.vaultTitle}
            </Text>
            <Text style={{ fontSize: 12, color: MUTED, marginTop: 2, flexWrap: 'wrap' }}>
              {t.vaultSubtitle}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={handleCapturePhoto}
          style={[styles.actionBtn, styles.cameraBtn]}
          accessibilityRole="button"
          accessibilityLabel={t.vaultTakePhoto}
        >
          <Text style={styles.actionBtnIcon}>📷</Text>
          <Text style={styles.actionBtnTextPrimary}>{t.vaultTakePhoto}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePickFromGallery}
          style={[styles.actionBtn, styles.galleryBtn]}
          accessibilityRole="button"
          accessibilityLabel={t.vaultUploadGallery}
        >
          <Text style={styles.actionBtnIcon}>🖼️</Text>
          <Text style={styles.actionBtnTextSecondary}>{t.vaultUploadGallery}</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <TouchableOpacity
          onPress={() => setActiveFilter('All')}
          style={[styles.filterChip, activeFilter === 'All' && styles.filterChipActive]}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'All' && styles.filterChipTextActive,
            ]}
          >
            {t.vaultFilterAll} ({documents.length})
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map(cat => {
          const count = documents.filter(d => d.category === cat.key).length;
          const isSelected = activeFilter === cat.key;
          const catLabel = getVaultCategoryLabel(cat.key, t);
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setActiveFilter(cat.key)}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
            >
              <Text style={{ fontSize: 13 }}>{cat.icon}</Text>
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {catLabel} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Documents Grid / List */}
      {loading ? (
        <ActivityIndicator color={GREEN} style={{ marginVertical: 20 }} />
      ) : filteredDocs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 30, marginBottom: 6 }}>📑</Text>
          <Text style={styles.emptyTitle}>{t.vaultEmptyTitle}</Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === 'All'
              ? t.vaultEmptyAll
              : t.vaultEmptyCategory.replace('{category}', activeFilterLabel)}
          </Text>
        </View>
      ) : (
        <View style={styles.docList}>
          {filteredDocs.map(doc => {
            const catMeta = CATEGORIES.find(c => c.key === doc.category) || CATEGORIES[3];
            const catLabel = getVaultCategoryLabel(doc.category, t);
            return (
              <TouchableOpacity
                key={doc.id}
                onPress={() => setPreviewDoc(doc)}
                style={styles.docCard}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: doc.localUri }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />

                <View style={styles.docInfo}>
                  <Text style={styles.docTitle} numberOfLines={2}>
                    {doc.title}
                  </Text>
                  <View style={styles.docMetaRow}>
                    <View style={[styles.categoryBadge, { backgroundColor: catMeta.bg }]}>
                      <Text style={[styles.categoryBadgeText, { color: catMeta.text }]}>
                        {catMeta.icon} {catLabel}
                      </Text>
                    </View>
                    <Text style={styles.docDate}>
                      {formatShortDate(doc.capturedAt, locale)}
                    </Text>
                  </View>
                </View>

                <View style={styles.docActions}>
                  <TouchableOpacity
                    onPress={() => handleDelete(doc)}
                    style={styles.deleteBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={{ fontSize: 16, color: DANGER }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Modal 1: Add New Document Modal */}
      <Modal
        visible={Boolean(draftUri)}
        animationType="slide"
        transparent
        onRequestClose={() => setDraftUri(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.vaultSaveModalTitle}</Text>
              <TouchableOpacity
                onPress={() => setDraftUri(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {draftUri && (
              <View style={styles.previewThumbnailWrapper}>
                <Image
                  source={{ uri: draftUri }}
                  style={styles.draftThumbnail}
                  resizeMode="cover"
                />
              </View>
            )}

            <Text style={styles.fieldLabel}>{t.vaultDocTitleLabel}</Text>
            <TextInput
              value={draftTitle}
              onChangeText={setDraftTitle}
              placeholder={t.vaultDocTitlePlaceholder}
              style={styles.titleInput}
              autoFocus
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>{t.vaultCategoryLabel}</Text>
            <View style={styles.categorySelectRow}>
              {CATEGORIES.map(cat => {
                const isSelected = draftCategory === cat.key;
                const catLabel = getVaultCategoryLabel(cat.key, t);
                return (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => {
                      setDraftCategory(cat.key);
                      setDraftTitle(`${catLabel} - ${new Date().toLocaleDateString(locale)}`);
                    }}
                    style={[
                      styles.categoryOptionChip,
                      isSelected && styles.categoryOptionChipSelected,
                    ]}
                  >
                    <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.categoryOptionText,
                        isSelected && styles.categoryOptionTextSelected,
                      ]}
                    >
                      {catLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                onPress={() => setDraftUri(null)}
                style={styles.cancelBtn}
                disabled={isSaving}
              >
                <Text style={styles.cancelBtnText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveDraft}
                style={styles.saveBtn}
                disabled={isSaving}
              >
                <Text style={styles.saveBtnText}>
                  {isSaving ? t.vaultSavingBtn : t.vaultSaveBtn}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Full-screen Image Preview Modal */}
      <Modal
        visible={Boolean(previewDoc)}
        animationType="fade"
        transparent
        onRequestClose={() => setPreviewDoc(null)}
      >
        <View style={styles.fullscreenBackdrop}>
          <View style={styles.fullscreenContent}>
            <View style={styles.fullscreenToolbar}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.fullscreenTitle} numberOfLines={1}>
                  {previewDoc?.title}
                </Text>
                <Text style={styles.fullscreenSubtitle}>
                  {previewDoc ? getVaultCategoryLabel(previewDoc.category, t) : ''} ·{' '}
                  {previewDoc ? formatShortDate(previewDoc.capturedAt, locale) : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (previewDoc) handleDelete(previewDoc);
                }}
                style={styles.fullscreenIconBtn}
              >
                <Text style={{ fontSize: 18 }}>🗑️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPreviewDoc(null)}
                style={[styles.fullscreenIconBtn, { marginLeft: 8 }]}
              >
                <Text style={{ fontSize: 20, color: '#FFFFFF', fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {previewDoc && (
              <Image
                source={{ uri: previewDoc.localUri }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E8DD',
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
    minWidth: 140,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  cameraBtn: {
    backgroundColor: GREEN,
  },
  galleryBtn: {
    backgroundColor: '#F0F8F1',
    borderWidth: 1,
    borderColor: '#CDE0D2',
  },
  actionBtnIcon: {
    fontSize: 16,
  },
  actionBtnTextPrimary: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionBtnTextSecondary: {
    fontSize: 13,
    fontWeight: '800',
    color: GREEN,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F2F6F3',
    borderWidth: 1,
    borderColor: '#DDE7E0',
  },
  filterChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DCE8DE',
    borderRadius: 14,
    marginVertical: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },
  emptySubtitle: {
    fontSize: 12,
    color: MUTED,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  docList: {
    gap: 10,
    marginTop: 4,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAFDFB',
    borderWidth: 1,
    borderColor: '#E2ECE4',
    borderRadius: 14,
    padding: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#EAEFEA',
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: INK,
    marginBottom: 4,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  docDate: {
    fontSize: 11,
    color: MUTED,
  },
  docActions: {
    paddingLeft: 4,
  },
  deleteBtn: {
    padding: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 24, 15, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: INK,
  },
  modalCloseText: {
    fontSize: 18,
    color: MUTED,
    fontWeight: '700',
  },
  previewThumbnailWrapper: {
    alignItems: 'center',
    marginBottom: 14,
  },
  draftThumbnail: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#EDF2EE',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
    marginBottom: 6,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#CFDED2',
    backgroundColor: '#FAFDFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: INK,
    fontWeight: '600',
  },
  categorySelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  categoryOptionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F3F7F4',
    borderWidth: 1,
    borderColor: '#D8E5DC',
  },
  categoryOptionChipSelected: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D8E2D9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: MUTED,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: GREEN,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fullscreenBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
  },
  fullscreenContent: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 24,
  },
  fullscreenToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  fullscreenTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fullscreenSubtitle: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  fullscreenIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    flex: 1,
    width: '100%',
  },
});
