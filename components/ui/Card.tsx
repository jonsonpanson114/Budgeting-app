import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors } from '../../lib/constants/colors';
import { spacing } from '../../lib/constants/spacing';
import { shadows } from '../../lib/constants/shadows';

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
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}
