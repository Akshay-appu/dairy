import React, { useEffect, useRef, useState } from 'react';
import { KeyboardTypeOptions, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { shared } from '../styles/shared';

function useSafeSpeechRecognitionEvent(
  eventName: string,
  listener: (event: any) => void
) {
  useEffect(() => {
    try {
      if (
        !ExpoSpeechRecognitionModule ||
        typeof (ExpoSpeechRecognitionModule as any).addListener !== 'function'
      ) {
        return;
      }
      const subscription = (ExpoSpeechRecognitionModule as any).addListener(
        eventName,
        (event: any) => {
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
}) {
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
  const shouldMask = Boolean(secureTextEntry && !isRevealed);

  // Safe cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (ExpoSpeechRecognitionModule?.abort) {
          ExpoSpeechRecognitionModule.abort();
        }
      } catch (err) {
        console.warn('Failed to abort speech recognition on unmount:', err);
      }
    };
  }, []);

  useSafeSpeechRecognitionEvent('result', (event) => {
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
    try {
      setIsListening(false);
    } catch (err) {
      console.warn('Error handling speech recognition end:', err);
    }
  });

  useSafeSpeechRecognitionEvent('error', (event) => {
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
        setIsListening(false);
        return;
      }

      if (isListening) {
        try {
          await ExpoSpeechRecognitionModule.stop?.();
        } catch (stopErr) {
          console.warn('ExpoSpeechRecognitionModule.stop error:', stopErr);
        } finally {
          setIsListening(false);
        }
      } else {
        try {
          const isAvail = typeof ExpoSpeechRecognitionModule.isRecognitionAvailable === 'function'
            ? ExpoSpeechRecognitionModule.isRecognitionAvailable()
            : true;
          if (!isAvail) {
            console.warn('Speech recognition is not available on this device');
            setIsListening(false);
            return;
          }
        } catch (checkErr) {
          console.warn('Speech recognition availability check threw error:', checkErr);
          setIsListening(false);
          return;
        }

        const permResponse = await ExpoSpeechRecognitionModule.requestPermissionsAsync?.();
        if (permResponse?.granted) {
          baseValueRef.current = value;
          setIsListening(true);
          try {
            await ExpoSpeechRecognitionModule.start?.({ lang: 'en-IN', interimResults: true });
          } catch (startErr) {
            console.warn('ExpoSpeechRecognitionModule.start error:', startErr);
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      }
    } catch (err) {
      console.warn('Speech recognition toggle error:', err);
      setIsListening(false);
    }
  };

  const showVoice = Boolean(enableVoice && isSpeechAvailable);
  const rightPadding = (secureTextEntry ? 46 : 0) + (showVoice ? 46 : 0);

  return (
    <View>
      <Text style={shared.fieldLabel}>{label}{required ? ' *' : ''}</Text>
      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          style={[
            shared.input,
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
              backgroundColor: isListening ? '#E6F4FE' : 'transparent',
              borderRadius: 8,
            }}
            accessibilityRole="button"
            accessibilityLabel={isListening ? 'Stop voice input' : 'Start voice input'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, lineHeight: 20, color: isListening ? '#B3261E' : '#2E7D32' }}>
                {isListening ? '⏹' : '🎤'}
              </Text>
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
            <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, lineHeight: 20 }}>👁</Text>
              {!isRevealed && (
                <View
                  style={{
                    position: 'absolute',
                    width: 20,
                    height: 2,
                    backgroundColor: '#66756B',
                    transform: [{ rotate: '-45deg' }],
                    borderRadius: 1,
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={shared.fieldError}>{error}</Text>}
    </View>
  );
}
