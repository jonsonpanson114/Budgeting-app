import { View, Text, TouchableOpacity } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { colors } from '../../lib/constants/colors';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.bg }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.error, marginBottom: 10 }}>
        おっと、エラーが発生したようだ
      </Text>
      <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 }}>
        {error.message}
      </Text>
      <TouchableOpacity
        onPress={resetErrorBoundary}
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: colors.card, fontWeight: 'bold', fontSize: 16 }}>
          再読み込みする
        </Text>
      </TouchableOpacity>
    </View>
  );
}
