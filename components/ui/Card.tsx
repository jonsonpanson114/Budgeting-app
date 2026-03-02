import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors, spacing } from '../../lib/constants/colors';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'alt' | 'cream' | 'accent';
  style?: ViewStyle;
  padding?: number;
}

export function Card({ children, variant = 'default', style, padding = spacing.cardPadding }: CardProps) {
  const backgroundColor = {
    default: colors.card,
    alt: colors.cardAlt,
    cream: colors.cream,
    accent: colors.accentBg,
  }[variant];

  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius: spacing.cardRadius,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
