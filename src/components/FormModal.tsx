import React, {
  createContext,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shared } from '../styles/shared';

export type FormModalScrollContextValue = {
  scrollToNode: (targetRef: RefObject<View | null>, options?: { preferEnd?: boolean }) => void;
  scrollToEnd: () => void;
};

const FormModalScrollContext = createContext<FormModalScrollContextValue | null>(null);

export function useFormModalScroll(): FormModalScrollContextValue | null {
  return useContext(FormModalScrollContext);
}

export function FormModal({
  visible,
  title,
  isMobile,
  onClose,
  children,
  fullScreenOnMobile = true,
}: {
  visible: boolean;
  title: string;
  isMobile: boolean;
  onClose: () => void;
  children: ReactNode;
  fullScreenOnMobile?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [lastVisible, setLastVisible] = useState(visible);
  if (visible !== lastVisible) {
    setLastVisible(visible);
    if (!visible) {
      setKeyboardVisible(false);
    }
  }

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollContentRef = useRef<View>(null);
  const activeFocusRef = useRef<{ targetRef: RefObject<View | null>; preferEnd?: boolean } | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearScrollTimer = useCallback(() => {
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
  }, []);

  const performScrollToTarget = useCallback((targetRef: RefObject<View | null>, preferEnd?: boolean) => {
    const scrollView = scrollViewRef.current;
    if (!scrollView) return;

    if (preferEnd) {
      scrollView.scrollToEnd({ animated: true });
      return;
    }

    const targetNode = targetRef.current;
    const contentNode = scrollContentRef.current;
    if (targetNode && contentNode && typeof targetNode.measureLayout === 'function') {
      try {
        targetNode.measureLayout(
          contentNode,
          (_x, y) => {
            scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true });
          },
          () => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          },
        );
        return;
      } catch {
        // Fallback below if layout measurement is not ready yet
      }
    }

    scrollView.scrollToEnd({ animated: true });
  }, []);

  const scrollToNode = useCallback(
    (targetRef: RefObject<View | null>, options?: { preferEnd?: boolean }) => {
      activeFocusRef.current = { targetRef, preferEnd: options?.preferEnd };
      performScrollToTarget(targetRef, options?.preferEnd);
      clearScrollTimer();
      scrollTimerRef.current = setTimeout(() => {
        performScrollToTarget(targetRef, options?.preferEnd);
      }, 180);
    },
    [clearScrollTimer, performScrollToTarget],
  );

  const scrollToEnd = useCallback(() => {
    activeFocusRef.current = null;
    scrollViewRef.current?.scrollToEnd({ animated: true });
    clearScrollTimer();
    scrollTimerRef.current = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 180);
  }, [clearScrollTimer]);

  const scrollContextValue = useMemo<FormModalScrollContextValue>(
    () => ({ scrollToNode, scrollToEnd }),
    [scrollToNode, scrollToEnd],
  );

  useEffect(() => {
    if (!visible) {
      activeFocusRef.current = null;
      clearScrollTimer();
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const scheduleActiveScroll = (delayMs: number) => {
      const active = activeFocusRef.current;
      if (!active) return;
      clearScrollTimer();
      scrollTimerRef.current = setTimeout(() => {
        performScrollToTarget(active.targetRef, active.preferEnd);
      }, delayMs);
    };

    const subs = [
      Keyboard.addListener(showEvent, () => {
        if (Platform.OS !== 'web') {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        setKeyboardVisible(true);
        scheduleActiveScroll(80);
      }),
      Keyboard.addListener(hideEvent, () => {
        if (Platform.OS !== 'web') {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        setKeyboardVisible(false);
        activeFocusRef.current = null;
        clearScrollTimer();
      }),
    ];

    if (Platform.OS === 'ios') {
      subs.push(
        Keyboard.addListener('keyboardDidShow', () => {
          scheduleActiveScroll(60);
        }),
      );
    }

    return () => {
      subs.forEach(sub => sub.remove());
      clearScrollTimer();
      Keyboard.dismiss();
    };
  }, [visible, clearScrollTimer, performScrollToTarget]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const isExpandedMobile = isMobile && (fullScreenOnMobile || keyboardVisible);

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
            shared.modalSheet,
            !isMobile && shared.modalSheetCentered,
            !isMobile && { maxHeight: '90%' },
            isMobile && !isExpandedMobile && {
              maxHeight: '90%',
              paddingBottom: Math.max(28, insets.bottom + 12),
            },
            isExpandedMobile && !keyboardVisible && {
              flex: 1,
              width: '100%',
              maxHeight: '96%',
              marginTop: Math.max(topInset, 12),
              paddingBottom: 0,
            },
            isExpandedMobile && keyboardVisible && {
              flex: 1,
              width: '100%',
              height: '100%',
              maxHeight: '100%',
              marginTop: 0,
              paddingTop: Math.max(topInset, 12) + 6,
              paddingBottom: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            },
          ]}
        >
          {!(isExpandedMobile && keyboardVisible) && <View style={shared.modalHandle} />}
          <View style={shared.modalHeader}>
            <Text style={shared.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={8}>
              <Text style={shared.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <FormModalScrollContext.Provider value={scrollContextValue}>
            <ScrollView
              ref={scrollViewRef}
              style={isExpandedMobile ? styles.expandedScroll : shared.modalSheetScroll}
              contentContainerStyle={{
                paddingBottom: isExpandedMobile
                  ? (keyboardVisible ? 160 : Math.max(120, insets.bottom + 40))
                  : (keyboardVisible ? 140 : 24),
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View ref={scrollContentRef} collapsable={false}>
                {children}
              </View>
            </ScrollView>
          </FormModalScrollContext.Provider>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  expandedScroll: {
    flex: 1,
  },
});
