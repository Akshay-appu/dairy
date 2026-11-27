import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shared } from '../styles/shared';
import { GREEN, LIGHT_GREEN } from '../theme';

export function EmptyState({ title, detail, lg }: { title: string; detail: string; lg?: boolean }) {
  return (
    <View style={shared.empty}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="sprout-outline" size={28} color={GREEN} />
      </View>
      <Text style={[shared.emptyTitle, lg && shared.emptyTitleLg]}>{title}</Text>
      <Text style={[shared.emptyText, lg && shared.emptyTextLg]}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
