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
  {
    id: 'electrician',
    nameKey: 'shop_electrician',
    descKey: 'shop_electrician_desc',
    emoji: '⚡',
    xpPerSec: 5,
    xpCost: 8000,
    color: '#FFC312',
  },
  {
    id: 'worm',
    nameKey: 'shop_worm',
    descKey: 'shop_worm_desc',
    emoji: '🪱',
    xpPerSec: 10,
    xpCost: 20000,
    color: '#A29BFE',
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
  requiresLevel?: number;
  requiresOgreDefeats?: number;
}

export const XP_STORAGE_UPGRADES: XpStorageUpgrade[] = [
  { level: 1,  capacity: 1000,   xpCost: 500 },
  { level: 2,  capacity: 2000,   xpCost: 1000 },
  { level: 3,  capacity: 3000,   xpCost: 1500 },
  { level: 4,  capacity: 5000,   xpCost: 2500 },
  { level: 5,  capacity: 10000,  xpCost: 5000 },
  { level: 6,  capacity: 20000,  xpCost: 10000 },
  { level: 7,  capacity: 40000,  xpCost: 20000 },
  { level: 8,  capacity: 80000,  xpCost: 40000 },
  { level: 9,  capacity: 120000, xpCost: 60000 },
  { level: 10, capacity: 250000, xpCost: 125000, requiresLevel: 100, requiresOgreDefeats: 5 },
];

export const getXpStorageCapacity = (level: number): number => {
  const capacities = [500, 1000, 2000, 3000, 5000, 10000, 20000, 40000, 80000, 120000, 250000];
  return capacities[level] ?? 500;
};

export interface TikGunUpgrade {
  level: number;
  tikTikPerHit: number;
  cost: number;
  requiresGoblinKral: boolean;
}

export const TIKGUN_LEVELS: TikGunUpgrade[] = [
  { level: 1, tikTikPerHit: 1,  cost: 1000,  requiresGoblinKral: false },
  { level: 2, tikTikPerHit: 3,  cost: 2000,  requiresGoblinKral: false },
  { level: 3, tikTikPerHit: 5,  cost: 4000,  requiresGoblinKral: false },
  { level: 4, tikTikPerHit: 7,  cost: 6000,  requiresGoblinKral: false },
  { level: 5, tikTikPerHit: 10, cost: 8000,  requiresGoblinKral: false },
  { level: 6, tikTikPerHit: 20, cost: 12000, requiresGoblinKral: false },
  { level: 7, tikTikPerHit: 50, cost: 30000, requiresGoblinKral: true  },
];

export const getTikGunPerHit = (level: number): number =>
  level > 0 ? (TIKGUN_LEVELS[level - 1]?.tikTikPerHit ?? 0) : 0;

export interface DovizciRates {
  xpToTikTik: number;
  tikTikToXp: number | null;
}

export function getDovizciRates(level: number): DovizciRates {
  if (level >= 21) return { xpToTikTik: 200, tikTikToXp: 10 };
  if (level >= 15) return { xpToTikTik: 100, tikTikToXp: 50 };
  if (level >= 11) return { xpToTikTik: 60,  tikTikToXp: null };
  if (level >= 6)  return { xpToTikTik: 30,  tikTikToXp: null };
  return                  { xpToTikTik: 10,  tikTikToXp: null };
}

export const SLIME_SWORD_EVOLUTION_COUNT = 100;
export const SLIME_SWORD_FINAL_COUNT = 200;
export const SLIME_SWORD_FUSION_COUNT = 1000;

export const SIFIA_ISLEYEN_UNLOCK_LEVEL = 50;
export const SIFIA_ISLEYEN_TT_PER_HP = 100;
export const SIFIA_ISLEYEN_XP_PER_HP = 10;

export const DOVIZCI_COST_TIKTIK = 5000;
export const DOVIZCI_COST_XP     = 500;

export const SILAH_TUCCARI_COST_TIKTIK = 10000;
export const SILAH_TUCCARI_COST_XP     = 1000;

export const ISLEYICI_COST_TIKTIK = 1_000_000;
export const ISLEYICI_TT_PER_POWER = 1_000;   // 1 güç = 1000 TıkTık
export const ISLEYICI_XP_PER_POWER = 10;       // 1 güç = 10 XP
export const ISLEYICI_MAX_ENHANCEMENT = 15_000; // slime_sword hariç tüm silahlar için üst sınır

export interface EnhancedWeapon {
  instanceId: string;    // e.g. "golem_gloves_enhanced"
  baseWeaponId: string;  // e.g. "golem_gloves"
  enhancement: number;   // toplam eklenen güç
}

export const EQUIPMENT_SLOT_UNLOCK_LEVELS = [5, 26, 75];

export function getEquipmentSlots(level: number): number {
  return EQUIPMENT_SLOT_UNLOCK_LEVELS.filter((req) => level >= req).length;
}

export interface Weapon {
  id: string;
  nameKey: string;
  descKey: string;
  emoji: string;
  cost: number;
  xpCost?: number;
  bonusType: 'damage_percent' | 'bubble_suppress' | 'kutsal_kilic';
  bonusValue: number;
  requiresLevel?: number;
  requiresMonsterDefeats?: { monsterId: number; count: number };
}

export const WEAPONS: Weapon[] = [
  {
    id: 'golem_gloves',
    nameKey: 'weapon_golem_gloves',
    descKey: 'weapon_golem_gloves_desc',
    emoji: '🥊',
    cost: 5000,
    bonusType: 'damage_percent',
    bonusValue: 0.05,
  },
  {
    id: 'kutsal_kilic',
    nameKey: 'weapon_kutsal_kilic',
    descKey: 'weapon_kutsal_kilic_desc',
    emoji: '⚔️',
    cost: 1000000,
    xpCost: 100000,
    bonusType: 'kutsal_kilic',
    bonusValue: 0,
    requiresLevel: 100,
    requiresMonsterDefeats: { monsterId: 10, count: 20 },
  },
  {
    id: 'slime_sword',
    nameKey: 'weapon_slime_sword',
    descKey: 'weapon_slime_sword_desc',
    emoji: '🫧',
    cost: 0,
    bonusType: 'bubble_suppress',
    bonusValue: 10,
    requiresMonsterDefeats: { monsterId: 1, count: 100 },
  },
  {
    id: 'dragon_sword',
    nameKey: 'weapon_dragon_sword',
    descKey: 'weapon_dragon_sword_desc',
    emoji: '🗡️',
    cost: 1000000,
    bonusType: 'damage_percent',
    bonusValue: 0.25,
    requiresLevel: 50,
    requiresMonsterDefeats: { monsterId: 14, count: 2 },
  },
  {
    id: 'gumus_kilic',
    nameKey: 'weapon_gumus_kilic',
    descKey: 'weapon_gumus_kilic_desc',
    emoji: '🥈',
    cost: 100000,
    bonusType: 'damage_percent',
    bonusValue: 0.10,
    requiresMonsterDefeats: { monsterId: 2, count: 50 },
  },
];
