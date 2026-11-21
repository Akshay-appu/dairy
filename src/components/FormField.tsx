import React, { useRef, useState } from 'react';
import { KeyboardTypeOptions, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { shared } from '../styles/shared';

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
  const baseValueRef = useRef('');
  const shouldMask = Boolean(secureTextEntry && !isRevealed);

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript !== undefined) {
      const base = baseValueRef.current;
      if (base) {
        const separator = base.endsWith(' ') ? '' : ' ';
        onChangeText(`${base}${separator}${transcript}`);
      } else {
        onChangeText(transcript);
      }
    }
  });

  useSpeechRecognitionEvent('end', () => setIsListening(false));
  useSpeechRecognitionEvent('error', () => setIsListening(false));

  const handleToggleVoice = async () => {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
    } else {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (granted) {
        baseValueRef.current = value;
        setIsListening(true);
        ExpoSpeechRecognitionModule.start({ lang: 'en-IN', interimResults: true });
      }
    }
  };

  const rightPadding = (secureTextEntry ? 46 : 0) + (enableVoice ? 46 : 0);

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
        {enableVoice && (
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
