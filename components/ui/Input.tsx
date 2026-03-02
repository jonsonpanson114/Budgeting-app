import React from 'react';
import {
  TextInput,
  Text,
  View,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { colors, spacing } from '../../lib/constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  ...props
}: InputProps) {
  return (
    <View style={containerStyle}>
      {label && (
        <Text style={{ color: colors.inkSoft, fontSize: 14, marginBottom: 6 }}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: error ? colors.rose : colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.ink,
          },
          inputStyle,
        ]}
        placeholderTextColor={colors.inkLight}
        {...props}
      />
      {error && (
        <Text style={{ color: colors.rose, fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
