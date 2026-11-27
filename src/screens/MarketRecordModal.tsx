import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { FormField } from '../components/FormField';
import {
  formatMarketSlipCode,
  type MarketLocationDefaults,
  type MarketRecord,
  type MarketRecordInput,
} from '../db/marketRecordsRepo';
import type { Copy, Language } from '../i18n/copy';
import {
  MarketPaymentStatus,
  MarketUnit,
  marketPaymentStatuses,
  marketPaymentStatusLabels,
  marketUnitLabels,
  marketUnits,
  quickVegetableNames,
} from '../i18n/vocab';
import { shared } from '../styles/shared';
import { DANGER, GREEN, INK, LIGHT_GREEN, MUTED } from '../theme';
import {
  currentLocalTimeHHMM,
  formatDisplayTime12h,
  formatINR,
  isLowLightHour,
  isValidDateString,
  isValidTimeHHMM,
  parseAmount,
  todayDateString,
} from '../utils/format';
import { uuidv4 } from '../utils/uuid';

type VegBoxDraft = {
  key: string;
  vegetableName: string;
  grade: string;
  unit: MarketUnit;
  quantity: string;
  weightPerUnitKg: string;
  ratePerUnit: string;
};

type ExpenseDraft = {
  key: string;
  label: string;
  isPercentage: boolean;
  value: string;
};

function makeEmptyVegBox(name: string = ''): VegBoxDraft {
  return {
    key: uuidv4(),
    vegetableName: name,
    grade: '',
    unit: 'box',
    quantity: '',
    weightPerUnitKg: '',
    ratePerUnit: '',
  };
}

function makeExpenseDraft(label: string, isPercentage: boolean = false, value: string = ''): ExpenseDraft {
  return {
    key: uuidv4(),
    label,
    isPercentage,
    value,
  };
}

function parseNonNegNumber(raw: string): number {
  const parsed = parseAmount(raw);
  return parsed ?? 0;
}

