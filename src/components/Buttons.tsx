import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { shared } from '../styles/shared';

export function PrimaryButton({
  label,
  onPress,
  lg,
  icon,
}: {
  label: string;
  onPress: () => void;
  lg?: boolean;
  icon?: ReactNode;
}) {
  return (
    <TouchableOpacity style={[shared.primaryButton, lg && shared.primaryButtonLg]} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        {icon}
        <Text style={[shared.primaryButtonText, lg && shared.primaryButtonTextLg]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function SecondaryButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
}) {
  return (
    <TouchableOpacity style={shared.secondaryButton} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        {icon}
        <Text style={shared.secondaryButtonText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function DangerButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={shared.dangerButton} onPress={onPress}>
      <Text style={shared.dangerButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}
