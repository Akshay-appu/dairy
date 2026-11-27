import React, { useEffect, useRef, useState } from 'react';
import { KeyboardTypeOptions, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { useActiveLanguage } from '../i18n/LanguageContext';
import { getSpeechLocale } from '../i18n/languageUtils';
import { shared } from '../styles/shared';
import { useFormModalScroll } from './FormModal';

interface SpeechRecognitionEvent {
  results?: { transcript?: string }[];
  [key: string]: unknown;
}

function useSafeSpeechRecognitionEvent(
  eventName: string,
  listener: (event: SpeechRecognitionEvent) => void
) {
  useEffect(() => {
    try {
      const moduleWithEvents = ExpoSpeechRecognitionModule as unknown as {
        addListener?: (event: string, callback: (event: SpeechRecognitionEvent) => void) => { remove?: () => void };
      };
      if (
        !ExpoSpeechRecognitionModule ||
        typeof moduleWithEvents.addListener !== 'function'
      ) {
        return;
      }
      const subscription = moduleWithEvents.addListener(
        eventName,
        (event: SpeechRecognitionEvent) => {
          try {
            listener(event);
          } catch (err) {
            console.warn(`[SpeechRecognition] Error in "${eventName}" listener:`, err);
          }
        }
      );
      return () => {
        try {
          subscription?.remove?.();
        } catch (err) {
          console.warn(`[SpeechRecognition] Error removing "${eventName}" listener:`, err);
        }
      };
    } catch (err) {
      console.warn(`[SpeechRecognition] Failed to attach listener for "${eventName}":`, err);
    }
  }, [eventName, listener]);
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  maxLength,
  error,
  required,
  secureTextEntry,
  enableVoice = keyboardType !== 'numeric' && keyboardType !== 'decimal-pad',
  language: propLanguage,
  locale: propLocale,
  onFocus,
  dark = false,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  error?: string;
  required?: boolean;
  secureTextEntry?: boolean;
  enableVoice?: boolean;
  language?: string;
  locale?: string;
  onFocus?: () => void;
  dark?: boolean;
}) {
  const containerRef = useRef<View>(null);
  const modalScroll = useFormModalScroll();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechAvailable] = useState(() => {
    try {
      if (ExpoSpeechRecognitionModule && typeof ExpoSpeechRecognitionModule.isRecognitionAvailable === 'function') {
        return Boolean(ExpoSpeechRecognitionModule.isRecognitionAvailable());
      }
    } catch (err) {
      console.warn('Speech recognition availability check failed:', err);
    }
    return false;
  });
  const baseValueRef = useRef('');
  const isActiveListenerRef = useRef(false);
  const shouldMask = Boolean(secureTextEntry && !isRevealed);

  const { language: activeLanguage, locale: activeContextLocale, t } = useActiveLanguage();
  const effectiveLanguage = propLanguage || activeLanguage || 'en';
  const effectiveLocale = propLocale || activeContextLocale || getSpeechLocale(effectiveLanguage);

  // Safe cleanup on unmount
  useEffect(() => {
    return () => {
      const wasActive = isActiveListenerRef.current;
      isActiveListenerRef.current = false;
      if (wasActive) {
        try {
          if (ExpoSpeechRecognitionModule?.abort) {
            ExpoSpeechRecognitionModule.abort();
          }
        } catch (err) {
          console.warn('Failed to abort speech recognition on unmount:', err);
        }
      }
    };
  }, []);

  useSafeSpeechRecognitionEvent('result', (event) => {
    if (!isActiveListenerRef.current) return;
    try {
      const transcript = event?.results?.[0]?.transcript;
      if (transcript !== undefined) {
        const base = baseValueRef.current;
        if (base) {
          const separator = base.endsWith(' ') ? '' : ' ';
          onChangeText(`${base}${separator}${transcript}`);
        } else {
          onChangeText(transcript);
        }
      }
    } catch (err) {
      console.warn('Error processing speech recognition result:', err);
    }
  });

  useSafeSpeechRecognitionEvent('end', () => {
    if (!isActiveListenerRef.current) return;
    isActiveListenerRef.current = false;
    try {
      setIsListening(false);
    } catch (err) {
      console.warn('Error handling speech recognition end:', err);
    }
  });

  useSafeSpeechRecognitionEvent('error', (event) => {
    if (!isActiveListenerRef.current) return;
    isActiveListenerRef.current = false;
    try {
      console.warn('Speech recognition error event:', event);
      setIsListening(false);
    } catch (err) {
      console.warn('Error handling speech recognition error event:', err);
      setIsListening(false);
    }
  });

  const handleToggleVoice = async () => {
    try {
      if (!ExpoSpeechRecognitionModule) {
        isActiveListenerRef.current = false;
        setIsListening(false);
        return;
      }

      if (isListening) {
        isActiveListenerRef.current = false;
        try {
          await ExpoSpeechRecognitionModule.stop?.();
        } catch (stopErr) {
          console.warn('ExpoSpeechRecognitionModule.stop error:', stopErr);
        } finally {
          isActiveListenerRef.current = false;
          setIsListening(false);
        }
      } else {
        try {
          const isAvail = typeof ExpoSpeechRecognitionModule.isRecognitionAvailable === 'function'
            ? ExpoSpeechRecognitionModule.isRecognitionAvailable()
            : true;
          if (!isAvail) {
            console.warn('Speech recognition is not available on this device');
            isActiveListenerRef.current = false;
            setIsListening(false);
            return;
          }
        } catch (checkErr) {
          console.warn('Speech recognition availability check threw error:', checkErr);
          isActiveListenerRef.current = false;
          setIsListening(false);
          return;
        }

        const permResponse = await ExpoSpeechRecognitionModule.requestPermissionsAsync?.();
        if (permResponse?.granted) {
          baseValueRef.current = value;
          isActiveListenerRef.current = true;
          setIsListening(true);
          try {
            await ExpoSpeechRecognitionModule.start?.({ lang: effectiveLocale, interimResults: true });
          } catch (startErr) {
            console.warn('ExpoSpeechRecognitionModule.start error:', startErr);
            isActiveListenerRef.current = false;
            setIsListening(false);
          }
        } else {
          isActiveListenerRef.current = false;
          setIsListening(false);
        }
      }
    } catch (err) {
      console.warn('Speech recognition toggle error:', err);
      isActiveListenerRef.current = false;
      setIsListening(false);
    }
  };

  const showVoice = Boolean(enableVoice && isSpeechAvailable);
  const rightPadding = (secureTextEntry ? 46 : 0) + (showVoice ? 46 : 0);

  return (
    <View ref={containerRef} collapsable={false}>
      <Text style={[shared.fieldLabel, dark && { color: '#C8E6C9' }]}>{label}{required ? ' *' : ''}</Text>
      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={dark ? '#7E9C87' : undefined}
          style={[
            shared.input,
            dark && { backgroundColor: '#16281E', borderColor: '#2E4C3A', color: '#EEF7F0' },
            multiline && shared.notesInput,
            !!error && shared.inputError,
            rightPadding > 0 && { paddingRight: rightPadding },
          ]}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          keyboardType={keyboardType}
          maxLength={maxLength}
          secureTextEntry={shouldMask}
          autoCapitalize={secureTextEntry ? 'none' : undefined}
          autoCorrect={secureTextEntry ? false : undefined}
          onFocus={() => {
            onFocus?.();
            modalScroll?.scrollToNode(containerRef);
          }}
        />
        {showVoice && (
          <TouchableOpacity
            onPress={handleToggleVoice}
            style={{
              position: 'absolute',
              right: secureTextEntry ? 46 : 12,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              width: 32,
              backgroundColor: isListening ? (dark ? '#4A1D1D' : '#FDE8E8') : 'transparent',
              borderRadius: 8,
            }}
            accessibilityRole="button"
            accessibilityLabel={isListening ? (t?.voiceInputStop || 'Stop voice input') : (t?.voiceInputStart || 'Start voice input')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
              {isListening ? (
                <Ionicons name="stop-circle" size={22} color={dark ? '#F87171' : '#B3261E'} />
              ) : (
                <Ionicons name="mic-outline" size={20} color={dark ? '#86EFAC' : '#2E7D32'} />
              )}
            </View>
          </TouchableOpacity>
        )}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsRevealed(v => !v)}
            style={{
              position: 'absolute',
              right: 12,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              width: 32,
            }}
            accessibilityRole="button"
            accessibilityLabel={isRevealed ? 'Hide password' : 'Show password'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons
                name={isRevealed ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#66756B"
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={shared.fieldError}>{error}</Text>}
    </View>
  );
}