export function MarketRecordModal({
  visible,
  isMobile,
  t,
  language,
  editingRecord,
  getLastLocation,
  onSave,
  onClose,
  onError,
}: {
  visible: boolean;
  isMobile: boolean;
  t: Copy;
  language: Language;
  editingRecord: MarketRecord | null;
  getLastLocation: () => Promise<MarketLocationDefaults>;
  onSave: (input: MarketRecordInput, editingId: number | null) => Promise<void>;
  onClose: () => void;
  onError: (message: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0);

  const [isDarkSlip, setIsDarkSlip] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locationExpanded, setLocationExpanded] = useState(true);
  const [expensesExpanded, setExpensesExpanded] = useState(false);
  const [buyerSectionExpanded, setBuyerSectionExpanded] = useState(false);

  // Core fields
  const [marketDate, setMarketDate] = useState(todayDateString());
  const [marketOpenTime, setMarketOpenTime] = useState(currentLocalTimeHHMM());
  const [stateVal, setStateVal] = useState('');
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [village, setVillage] = useState('');
  const [marketName, setMarketName] = useState('');

  // Dynamic boxes & expenses
  const [vegBoxes, setVegBoxes] = useState<VegBoxDraft[]>(() => [makeEmptyVegBox()]);
  const [expenses, setExpenses] = useState<ExpenseDraft[]>([]);

  // Settlement, crates, photo & notes
  const [paymentStatus, setPaymentStatus] = useState<MarketPaymentStatus>('cash');
  const [pendingAmount, setPendingAmount] = useState('');
  const [settledAmount, setSettledAmount] = useState('');
  const [agentName, setAgentName] = useState('');
  const [cratesSent, setCratesSent] = useState('');
  const [cratesReturned, setCratesReturned] = useState('');
  const [pattiPhotoUri, setPattiPhotoUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [customItemsNote, setCustomItemsNote] = useState('');
  const [buyerIncome, setBuyerIncome] = useState('');
  const [buyerExpense, setBuyerExpense] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{ date?: string; time?: string; vegetables?: string }>({});

  const locationEditedRef = useRef(false);

  // Sync modal draft state during render when visibility or editingRecord changes
  // (React's recommended pattern to avoid synchronous setState inside useEffect).
  const [prevVisible, setPrevVisible] = useState(false);
  const [prevEditingId, setPrevEditingId] = useState<number | null>(null);
  const currentEditingId = editingRecord ? editingRecord.id : null;

  if (visible !== prevVisible || (visible && currentEditingId !== prevEditingId)) {
    setPrevVisible(visible);
    setPrevEditingId(currentEditingId);
    if (!visible) {
      setKeyboardVisible(false);
    } else {
      setErrors({});
      setSaving(false);
      setIsDarkSlip(isLowLightHour());
      if (editingRecord) {
        setMarketDate(editingRecord.marketDate);
        setMarketOpenTime(editingRecord.marketOpenTime || '03:30');
        setStateVal(editingRecord.state);
        setDistrict(editingRecord.district);
        setTaluk(editingRecord.taluk);
        setVillage(editingRecord.village);
        setMarketName(editingRecord.marketName);
        setLocationExpanded(false);
        setVegBoxes(
          editingRecord.vegetables.length > 0
            ? editingRecord.vegetables.map(v => ({
                key: uuidv4(),
                vegetableName: v.vegetableName,
                grade: v.grade,
                unit: (marketUnits.includes(v.unit as MarketUnit) ? v.unit : 'box') as MarketUnit,
                quantity: v.quantity > 0 ? String(v.quantity) : '',
                weightPerUnitKg: v.weightPerUnitKg != null ? String(v.weightPerUnitKg) : '',
                ratePerUnit: v.ratePerUnit > 0 ? String(v.ratePerUnit) : '',
              }))
            : [makeEmptyVegBox()]
        );
        setExpenses(
          editingRecord.expenses.map(e => ({
            key: uuidv4(),
            label: e.label,
            isPercentage: Boolean(e.isPercentage),
            value: e.isPercentage
              ? (e.percentageValue != null ? String(e.percentageValue) : '')
              : (e.amount > 0 ? String(e.amount) : ''),
          }))
        );
        setExpensesExpanded(editingRecord.expenses.length > 0);
        const safeStatus: MarketPaymentStatus =
          editingRecord.paymentStatus === 'upi' || editingRecord.paymentStatus === 'pending'
            ? editingRecord.paymentStatus
            : 'cash';
        setPaymentStatus(safeStatus);
        setPendingAmount(editingRecord.pendingAmount > 0 ? String(editingRecord.pendingAmount) : '');
        setSettledAmount(editingRecord.settledAmount > 0 ? String(editingRecord.settledAmount) : '');
        setAgentName(editingRecord.agentName);
        setCratesSent(editingRecord.cratesSent > 0 ? String(editingRecord.cratesSent) : '');
        setCratesReturned(editingRecord.cratesReturned > 0 ? String(editingRecord.cratesReturned) : '');
        setPattiPhotoUri(editingRecord.pattiPhotoUri);
        setNotes(editingRecord.notes);
        setCustomItemsNote(editingRecord.customItemsNote ?? '');
        setBuyerIncome(editingRecord.buyerIncome > 0 ? String(editingRecord.buyerIncome) : '');
        setBuyerExpense(editingRecord.buyerExpense > 0 ? String(editingRecord.buyerExpense) : '');
        setBuyerSectionExpanded(editingRecord.buyerIncome > 0 || editingRecord.buyerExpense > 0);
      } else {
        setMarketDate(todayDateString());
        setMarketOpenTime(currentLocalTimeHHMM());
        setStateVal('');
        setDistrict('');
        setTaluk('');
        setVillage('');
        setMarketName('');
        setLocationExpanded(true);
        setVegBoxes([makeEmptyVegBox()]);
        setExpenses([]);
        setExpensesExpanded(false);
        setPaymentStatus('cash');
        setPendingAmount('');
        setSettledAmount('');
        setAgentName('');
        setCratesSent('');
        setCratesReturned('');
        setPattiPhotoUri(null);
        setNotes('');
        setCustomItemsNote('');
        setBuyerIncome('');
        setBuyerExpense('');
        setBuyerSectionExpanded(false);
      }
    }
  }

  // Auto-fill location from last market record / farm_profile when opening a new record
  useEffect(() => {
    if (!visible || editingRecord) return;
    let alive = true;
    locationEditedRef.current = false;

    void getLastLocation()
      .then(loc => {
        if (!alive || locationEditedRef.current) return;
        setStateVal(loc.state);
        setDistrict(loc.district);
        setTaluk(loc.taluk);
        setVillage(loc.village);
        setMarketName(loc.marketName);
        const hasAnyLoc = Boolean(loc.marketName || loc.village || loc.district);
        if (hasAnyLoc) {
          setLocationExpanded(false);
        }
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [visible, editingRecord, getLastLocation]);

  // Keyboard tracking for full-screen mobile responsiveness
  useEffect(() => {
    if (!visible) return;
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const subs = [
      Keyboard.addListener(showEvent, () => {
        if (Platform.OS !== 'web') {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        setKeyboardVisible(true);
      }),
      Keyboard.addListener(hideEvent, () => {
        if (Platform.OS !== 'web') {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        setKeyboardVisible(false);
      }),
    ];
    return () => {
      subs.forEach(s => s.remove());
      Keyboard.dismiss();
    };
  }, [visible]);

  const handleClose = useCallback(() => {
    if (saving) return;
    Keyboard.dismiss();
    onClose();
  }, [onClose, saving]);

  // Live financial calculations
  const grossIncome = useMemo(() => {
    return vegBoxes.reduce((sum, box) => {
      const qty = parseNonNegNumber(box.quantity);
      const rate = parseNonNegNumber(box.ratePerUnit);
      return sum + qty * rate;
    }, 0);
  }, [vegBoxes]);

  const computedExpenses = useMemo(() => {
    return expenses.map(exp => {
      const numericVal = parseNonNegNumber(exp.value);
      const amount = exp.isPercentage ? (grossIncome * numericVal) / 100 : numericVal;
      return {
        ...exp,
        numericVal,
        computedAmount: Math.round(amount * 100) / 100,
      };
    });
  }, [expenses, grossIncome]);

  const totalExpense = useMemo(
    () => computedExpenses.reduce((sum, e) => sum + e.computedAmount, 0),
    [computedExpenses]
  );

  const netProfit = grossIncome - totalExpense;
  const buyerIncomeNum = parseNonNegNumber(buyerIncome);
  const buyerExpenseNum = parseNonNegNumber(buyerExpense);
  const buyerNet = Math.round((buyerIncomeNum - buyerExpenseNum) * 100) / 100;
  const settledAmountNum = parseNonNegNumber(settledAmount);
  const remainingPendingBalance = Math.max(0, Math.round((netProfit - settledAmountNum) * 100) / 100);
  const cratesSentNum = Math.round(parseNonNegNumber(cratesSent));
  const cratesReturnedNum = Math.round(parseNonNegNumber(cratesReturned));
  const pendingCratesCount = Math.max(0, cratesSentNum - cratesReturnedNum);

  // Vegetable Box handlers
  const handleQuickChipPress = (vegLabel: string) => {
    setErrors(prev => (prev.vegetables ? { ...prev, vegetables: undefined } : prev));
    setVegBoxes(prev => {
      const last = prev[prev.length - 1];
      if (last && !last.vegetableName.trim()) {
        return prev.map((b, idx) => (idx === prev.length - 1 ? { ...b, vegetableName: vegLabel } : b));
      }
      return [...prev, makeEmptyVegBox(vegLabel)];
    });
  };

  const updateVegBox = (key: string, patch: Partial<VegBoxDraft>) => {
    setVegBoxes(prev => prev.map(b => (b.key === key ? { ...b, ...patch } : b)));
  };

  const removeVegBox = (key: string) => {
    setVegBoxes(prev => (prev.length <= 1 ? [makeEmptyVegBox()] : prev.filter(b => b.key !== key)));
  };

  // Expense handlers
  const addExpenseRow = (label: string, isPercentage: boolean = false, defaultVal: string = '') => {
    setExpensesExpanded(true);
    setExpenses(prev => [...prev, makeExpenseDraft(label, isPercentage, defaultVal)]);
  };

  const updateExpense = (key: string, patch: Partial<ExpenseDraft>) => {
    setExpenses(prev => prev.map(e => (e.key === key ? { ...e, ...patch } : e)));
  };

  const removeExpense = (key: string) => {
    setExpenses(prev => prev.filter(e => e.key !== key));
  };

  // Patti photo attach (persisted into vault/ like ReceiptVault)
  const copyPhotoToVault = async (sourceUri: string): Promise<string> => {
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
        const ext = sourceUri.split('.').pop()?.split('?')[0] || 'jpg';
        const destUri = `${vaultDir}patti_${Date.now()}_${uuidv4().slice(0, 8)}.${ext}`;
        await FileSystem.copyAsync({ from: sourceUri, to: destUri });
        return destUri;
      }
    } catch (err) {
      console.warn('Could not copy patti photo to vault folder, using picked URI:', err);
    }
    return sourceUri;
  };

  const handleAttachPhoto = async (source: 'camera' | 'gallery') => {
    try {
      if (source === 'camera') {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) {
          Alert.alert(t.vaultPermRequiredTitle, t.vaultCameraPermMsg);
          return;
        }
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
        if (!result.canceled && result.assets?.[0]?.uri) {
          const savedUri = await copyPhotoToVault(result.assets[0].uri);
          setPattiPhotoUri(savedUri);
        }
      } else {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
          Alert.alert(t.vaultPermRequiredTitle, t.vaultGalleryPermMsg);
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
        if (!result.canceled && result.assets?.[0]?.uri) {
          const savedUri = await copyPhotoToVault(result.assets[0].uri);
          setPattiPhotoUri(savedUri);
        }
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : t.vaultGalleryErrorMsg);
    }
  };

  const handleSave = async () => {
    const nextErrors: typeof errors = {};
    if (!isValidDateString(marketDate)) {
      nextErrors.date = t.invalidDate;
    }
    if (!isValidTimeHHMM(marketOpenTime)) {
      nextErrors.time = t.invalidTime;
    }
    const validVegs = vegBoxes.filter(b => b.vegetableName.trim().length > 0);
    if (validVegs.length === 0) {
      nextErrors.vegetables = t.atLeastOneVegetable;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const resolvedPendingAmount =
      paymentStatus === 'pending'
        ? pendingAmount.trim().length > 0
          ? parseNonNegNumber(pendingAmount)
          : settledAmountNum > 0
            ? remainingPendingBalance
            : 0
        : 0;
    const resolvedSettledAmount =
      paymentStatus === 'pending'
        ? settledAmountNum
        : settledAmount.trim().length > 0
          ? settledAmountNum
          : Math.max(0, Math.round(netProfit * 100) / 100);

    const input: MarketRecordInput = {
      marketDate: marketDate.trim(),
      marketOpenTime: marketOpenTime.trim(),
      state: stateVal.trim(),
      district: district.trim(),
      taluk: taluk.trim(),
      village: village.trim(),
      marketName: marketName.trim(),
      grossIncome,
      totalExpense,
      netProfit,
      paymentStatus,
      pendingAmount: resolvedPendingAmount,
      agentName: agentName.trim(),
      cratesSent: cratesSentNum,
      cratesReturned: cratesReturnedNum,
      pattiPhotoUri,
      notes: notes.trim(),
      customItemsNote: customItemsNote.trim() || null,
      buyerIncome: buyerIncomeNum,
      buyerExpense: buyerExpenseNum,
      settledAmount: resolvedSettledAmount,
      vegetables: validVegs.map((v, idx) => {
        const quantity = parseNonNegNumber(v.quantity);
        const ratePerUnit = parseNonNegNumber(v.ratePerUnit);
        const weight = parseAmount(v.weightPerUnitKg);
        return {
          vegetableName: v.vegetableName.trim(),
          grade: v.grade.trim(),
          unit: v.unit,
          quantity,
          weightPerUnitKg: weight,
          ratePerUnit,
          totalAmount: quantity * ratePerUnit,
          sortOrder: idx,
        };
      }),
      expenses: computedExpenses
        .filter(e => e.label.trim().length > 0 || e.computedAmount > 0)
        .map((e, idx) => ({
          label: e.label.trim() || t.expenses,
          isPercentage: e.isPercentage,
          percentageValue: e.isPercentage ? e.numericVal : null,
          amount: e.computedAmount,
          sortOrder: idx,
        })),
    };

    setSaving(true);
    try {
      await onSave(input, editingRecord ? editingRecord.id : null);
      Keyboard.dismiss();
      onClose();
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  // Theme tokens for Light vs Early-Morning Dark Slip Mode
  const theme = isDarkSlip
    ? {
        sheetBg: '#0E1A14',
        cardBg: '#16261D',
        cardBorder: '#2A4234',
        inputBg: '#112018',
        inputBorder: '#2E4C3A',
        text: '#EFF8F1',
        muted: '#9AB8A4',
        accent: '#4ADE80',
        accentBg: '#183826',
        chipBg: '#1B2E23',
        chipBorder: '#2E4B39',
        chipSelectedBg: '#1F4D32',
        chipSelectedBorder: '#4ADE80',
        footerBg: '#0B1610',
        footerBorder: '#274031',
        profitColor: '#4ADE80',
        lossColor: '#F87171',
      }
    : {
        sheetBg: '#FFFFFF',
        cardBg: '#F9FCF9',
        cardBorder: '#DCE8DE',
        inputBg: '#FFFFFF',
        inputBorder: '#D5E2D8',
        text: INK,
        muted: MUTED,
        accent: GREEN,
        accentBg: LIGHT_GREEN,
        chipBg: '#FFFFFF',
        chipBorder: '#DCE7DE',
        chipSelectedBg: LIGHT_GREEN,
        chipSelectedBorder: GREEN,
        footerBg: '#F4FAF5',
        footerBorder: '#D3E6D6',
        profitColor: '#15803D',
        lossColor: DANGER,
      };

  const locationSummary = [marketName, village, taluk, district, stateVal].filter(Boolean).join(' · ');

  return (
    <Modal
      visible={visible}
      animationType={isMobile ? 'slide' : 'fade'}
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[shared.modalBackdrop, !isMobile && shared.modalBackdropCentered]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.sheetBg },
            !isMobile && styles.sheetDesktop,
            isMobile && {
              flex: 1,
              width: '100%',
              marginTop: keyboardVisible ? 0 : Math.max(topInset, 10),
              paddingTop: keyboardVisible ? Math.max(topInset, 10) + 4 : 10,
              borderTopLeftRadius: keyboardVisible ? 0 : 22,
              borderTopRightRadius: keyboardVisible ? 0 : 22,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
                {editingRecord ? t.editMarketRecord : t.newMarketRecord}
              </Text>
              {editingRecord && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Ionicons name="pricetag-outline" size={11} color={theme.muted} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.muted }}>
                    {formatMarketSlipCode(editingRecord)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setIsDarkSlip(v => !v)}
                style={[styles.darkToggleBtn, { backgroundColor: theme.accentBg, borderColor: theme.cardBorder }]}
                accessibilityRole="button"
                accessibilityLabel={isDarkSlip ? t.darkSlipModeOff : t.darkSlipModeOn}
              >
                <Ionicons
                  name={isDarkSlip ? 'sunny-outline' : 'moon-outline'}
                  size={15}
                  color={theme.accent}
                />
                <Text style={[styles.darkToggleText, { color: theme.accent }]}>
                  {isDarkSlip ? t.darkSlipModeOff : t.darkSlipModeOn}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose} hitSlop={8} style={styles.closeBtn}>
                <Text style={[styles.closeText, { color: theme.muted }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Scrollable Form */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Date & Auto-Fetched Time Card */}
            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={styles.rowGap}>
                <View style={{ flex: 1 }}>
                  <View style={styles.labelActionRow}>
                    <Text style={[styles.miniLabel, { color: theme.muted }]}>{t.marketDateLabel} *</Text>
                    <TouchableOpacity onPress={() => setMarketDate(todayDateString())} hitSlop={6}>
                      <Text style={[styles.actionLink, { color: theme.accent }]}>{t.today}</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    value={marketDate}
                    onChangeText={v => {
                      setMarketDate(v);
                      if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
                    }}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.muted}
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                    style={[
                      styles.compactInput,
                      { backgroundColor: theme.inputBg, borderColor: errors.date ? DANGER : theme.inputBorder, color: theme.text },
                    ]}
                  />
                  {!!errors.date && <Text style={shared.fieldError}>{errors.date}</Text>}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.labelActionRow}>
                    <Text style={[styles.miniLabel, { color: theme.muted }]}>{t.marketTimeLabel} *</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setMarketOpenTime(currentLocalTimeHHMM());
                        if (errors.time) setErrors(prev => ({ ...prev, time: undefined }));
                      }}
                      style={[styles.nowBtn, { backgroundColor: theme.accentBg }]}
                      hitSlop={6}
                    >
                      <Ionicons name="time-outline" size={12} color={theme.accent} />
                      <Text style={[styles.nowBtnText, { color: theme.accent }]}>{t.timeNowBtn}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.timeInputWrap}>
                    <TextInput
                      value={marketOpenTime}
                      onChangeText={v => {
                        setMarketOpenTime(v);
                        if (errors.time) setErrors(prev => ({ ...prev, time: undefined }));
                      }}
                      placeholder="03:30"
                      placeholderTextColor={theme.muted}
                      keyboardType="numbers-and-punctuation"
                      maxLength={5}
                      style={[
                        styles.compactInput,
                        { flex: 1, backgroundColor: theme.inputBg, borderColor: errors.time ? DANGER : theme.inputBorder, color: theme.text },
                      ]}
                    />
                    {isValidTimeHHMM(marketOpenTime) && (
                      <View style={[styles.time12Badge, { backgroundColor: theme.accentBg }]}>
                        <Text style={[styles.time12Text, { color: theme.accent }]}>
                          {formatDisplayTime12h(marketOpenTime)}
                        </Text>
                      </View>
                    )}
                  </View>
                  {!!errors.time && <Text style={shared.fieldError}>{errors.time}</Text>}
                </View>
              </View>

              {/* Collapsible Location Sub-section */}
              <TouchableOpacity
                onPress={() => setLocationExpanded(v => !v)}
                style={[styles.collapseRow, { borderTopColor: theme.cardBorder }]}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name="location-outline" size={15} color={theme.accent} />
                    <Text style={[styles.collapseTitle, { color: theme.text }]}>
                      {t.marketLocationHeading}
                    </Text>
                  </View>
                  {!locationExpanded && (
                    <Text style={[styles.collapseSub, { color: theme.muted }]} numberOfLines={1}>
                      {locationSummary || t.marketNamePlaceholder}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name={locationExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={theme.muted}
                />
              </TouchableOpacity>

              {locationExpanded && (
                <View style={{ marginTop: 4 }}>
                  <FormField
                    label={t.marketNameLabel}
                    value={marketName}
                    onChangeText={v => { locationEditedRef.current = true; setMarketName(v); }}
                    placeholder={t.marketNamePlaceholder}
                    dark={isDarkSlip}
                  />
                  <View style={styles.rowGap}>
                    <View style={{ flex: 1 }}>
                      <FormField
                        label={t.village}
                        value={village}
                        onChangeText={v => { locationEditedRef.current = true; setVillage(v); }}
                        placeholder={t.villagePlaceholder}
                        dark={isDarkSlip}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <FormField
                        label={t.taluk}
                        value={taluk}
                        onChangeText={v => { locationEditedRef.current = true; setTaluk(v); }}
                        placeholder={t.talukPlaceholder}
                        dark={isDarkSlip}
                      />
                    </View>
                  </View>
                  <View style={styles.rowGap}>
                    <View style={{ flex: 1 }}>
                      <FormField
                        label={t.district}
                        value={district}
                        onChangeText={v => { locationEditedRef.current = true; setDistrict(v); }}
                        placeholder={t.districtPlaceholder}
                        dark={isDarkSlip}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <FormField
                        label={t.stateField}
                        value={stateVal}
                        onChangeText={v => { locationEditedRef.current = true; setStateVal(v); }}
                        placeholder={t.statePlaceholder}
                        dark={isDarkSlip}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Dynamic + Vegetable Boxes Section */}
            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
                  <Ionicons name="basket-outline" size={16} color={theme.accent} />
                  <Text style={[styles.sectionHeading, { color: theme.text }]}>
                    {t.vegetableBoxesHeading} ({vegBoxes.length})
                  </Text>
                </View>
                <Text style={[styles.sectionTotal, { color: theme.accent }]}>
                  {formatINR(grossIncome)}
                </Text>
              </View>

              <Text style={[styles.miniLabel, { color: theme.muted, marginBottom: 6 }]}>
                {t.quickAddVegetables}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickChipScroll}
              >
                {quickVegetableNames[language].map(veg => (
                  <TouchableOpacity
                    key={veg}
                    onPress={() => handleQuickChipPress(veg)}
                    style={[styles.quickChip, { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                  >
                    <Text style={[styles.quickChipText, { color: theme.text }]}>＋ {veg}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {!!errors.vegetables && (
                <Text style={[shared.fieldError, { marginBottom: 8 }]}>{errors.vegetables}</Text>
              )}

              {vegBoxes.map((box, index) => {
                const lineTotal = parseNonNegNumber(box.quantity) * parseNonNegNumber(box.ratePerUnit);
                return (
                  <View
                    key={box.key}
                    style={[styles.boxCard, { backgroundColor: theme.inputBg, borderColor: theme.cardBorder }]}
                  >
                    <View style={styles.boxCardHeader}>
                      <View style={[styles.boxIndexPill, { backgroundColor: theme.accentBg }]}>
                        <Text style={[styles.boxIndexText, { color: theme.accent }]}>#{index + 1}</Text>
                      </View>
                      <Text style={[styles.lineTotalText, { color: theme.profitColor }]}>
                        {t.lineTotalLabel}: {formatINR(lineTotal)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeVegBox(box.key)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t.removeItem}
                      >
                        <Ionicons name="trash-outline" size={18} color={DANGER} />
                      </TouchableOpacity>
                    </View>

                    <FormField
                      label={t.vegetableNameLabel}
                      value={box.vegetableName}
                      onChangeText={v => {
                        updateVegBox(box.key, { vegetableName: v });
                        if (errors.vegetables) setErrors(prev => ({ ...prev, vegetables: undefined }));
                      }}
                      placeholder={t.vegetableNamePlaceholder}
                      required
                      dark={isDarkSlip}
                    />

                    <FormField
                      label={t.gradeOptionalLabel}
                      value={box.grade}
                      onChangeText={v => updateVegBox(box.key, { grade: v })}
                      placeholder={t.gradePlaceholder}
                      dark={isDarkSlip}
                    />

                    <Text style={[styles.miniLabel, { color: theme.muted, marginTop: 10, marginBottom: 6 }]}>
                      {t.unit}
                    </Text>
                    <View style={styles.unitChipWrap}>
                      {marketUnits.map(u => {
                        const selected = box.unit === u;
                        return (
                          <TouchableOpacity
                            key={u}
                            onPress={() => updateVegBox(box.key, { unit: u })}
                            style={[
                              styles.unitChip,
                              {
                                backgroundColor: selected ? theme.chipSelectedBg : theme.chipBg,
                                borderColor: selected ? theme.chipSelectedBorder : theme.chipBorder,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.unitChipText,
                                { color: selected ? theme.accent : theme.muted },
                              ]}
                            >
                              {marketUnitLabels[language][u]}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View style={[styles.rowGap, { marginTop: 10 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.miniLabel, { color: theme.muted }]}>{t.quantity}</Text>
                        <TextInput
                          value={box.quantity}
                          onChangeText={v => updateVegBox(box.key, { quantity: v })}
                          placeholder="0"
                          placeholderTextColor={theme.muted}
                          keyboardType="decimal-pad"
                          style={[
                            styles.compactInput,
                            { backgroundColor: theme.cardBg, borderColor: theme.inputBorder, color: theme.text },
                          ]}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.miniLabel, { color: theme.muted }]}>{t.ratePerUnitLabel}</Text>
                        <TextInput
                          value={box.ratePerUnit}
                          onChangeText={v => updateVegBox(box.key, { ratePerUnit: v })}
                          placeholder="0"
                          placeholderTextColor={theme.muted}
                          keyboardType="decimal-pad"
                          style={[
                            styles.compactInput,
                            { backgroundColor: theme.cardBg, borderColor: theme.inputBorder, color: theme.text },
                          ]}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.miniLabel, { color: theme.muted }]} numberOfLines={1}>
                          {t.weightPerUnitLabel}
                        </Text>
                        <TextInput
                          value={box.weightPerUnitKg}
                          onChangeText={v => updateVegBox(box.key, { weightPerUnitKg: v })}
                          placeholder="kg"
                          placeholderTextColor={theme.muted}
                          keyboardType="decimal-pad"
                          style={[
                            styles.compactInput,
                            { backgroundColor: theme.cardBg, borderColor: theme.inputBorder, color: theme.text },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity
                onPress={() => setVegBoxes(prev => [...prev, makeEmptyVegBox()])}
                style={[styles.addBoxBtn, { backgroundColor: theme.accentBg, borderColor: theme.accent }]}
              >
                <Ionicons name="add-circle" size={18} color={theme.accent} />
                <Text style={[styles.addBoxBtnText, { color: theme.accent }]}>
                  ＋ {t.addVegetableBox}
                </Text>
              </TouchableOpacity>

              <View style={{ marginTop: 10 }}>
                <FormField
                  label={t.customItemsNoteLabel}
                  value={customItemsNote}
                  onChangeText={setCustomItemsNote}
                  placeholder={t.customItemsNotePlaceholder}
                  multiline
                  dark={isDarkSlip}
                />
              </View>
            </View>

            {/* Collapsible Market Expenses Section */}
            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <TouchableOpacity
                onPress={() => setExpensesExpanded(v => !v)}
                style={styles.sectionHeaderRow}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
                  <Ionicons name="receipt-outline" size={16} color={theme.accent} />
                  <Text style={[styles.sectionHeading, { color: theme.text }]}>
                    {t.marketExpensesHeading} ({expenses.length})
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.sectionTotal, { color: theme.lossColor }]}>
                    - {formatINR(totalExpense)}
                  </Text>
                  <Ionicons
                    name={expensesExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={theme.muted}
                  />
                </View>
              </TouchableOpacity>

              {expensesExpanded && (
                <View style={{ marginTop: 10 }}>
                  <View style={styles.presetWrap}>
                    <TouchableOpacity
                      onPress={() => addExpenseRow(t.expenseCommissionPreset, true, '8')}
                      style={[styles.presetBtn, { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                    >
                      <Text style={[styles.presetBtnText, { color: theme.text }]}>
                        ＋ {t.expenseCommissionPreset} (%)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => addExpenseRow(t.expenseTransportPreset, false, '')}
                      style={[styles.presetBtn, { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                    >
                      <Text style={[styles.presetBtnText, { color: theme.text }]}>
                        ＋ {t.expenseTransportPreset}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => addExpenseRow(t.expenseHamaliPreset, false, '')}
                      style={[styles.presetBtn, { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                    >
                      <Text style={[styles.presetBtnText, { color: theme.text }]}>
                        ＋ {t.expenseHamaliPreset}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => addExpenseRow(t.expenseCrateRentPreset, false, '')}
                      style={[styles.presetBtn, { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                    >
                      <Text style={[styles.presetBtnText, { color: theme.text }]}>
                        ＋ {t.expenseCrateRentPreset}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {computedExpenses.map(exp => (
                    <View
                      key={exp.key}
                      style={[styles.expenseRowCard, { backgroundColor: theme.inputBg, borderColor: theme.cardBorder }]}
                    >
                      <View style={styles.expenseTopRow}>
                        <TextInput
                          value={exp.label}
                          onChangeText={v => updateExpense(exp.key, { label: v })}
                          placeholder={t.expenseLabelPlaceholder}
                          placeholderTextColor={theme.muted}
                          style={[
                            styles.compactInput,
                            { flex: 1, backgroundColor: theme.cardBg, borderColor: theme.inputBorder, color: theme.text },
                          ]}
                        />
                        <TouchableOpacity onPress={() => removeExpense(exp.key)} hitSlop={8}>
                          <Ionicons name="close-circle-outline" size={20} color={DANGER} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.expenseBottomRow}>
                        <TouchableOpacity
                          onPress={() => updateExpense(exp.key, { isPercentage: !exp.isPercentage })}
                          style={[
                            styles.modeTogglePill,
                            { backgroundColor: theme.accentBg, borderColor: theme.accent },
                          ]}
                        >
                          <Text style={[styles.modeToggleText, { color: theme.accent }]}>
                            {exp.isPercentage ? t.expensePercentToggle : t.expenseFlatToggle}
                          </Text>
                        </TouchableOpacity>
                        <TextInput
                          value={exp.value}
                          onChangeText={v => updateExpense(exp.key, { value: v })}
                          placeholder={exp.isPercentage ? t.expensePercentPlaceholder : '0'}
                          placeholderTextColor={theme.muted}
                          keyboardType="decimal-pad"
                          style={[
                            styles.compactInput,
                            { width: 92, backgroundColor: theme.cardBg, borderColor: theme.inputBorder, color: theme.text },
                          ]}
                        />
                        <Text style={[styles.expenseComputedText, { color: theme.lossColor }]}>
                          {formatINR(exp.computedAmount)}
                        </Text>
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    onPress={() => addExpenseRow('', false, '')}
                    style={[styles.addExpenseBtn, { borderColor: theme.cardBorder }]}
                  >
                    <Text style={[styles.addExpenseBtnText, { color: theme.accent }]}>
                      ＋ {t.addCustomExpense}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Optional Collapsible Buyer / Marketer Income & Expenses Section */}
            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <TouchableOpacity
                onPress={() => setBuyerSectionExpanded(v => !v)}
                style={styles.sectionHeaderRow}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
                  <Ionicons name="briefcase-outline" size={16} color={theme.accent} />
                  <Text style={[styles.sectionHeading, { color: theme.text }]}>
                    {t.buyerMarketerSectionHeading}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {(buyerIncomeNum > 0 || buyerExpenseNum > 0) && (
                    <Text
                      style={[
                        styles.sectionTotal,
                        { color: buyerNet < 0 ? theme.lossColor : theme.profitColor },
                      ]}
                    >
                      {formatINR(buyerNet)}
                    </Text>
                  )}
                  <Ionicons
                    name={buyerSectionExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={theme.muted}
                  />
                </View>
              </TouchableOpacity>

              {buyerSectionExpanded && (
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.buyerHintText, { color: theme.muted }]}>
                    {t.buyerMarketerSectionHint}
                  </Text>
                  <View style={[styles.rowGap, { marginTop: 8 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.miniLabel, { color: theme.muted }]}>
                        {t.buyerIncomeLabel}
                      </Text>
                      <TextInput
                        value={buyerIncome}
                        onChangeText={setBuyerIncome}
                        placeholder="0"
                        placeholderTextColor={theme.muted}
                        keyboardType="decimal-pad"
                        style={[
                          styles.compactInput,
                          { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text },
                        ]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.miniLabel, { color: theme.muted }]}>
                        {t.buyerExpenseLabel}
                      </Text>
                      <TextInput
                        value={buyerExpense}
                        onChangeText={setBuyerExpense}
                        placeholder="0"
                        placeholderTextColor={theme.muted}
                        keyboardType="decimal-pad"
                        style={[
                          styles.compactInput,
                          { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text },
                        ]}
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      styles.buyerNetSummaryRow,
                      {
                        backgroundColor: theme.accentBg,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                  >
                    <Text style={[styles.buyerNetLabel, { color: theme.muted }]}>
                      {t.buyerMarketerNetLabel}
                    </Text>
                    <Text
                      style={[
                        styles.buyerNetValue,
                        { color: buyerNet < 0 ? theme.lossColor : theme.profitColor },
                      ]}
                    >
                      {formatINR(buyerNet)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Settlement, Crates & Patti Photo Section */}
            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Ionicons name="card-outline" size={16} color={theme.accent} />
                <Text style={[styles.sectionHeading, { color: theme.text }]}>
                  {t.settlementHeading}
                </Text>
              </View>

              <Text style={[styles.miniLabel, { color: theme.muted, marginBottom: 6 }]}>
                {t.paymentStatusLabel}
              </Text>
              <View style={styles.unitChipWrap}>
                {marketPaymentStatuses.map(status => {
                  const selected = paymentStatus === status;
                  return (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setPaymentStatus(status)}
                      style={[
                        styles.unitChip,
                        {
                          backgroundColor: selected ? theme.chipSelectedBg : theme.chipBg,
                          borderColor: selected ? theme.chipSelectedBorder : theme.chipBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.unitChipText,
                          { color: selected ? theme.accent : theme.muted },
                        ]}
                      >
                        {marketPaymentStatusLabels[language][status]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {paymentStatus === 'pending' && (
                <View style={{ marginTop: 10 }}>
                  <View style={styles.rowGap}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.miniLabel, { color: theme.muted }]}>
                        {t.settledAmountLabel}
                      </Text>
                      <TextInput
                        value={settledAmount}
                        onChangeText={setSettledAmount}
                        placeholder="0"
                        placeholderTextColor={theme.muted}
                        keyboardType="decimal-pad"
                        style={[
                          styles.compactInput,
                          { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text },
                        ]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.labelActionRow}>
                        <Text style={[styles.miniLabel, { color: theme.muted, marginBottom: 0 }]}>
                          {t.pendingAmountLabel}
                        </Text>
                        {remainingPendingBalance > 0 && (
                          <TouchableOpacity
                            onPress={() => setPendingAmount(String(remainingPendingBalance))}
                            style={[styles.nowBtn, { backgroundColor: theme.accentBg }]}
                          >
                            <Text style={[styles.actionLink, { color: theme.accent }]}>
                              {t.fillPendingBalanceBtn}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <TextInput
                        value={pendingAmount}
                        onChangeText={setPendingAmount}
                        placeholder={remainingPendingBalance > 0 ? String(Math.round(remainingPendingBalance)) : '0'}
                        placeholderTextColor={theme.muted}
                        keyboardType="decimal-pad"
                        style={[
                          styles.compactInput,
                          { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              )}

              <FormField
                label={t.agentNameLabel}
                value={agentName}
                onChangeText={setAgentName}
                placeholder={t.agentNamePlaceholder}
                dark={isDarkSlip}
              />

              <View style={[styles.rowGap, { marginTop: 10 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.miniLabel, { color: theme.muted }]}>{t.cratesSentLabel}</Text>
                  <TextInput
                    value={cratesSent}
                    onChangeText={setCratesSent}
                    placeholder="0"
                    placeholderTextColor={theme.muted}
                    keyboardType="number-pad"
                    style={[
                      styles.compactInput,
                      { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text },
                    ]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.miniLabel, { color: theme.muted }]}>{t.cratesReturnedLabel}</Text>
                  <TextInput
                    value={cratesReturned}
                    onChangeText={setCratesReturned}
                    placeholder="0"
                    placeholderTextColor={theme.muted}
                    keyboardType="number-pad"
                    style={[
                      styles.compactInput,
                      { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text },
                    ]}
                  />
                </View>
              </View>

              {pendingCratesCount > 0 && (
                <View style={styles.crateWarnBadge}>
                  <Ionicons name="alert-circle-outline" size={14} color="#92400E" />
                  <Text style={styles.crateWarnText}>
                    {t.cratesPendingBadge.replace('{count}', String(pendingCratesCount))}
                  </Text>
                </View>
              )}

              {/* Patti Photo */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14, marginBottom: 6 }}>
                <Ionicons name="camera-outline" size={14} color={theme.muted} />
                <Text style={[styles.miniLabel, { color: theme.muted, marginBottom: 0 }]}>
                  {t.attachPattiPhoto}
                </Text>
              </View>
              <View style={styles.rowGap}>
                <TouchableOpacity
                  onPress={() => void handleAttachPhoto('camera')}
                  style={[styles.photoBtn, { backgroundColor: theme.accentBg, borderColor: theme.cardBorder }]}
                >
                  <Ionicons name="camera-outline" size={16} color={theme.accent} />
                  <Text style={[styles.photoBtnText, { color: theme.accent }]}>{t.pattiCameraBtn}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => void handleAttachPhoto('gallery')}
                  style={[styles.photoBtn, { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                >
                  <Ionicons name="images-outline" size={16} color={theme.text} />
                  <Text style={[styles.photoBtnText, { color: theme.text }]}>{t.pattiGalleryBtn}</Text>
                </TouchableOpacity>
              </View>

              {pattiPhotoUri && (
                <View style={[styles.photoPreviewRow, { borderColor: theme.cardBorder }]}>
                  <Image source={{ uri: pattiPhotoUri }} style={styles.photoThumb} resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => setPattiPhotoUri(null)}
                    style={styles.removePhotoBtn}
                  >
                    <Ionicons name="trash-outline" size={15} color={DANGER} />
                    <Text style={styles.removePhotoText}>{t.removePattiPhoto}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <FormField
                label={t.notes}
                value={notes}
                onChangeText={setNotes}
                placeholder={t.notesPlaceholder}
                multiline
                dark={isDarkSlip}
              />
            </View>
          </ScrollView>

          {/* Sticky Bottom Net Profit Summary Bar */}
          <View
            style={[
              styles.stickyFooter,
              {
                backgroundColor: theme.footerBg,
                borderTopColor: theme.footerBorder,
                paddingBottom: Math.max(12, insets.bottom + 8),
              },
            ]}
          >
            <View style={styles.stickyTotalsRow}>
              <View style={styles.stickyCol}>
                <Text style={[styles.stickyLabel, { color: theme.muted }]} numberOfLines={1}>
                  {t.marketGrossIncome}
                </Text>
                <Text style={[styles.stickyVal, { color: theme.text }]} numberOfLines={1}>
                  {formatINR(grossIncome)}
                </Text>
              </View>
              <View style={styles.stickyCol}>
                <Text style={[styles.stickyLabel, { color: theme.muted }]} numberOfLines={1}>
                  {t.marketTotalExpenses}
                </Text>
                <Text style={[styles.stickyVal, { color: theme.lossColor }]} numberOfLines={1}>
                  -{formatINR(totalExpense)}
                </Text>
              </View>
              <View style={styles.stickyCol}>
                <Text style={[styles.stickyLabel, { color: theme.muted }]} numberOfLines={1}>
                  {netProfit < 0 ? t.marketNetLoss : t.marketNetProfit}
                </Text>
                <Text
                  style={[
                    styles.stickyNetVal,
                    { color: netProfit < 0 ? theme.lossColor : theme.profitColor },
                  ]}
                  numberOfLines={1}
                >
                  {formatINR(netProfit)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => void handleSave()}
              disabled={saving}
              style={[styles.savePrimaryBtn, saving && { opacity: 0.7 }]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.savePrimaryText}>✓ {t.save}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    overflow: 'hidden',
  },
  sheetDesktop: {
    borderRadius: 22,
    width: '100%',
    maxWidth: 660,
    maxHeight: '92%',
    height: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  darkToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  darkToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 20,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    flexShrink: 1,
  },
  sectionTotal: {
    fontSize: 14,
    fontWeight: '800',
  },
  rowGap: {
    flexDirection: 'row',
    gap: 10,
  },
  labelActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionLink: {
    fontSize: 11,
    fontWeight: '800',
  },
  nowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  buyerHintText: {
    fontSize: 11,
    lineHeight: 16,
  },
  buyerNetSummaryRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 11,
    borderWidth: 1,
  },
  buyerNetLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  buyerNetValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  nowBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  timeInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time12Badge: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  time12Text: {
    fontSize: 11,
    fontWeight: '800',
  },
  compactInput: {
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    fontWeight: '600',
  },
  collapseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
    gap: 8,
  },
  collapseTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  collapseSub: {
    fontSize: 12,
    marginTop: 2,
  },
  quickChipScroll: {
    gap: 7,
    paddingBottom: 10,
  },
  quickChip: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  boxCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  boxCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  boxIndexPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  boxIndexText: {
    fontSize: 11,
    fontWeight: '800',
  },
  lineTotalText: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
    textAlign: 'right',
    marginRight: 6,
  },
  unitChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  unitChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  unitChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addBoxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 4,
  },
  addBoxBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  presetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  presetBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  expenseRowCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    gap: 8,
  },
  expenseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expenseBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeTogglePill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '800',
  },
  expenseComputedText: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '800',
  },
  addExpenseBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 2,
  },
  addExpenseBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  crateWarnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 8,
  },
  crateWarnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
  },
  photoBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  photoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    padding: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  photoThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#E5EDE7',
  },
  removePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  removePhotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: DANGER,
  },
  stickyFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
  },
  stickyTotalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  stickyCol: {
    flex: 1,
    minWidth: 0,
  },
  stickyLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stickyVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  stickyNetVal: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  savePrimaryBtn: {
    backgroundColor: GREEN,
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
