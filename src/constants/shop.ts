export interface IdleSystem {
  id: string;
  nameKey: string;
  descKey: string;
  emoji: string;
  xpPerSec: number;
  xpCost: number;
  color: string;
}

export const IDLE_SYSTEMS: IdleSystem[] = [
  {
    id: 'hamster',
    nameKey: 'shop_hamster',
    descKey: 'shop_hamster_desc',
    emoji: '🐹',
    xpPerSec: 1 / 20,
    xpCost: 1000,
    color: '#FDCB6E',
  },
  {
    id: 'developer',
    nameKey: 'shop_developer',
    descKey: 'shop_developer_desc',
    emoji: '👨‍💻',
    xpPerSec: 2 / 10,
    xpCost: 2000,
    color: '#A29BFE',
  },
  {
    id: 'ai',
    nameKey: 'shop_ai',
    descKey: 'shop_ai_desc',
    emoji: '🤖',
    xpPerSec: 3 / 5,
    xpCost: 4000,
    color: '#00D2FF',
  },
];

export const CLICK_POWER_DAMAGE = [1, 5, 10, 20, 40, 80, 100, 200, 350, 500];

export const getClickPowerCost = (currentLevel: number): number =>
  500 * Math.pow(2, currentLevel - 1);

export const MULTI_TOUCH_MULTIPLIERS = [1, 2, 3, 4, 5, 10];

export const getMultiTouchCost = (currentLevel: number): number => {
  const costs: Record<number, number> = {
    1: 2000,
    2: 10000,
    3: 50000,
    4: 200000,
    5: 1000000,
  };
  return costs[currentLevel] ?? Infinity;
};

export const MAX_CLICK_POWER = 10;
export const MAX_MULTI_TOUCH = 6;

export const OFFLINE_CAP_SECONDS = 28800; // 8 hours

export interface XpStorageUpgrade {
  level: number;
  capacity: number;
  xpCost: number;
}

export const XP_STORAGE_UPGRADES: XpStorageUpgrade[] = [
  { level: 1, capacity: 1000, xpCost: 500 },
  { level: 2, capacity: 2000, xpCost: 1000 },
  { level: 3, capacity: 3000, xpCost: 1500 },
  { level: 4, capacity: 5000, xpCost: 2500 },
];

export const getXpStorageCapacity = (level: number): number => {
  const capacities = [500, 1000, 2000, 3000, 5000];
  return capacities[level] ?? 500;
};
