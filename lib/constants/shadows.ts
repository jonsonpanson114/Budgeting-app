import { ViewStyle } from 'react-native';

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  } as ViewStyle,

  cardLift: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  } as ViewStyle,

  // 影は極めて控えめに。ボーダーはニュートラルトーンで薄く。
} as const;
