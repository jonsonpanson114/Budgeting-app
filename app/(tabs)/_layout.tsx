import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { colors } from '../../lib/constants/colors';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        paddingBottom: 8,
        paddingTop: 8,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title as string;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View key={route.key} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              onPress={onPress}
              style={{
                color: isFocused ? colors.accent : colors.inkMuted,
                fontSize: 12,
                fontWeight: isFocused ? '600' : '400',
              }}
            >
              {label}
            </Text>
            {isFocused && (
              <View
                style={{
                  width: 16,
                  height: 2,
                  backgroundColor: colors.accent,
                  borderRadius: 1,
                  marginTop: 4,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={CustomTabBar}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'ホーム' }}
      />
      <Tabs.Screen
        name="input"
        options={{ title: '入力' }}
      />
      <Tabs.Screen
        name="transactions"
        options={{ title: '明細' }}
      />
      <Tabs.Screen
        name="analysis"
        options={{ title: '分析' }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: '設定' }}
      />
    </Tabs>
  );
}
