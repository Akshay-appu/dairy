import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { shared } from '../styles/shared';

export function ListCard({
  icon = '🌿', title, meta, note, onPress, onDelete, lg,
}: {
  icon?: ReactNode;
  title: string;
  meta: string;
  note?: string;
  onPress?: () => void;
  onDelete?: () => void;
  lg?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[shared.listCard, lg && shared.listCardLg]}
    >
      <View style={shared.listCardIcon}>
        {typeof icon === 'string' || typeof icon === 'number' ? <Text>{icon}</Text> : icon}
      </View>
      <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
        <Text style={[shared.listCardTitle, lg && shared.listCardTitleLg]}>{title}</Text>
        <Text style={[shared.listCardMeta, lg && shared.listCardMetaLg]}>{meta}</Text>
        {!!note && <Text style={[shared.listCardNote, lg && shared.listCardNoteLg]}>{note}</Text>}
      </View>
      {!!onDelete && (
        <TouchableOpacity onPress={onDelete} accessibilityLabel="Delete" hitSlop={8} style={{ flexShrink: 0, marginLeft: 4 }}>
          <Text style={shared.deleteIcon}>⋯</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
