import { useState } from 'react';
import { Alert, Platform, View, Text, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors } from '../../lib/constants/colors';
import { readCSVFile, type CSVParseResult } from '../../features/csv/services/csvParser';

interface ClassifiedTransaction {
  date: string;
  content?: string;
  item?: string;
  amount: number;
  shop?: string;
  memo?: string;
  categoryId?: string;
  categoryName?: string;
  confidence: number;
  source: 'builtin' | 'user_dict' | 'ai' | 'manual';
}

export default function CSVImportScreen() {
  const [csvData, setCsvData] = useState<CSVParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [classifiedTransactions, setClassifiedTransactions] = useState<ClassifiedTransaction[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handlePickFile = async () => {
    try {
      setLoading(true);
      setCsvData(null);

      if (Platform.OS === 'web') {
        // Webの場合はFile APIを使用
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.CSV';
        input.onchange = async (e: any) => {
          const file = e.target.files[0];
          if (file) {
            const text = await file.text();
            const { parseCSV } = await import('../../features/csv/services/csvParser');
            const result = await parseCSV(text);
            setCsvData(result);
            setLoading(false);
          }
        };
        input.click();
      } else {
        // ネイティブの場合はexpo-document-pickerを使用
        const result = await DocumentPicker.getDocumentAsync({
          type: 'text/csv',
        });

        if (!result.canceled && result.assets[0]) {
          const file = result.assets[0];
          const text = await fetch(file.uri).then(r => r.text());
          const { parseCSV } = await import('../../features/csv/services/csvParser');
          const parsed = await parseCSV(text);
          setCsvData(parsed);
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Error picking CSV:', error);
      Alert.alert('エラー', 'CSVファイルの選択に失敗しました');
      setLoading(false);
    }
  };

  const handleImport = () => {
    Alert.alert(
      '確認',
      `${csvData?.transactions.length}件の取引をインポートします。よろしいですか？`,
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'インポート',
          onPress: () => {
            // TODO: Supabaseに保存
            Alert.alert('完了', 'インポートしました（暫定実装）');
          },
        },
      ]
    );
  };

  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 0.8) return '';
    if (confidence >= 0.5) return '⚠️';
    return '❓';
  };

  if (loading) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ marginTop: 16, color: colors.inkMuted }}>
            CSVファイルを読み込み中...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '600', color: colors.ink, marginBottom: 24 }}>
        CSV取込
      </Text>

      <Card style={{ marginBottom: 24 }}>
        <Button
          title="CSVファイルを選択"
          onPress={handlePickFile}
          disabled={loading}
        />
      </Card>

      {csvData && (
        <>
          <Card variant="alt" style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 4 }}>
                  検出されたフォーマット
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.ink }}>
                  {csvData.format === 'moneyforward' ? 'マネーフォワードME' : 'Zaim'}
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.inkMuted }}>
                {csvData.encoding === 'utf-8' ? 'UTF-8' : 'Shift_JIS'}
              </Text>
            </View>
            <Text style={{ fontSize: 15, color: colors.inkSoft, marginTop: 16 }}>
              {csvData.transactions.length}件の取引
            </Text>
          </Card>

          <Card style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, color: colors.inkMuted, marginBottom: 16 }}>
              カテゴリ分類状態
            </Text>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.sage }} />
                  <Text style={{ marginLeft: 8, fontSize: 14, color: colors.inkSoft }}>
                    自動分類済み
                  </Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: '300', color: colors.ink }}>
                  {classifiedTransactions.length}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.rose }} />
                  <Text style={{ marginLeft: 8, fontSize: 14, color: colors.inkSoft }}>
                    確認推奨
                  </Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: '300', color: colors.ink }}>
                  {/* TODO: カウントする */}
                </Text>
              </View>
            </View>
          </Card>

          <Button
            title="インポート"
            onPress={handleImport}
            style={{ marginBottom: 24 }}
          />
        </>
      )}

      <Text style={{ fontSize: 13, color: colors.inkMuted, textAlign: 'center', marginTop: 16 }}>
        ※ マネーフォワードME / ZaimのCSV形式に対応しています
      </Text>
    </Screen>
  );
}
