import React from 'react';
import { TouchableOpacity, Text, TextStyle, ViewStyle, ActivityIndicator } from 'react-native';
import { colors } from '../../lib/constants/colors';
import { spacing } from '../../lib/constants/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const backgroundColor = {
    primary: disabled ? colors.inkLight : colors.accent,
    secondary: disabled ? colors.bgWarm : colors.sage,
    ghost: 'transparent',
  }[variant];

  const textColor = {
    primary: colors.card,
    secondary: colors.card,
    ghost: disabled ? colors.inkLight : colors.ink,
  }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        {
          backgroundColor: backgroundColor as any,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 48,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            {
              color: textColor,
              fontSize: 16,
              fontWeight: '600',
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
