import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shared } from '../styles/shared';
import { GREEN } from '../theme';

export function ListCard({
  icon, title, meta, note, onPress, onDelete, lg,
}: {
  icon?: ReactNode;
  title: string;
  meta: string;
  note?: string;
  onPress?: () => void;
  onDelete?: () => void;
  lg?: boolean;
}) {
  const renderedIcon = icon ?? <MaterialCommunityIcons name="sprout-outline" size={20} color={GREEN} />;
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[shared.listCard, lg && shared.listCardLg]}
    >
      <View style={shared.listCardIcon}>
        {typeof renderedIcon === 'string' || typeof renderedIcon === 'number' ? <Text>{renderedIcon}</Text> : renderedIcon}
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
