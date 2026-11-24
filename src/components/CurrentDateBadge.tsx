import React from 'react';
import { Text, View } from 'react-native';
import { GREEN, INK } from '../theme';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const;

/**
 * Compact calendar-page icon displaying the current (or provided) month and day
 * inside a rounded green icon box so cards always reflect real dates.
 */
export function CurrentDateBadge({
  date,
  size = 40,
  headerColor = GREEN,
}: {
  date?: Date;
  size?: number;
  headerColor?: string;
}) {
  const activeDate = date ?? new Date();
  const monthLabel = MONTHS[activeDate.getMonth()];
  const dayNumber = String(activeDate.getDate());

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.325),
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      accessibilityRole="image"
      accessibilityLabel={`${monthLabel} ${dayNumber}`}
    >
      <View
        style={{
          width: Math.round(size * 0.72),
          height: Math.round(size * 0.75),
          borderRadius: 6,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#C8E6C9',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: '100%',
            height: Math.max(9, Math.round(size * 0.275)),
            backgroundColor: headerColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: Math.max(6, Math.round(size * 0.175)),
              lineHeight: Math.max(8, Math.round(size * 0.22)),
              fontWeight: '800',
              color: '#FFFFFF',
              letterSpacing: 0.4,
              includeFontPadding: false,
            }}
            numberOfLines={1}
          >
            {monthLabel}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Text
            style={{
              fontSize: Math.max(10, Math.round(size * 0.325)),
              lineHeight: Math.max(12, Math.round(size * 0.375)),
              fontWeight: '800',
              color: INK,
              includeFontPadding: false,
            }}
            numberOfLines={1}
          >
            {dayNumber}
          </Text>
        </View>
      </View>
    </View>
  );
}
