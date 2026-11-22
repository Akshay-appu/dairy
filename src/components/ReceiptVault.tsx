import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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
import { GREEN, LIGHT_GREEN, DANGER, INK, MUTED } from '../theme';
import { shared } from '../styles/shared';
import { uuidv4 } from '../utils/uuid';
import { formatShortDate } from '../utils/format';

export type ReceiptVaultProps = {
  db: SQLite.SQLiteDatabase | null;
  workspaceId: string;
  lg?: boolean;
};

const CATEGORIES: { label: VaultCategory; icon: string; bg: string; text: string }[] = [
  { label: 'Fertilizer Bill', icon: '🧪', bg: '#E8F5E9', text: '#2E7D32' },
  { label: 'Mandi Slip', icon: '🌾', bg: '#FFF8E1', text: '#B78103' },
  { label: 'Soil Report', icon: '🔬', bg: '#E1F5FE', text: '#0277BD' },
  { label: 'Other', icon: '📄', bg: '#F1F3F4', text: '#5F6368' },
];

export function ReceiptVault({ db, workspaceId, lg = false }: ReceiptVaultProps) {
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
        Alert.alert(
          'Permission Required',
          'Camera access is required to capture photos of bills and soil reports.'
        );
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
        setDraftTitle(`Fertilizer Bill - ${new Date().toLocaleDateString('en-IN')}`);
      }
    } catch (e) {
      console.error('Camera capture error:', e);
      Alert.alert('Camera Error', 'Could not open camera. Please try again.');
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Gallery access is required to select photos of bills and soil reports.'
        );
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
        setDraftTitle(`Soil Report - ${new Date().toLocaleDateString('en-IN')}`);
      }
    } catch (e) {
      console.error('Gallery pick error:', e);
      Alert.alert('Gallery Error', 'Could not open gallery. Please try again.');
    }
  };

  const handleSaveDraft = async () => {
    if (!draftUri || !db) return;
    const cleanTitle = draftTitle.trim();
    if (!cleanTitle) {
      Alert.alert('Title Required', 'Please enter a title or description for this document.');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Ensure persistent vault directory exists safely
      let destUri = draftUri;
      try {
        const docDir = FileSystem?.documentDirectory;
        if (docDir && typeof FileSystem.getInfoAsync === 'function' && typeof FileSystem.makeDirectoryAsync === 'function' && typeof FileSystem.copyAsync === 'function') {
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

      // 2. Save metadata to SQLite scoped to active workspace
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
      Alert.alert('Save Error', 'Could not save the document to the vault. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (doc: VaultDocument) => {
    Alert.alert(
      'Delete Document',
      `Delete "${doc.title}"? This will permanently remove the image and record.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
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
          },
        },
      ]
    );
  };

  const filteredDocs = documents.filter(d =>
    activeFilter === 'All' ? true : d.category === activeFilter
  );

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
              Receipt & Soil Report Vault
            </Text>
            <Text style={{ fontSize: 12, color: MUTED, marginTop: 2, flexWrap: 'wrap' }}>
              Workspace-scoped storage for bills, mandi slips & test reports
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
          accessibilityLabel="Capture photo with camera"
        >
          <Text style={styles.actionBtnIcon}>📷</Text>
          <Text style={styles.actionBtnTextPrimary}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePickFromGallery}
          style={[styles.actionBtn, styles.galleryBtn]}
          accessibilityRole="button"
          accessibilityLabel="Upload from photo library"
        >
          <Text style={styles.actionBtnIcon}>🖼️</Text>
          <Text style={styles.actionBtnTextSecondary}>Upload from Gallery</Text>
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
            All ({documents.length})
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map(cat => {
          const count = documents.filter(d => d.category === cat.label).length;
          const isSelected = activeFilter === cat.label;
          return (
            <TouchableOpacity
              key={cat.label}
              onPress={() => setActiveFilter(cat.label)}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
            >
              <Text style={{ fontSize: 13 }}>{cat.icon}</Text>
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {cat.label} ({count})
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
          <Text style={styles.emptyTitle}>No documents saved</Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === 'All'
              ? 'Capture a fertilizer bill or soil report photo to securely archive it in this workspace.'
              : `No documents under "${activeFilter}".`}
          </Text>
        </View>
      ) : (
        <View style={styles.docList}>
          {filteredDocs.map(doc => {
            const catMeta = CATEGORIES.find(c => c.label === doc.category) || CATEGORIES[3];
            return (
              <TouchableOpacity
                key={doc.id}
                onPress={() => setPreviewDoc(doc)}
                style={styles.docCard}
                activeOpacity={0.7}
              >
                {/* Thumbnail */}
                <Image
                  source={{ uri: doc.localUri }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />

                {/* Info */}
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle} numberOfLines={2}>
                    {doc.title}
                  </Text>
                  <View style={styles.docMetaRow}>
                    <View style={[styles.categoryBadge, { backgroundColor: catMeta.bg }]}>
                      <Text style={[styles.categoryBadgeText, { color: catMeta.text }]}>
                        {catMeta.icon} {doc.category}
                      </Text>
                    </View>
                    <Text style={styles.docDate}>
                      {formatShortDate(doc.capturedAt, 'en-IN')}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
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
              <Text style={styles.modalTitle}>Save Document to Vault</Text>
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

            <Text style={styles.fieldLabel}>Document Title *</Text>
            <TextInput
              value={draftTitle}
              onChangeText={setDraftTitle}
              placeholder="e.g. Urea Bill - May 2026"
              style={styles.titleInput}
              autoFocus
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Category *</Text>
            <View style={styles.categorySelectRow}>
              {CATEGORIES.map(cat => {
                const isSelected = draftCategory === cat.label;
                return (
                  <TouchableOpacity
                    key={cat.label}
                    onPress={() => {
                      setDraftCategory(cat.label);
                      if (draftTitle.includes('Bill') || draftTitle.includes('Slip') || draftTitle.includes('Report')) {
                        setDraftTitle(`${cat.label} - ${new Date().toLocaleDateString('en-IN')}`);
                      }
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
                      {cat.label}
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
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveDraft}
                style={styles.saveBtn}
                disabled={isSaving}
              >
                <Text style={styles.saveBtnText}>
                  {isSaving ? 'Saving…' : 'Save to Vault'}
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
            {/* Top Toolbar */}
            <View style={styles.fullscreenToolbar}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.fullscreenTitle} numberOfLines={1}>
                  {previewDoc?.title}
                </Text>
                <Text style={styles.fullscreenSubtitle}>
                  {previewDoc?.category} · {previewDoc ? formatShortDate(previewDoc.capturedAt, 'en-IN') : ''}
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

            {/* Main Image */}
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
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  fullscreenToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fullscreenTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fullscreenSubtitle: {
    fontSize: 12,
    color: '#B0BEC5',
    marginTop: 2,
  },
  fullscreenIconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    flex: 1,
    width: '100%',
  },
});
