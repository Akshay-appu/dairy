import React, { useState } from 'react';
import { KeyboardTypeOptions, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { shared } from '../styles/shared';

export function FormField({
  label, value, onChangeText, placeholder, multiline, keyboardType, maxLength, error, required,
  secureTextEntry,
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
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const shouldMask = Boolean(secureTextEntry && !isRevealed);

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
            secureTextEntry && { paddingRight: 46 },
          ]}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          keyboardType={keyboardType}
          maxLength={maxLength}
          secureTextEntry={shouldMask}
          autoCapitalize={secureTextEntry ? 'none' : undefined}
          autoCorrect={secureTextEntry ? false : undefined}
        />
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
