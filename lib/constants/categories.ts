import { colors } from './colors';

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  color: string;
  sortOrder: number;
  isDefault: boolean;
}

export const defaultCategories: Category[] = [
  // 食費
  {
    id: 'cat_food',
    name: '食費',
    color: colors.catFood,
    sortOrder: 1,
    isDefault: true,
  },
  {
    id: 'cat_food_daily',
    name: '日常の食費',
    parentId: 'cat_food',
    color: colors.catFood,
    sortOrder: 1,
    isDefault: true,
  },
  {
    id: 'cat_food_eating_out',
    name: '外食',
    parentId: 'cat_food',
    color: colors.catFood,
    sortOrder: 2,
    isDefault: true,
  },

  // 交通費
  {
    id: 'cat_transport',
    name: '交通費',
    color: colors.catTransport,
    sortOrder: 2,
    isDefault: true,
  },
  {
    id: 'cat_transport_commuting',
    name: '通勤',
    parentId: 'cat_transport',
    color: colors.catTransport,
    sortOrder: 1,
    isDefault: true,
  },
  {
    id: 'cat_transport_private',
    name: '私用',
    parentId: 'cat_transport',
    color: colors.catTransport,
    sortOrder: 2,
    isDefault: true,
  },

  // 娯楽
  {
    id: 'cat_entertain',
    name: '娯楽',
    color: colors.catEntertain,
    sortOrder: 3,
    isDefault: true,
  },
  {
    id: 'cat_entertain_hobbies',
    name: '趣味',
    parentId: 'cat_entertain',
    color: colors.catEntertain,
    sortOrder: 1,
    isDefault: true,
  },
  {
    id: 'cat_entertain_media',
    name: 'メディア',
    parentId: 'cat_entertain',
    color: colors.catEntertain,
    sortOrder: 2,
    isDefault: true,
  },

  // 日用品
  {
    id: 'cat_daily',
    name: '日用品',
    color: colors.catDaily,
    sortOrder: 4,
    isDefault: true,
  },
  {
    id: 'cat_daily_care',
    name: '美容・健康',
    parentId: 'cat_daily',
    color: colors.catDaily,
    sortOrder: 1,
    isDefault: true,
  },
  {
    id: 'cat_daily_household',
    name: '家事',
    parentId: 'cat_daily',
    color: colors.catDaily,
    sortOrder: 2,
    isDefault: true,
  },

  // 被服費
  {
    id: 'cat_clothing',
    name: '被服費',
    color: colors.catClothing,
    sortOrder: 5,
    isDefault: true,
  },

  // 通信費
  {
    id: 'cat_comm',
    name: '通信費',
    color: colors.catComm,
    sortOrder: 6,
    isDefault: true,
  },
  {
    id: 'cat_comm_mobile',
    name: '携帯',
    parentId: 'cat_comm',
    color: colors.catComm,
    sortOrder: 1,
    isDefault: true,
  },
  {
    id: 'cat_comm_internet',
    name: 'インターネット',
    parentId: 'cat_comm',
    color: colors.catComm,
    sortOrder: 2,
    isDefault: true,
  },

  // 住居費
  {
    id: 'cat_housing',
    name: '住居費',
    color: colors.catHousing,
    sortOrder: 7,
    isDefault: true,
  },
  {
    id: 'cat_housing_rent',
    name: '家賃',
    parentId: 'cat_housing',
    color: colors.catHousing,
    sortOrder: 1,
    isDefault: true,
  },

  // 水道光熱
  {
    id: 'cat_utility',
    name: '水道光熱',
    color: colors.catUtility,
    sortOrder: 8,
    isDefault: true,
  },

  // その他
  {
    id: 'cat_other',
    name: 'その他',
    color: colors.slate,
    sortOrder: 9,
    isDefault: true,
  },
] as const;

// カテゴリIDからカテゴリを取得するヘルパー
export function getCategoryById(id: string): Category | undefined {
  return defaultCategories.find((c) => c.id === id);
}

// カテゴリ名からカテゴリを取得するヘルパー
export function getCategoryByName(name: string): Category | undefined {
  return defaultCategories.find((c) => c.name === name);
}

// 親カテゴリのみを取得
export function getParentCategories(): Category[] {
  return defaultCategories.filter((c) => !c.parentId);
}

// 子カテゴリを取得
export function getChildCategories(parentId: string): Category[] {
  return defaultCategories.filter((c) => c.parentId === parentId);
}
