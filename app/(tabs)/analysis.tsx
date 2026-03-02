import { Screen } from '../../components/layout/Screen';
import { colors } from '../../lib/constants/colors';
import { Text } from 'react-native';

export default function AnalysisScreen() {
  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 20 }}>
        分析
      </Text>
      <Text style={{ fontSize: 14, color: colors.inkMuted, textAlign: 'center', marginTop: 40 }}>
        分析はまだありません
      </Text>
    </Screen>
  );
}
