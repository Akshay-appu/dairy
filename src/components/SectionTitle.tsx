import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { shared } from '../styles/shared';

export function SectionTitle({
  title, action, onPress, lg,
}: { title: string; action?: string; onPress?: () => void; lg?: boolean }) {
  return (
    <View style={[shared.sectionHeader, { flexWrap: 'wrap', gap: 8 }]}>
      <Text style={[shared.sectionTitle, lg && shared.sectionTitleLg, { flexShrink: 1, minWidth: 0 }]}>{title}</Text>
      {!!action && !!onPress && (
        <TouchableOpacity onPress={onPress} style={{ flexShrink: 0 }}>
          <Text style={[shared.link, lg && shared.linkLg]}>{action} →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
