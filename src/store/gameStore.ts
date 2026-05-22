import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLevelFromXp, MONSTERS } from '../constants/monsters';
import { ACHIEVEMENTS } from '../constants/achievements';
import { IDLE_SYSTEMS, getClickPowerCost, getMultiTouchCost, MAX_CLICK_POWER, MAX_MULTI_TOUCH, OFFLINE_CAP_SECONDS, XP_STORAGE_UPGRADES, getXpStorageCapacity, TIKGUN_LEVELS, getDovizciRates, DOVIZCI_COST_TIKTIK, DOVIZCI_COST_XP, SILAH_TUCCARI_COST_TIKTIK, SILAH_TUCCARI_COST_XP, WEAPONS, getEquipmentSlots } from '../constants/shop';

export interface AchievementState {
  id: number;
  claimed: boolean;
}

export interface OfflineProgression {
  lastSavedTimestamp: number;
}

export interface GameState {
  nickname: string;
  level: number;
  xp: number;
  tikTik: number;
  clickPower: number;
  maxMultiTouch: number;
  totalClicks: number;
  totalMonstersDefeated: number;
  totalTikTikEarned: number;
  activeMonsterId: number;
  unlockedMonsters: number[];
  purchasedIdleSystems: string[];
  unlockedAchievements: AchievementState[];
  offlineProgression: OfflineProgression;
  language: 'tr' | 'en';
  idleXpBuffer: number;
  kutsalKilicUnlocked: boolean;
  kutsalKilicPurchased: boolean;
  xpStorageLevel: number;
  dailyStreak: number;
  lastLoginDate: string;
  melekDefeatedCount: number;
  tikGunLevel: number;
  goblinKralDefeatedCount: number;
  miniEjderhaDefeatedCount: number;
  slimeDefeatedCount: number;
  dovizciPurchased: boolean;
  silahTuccariPurchased: boolean;
  purchasedWeapons: string[];
  equippedWeapons: string[];

  setNickname: (nickname: string) => void;
  checkDailyStreak: () => void;
  addXp: (amount: number) => void;
  addTikTik: (amount: number) => void;
  spendTikTik: (amount: number) => boolean;
  spendXp: (amount: number) => boolean;
  upgradeClickPower: () => boolean;
  upgradeMultiTouch: () => boolean;
  purchaseIdleSystem: (systemId: string) => boolean;
  setActiveMonster: (monsterId: number) => void;
  recordMonsterDefeated: (tikTikReward: number, xpReward: number, monsterId?: number) => void;
  recordClicks: (count: number) => void;
  claimAchievement: (achievementId: number) => void;
  checkAchievements: () => void;
  saveTimestamp: () => void;
  calculateOfflineProgress: () => void;
  setLanguage: (lang: 'tr' | 'en') => void;
  resetGame: () => void;
  addIdleXpBuffer: (amount: number) => void;
  collectIdleXpBuffer: () => void;
  purchaseKutsalKilic: () => boolean;
  purchaseXpStorage: (level: number) => boolean;
  upgradeTikGun: () => boolean;
  purchaseDovizci: () => boolean;
  convertXpToTikTik: (amount: number) => boolean;
  convertTikTikToXp: (amount: number) => boolean;
  purchaseSilahTuccari: () => boolean;
  purchaseWeapon: (weaponId: string) => boolean;
  equipWeapon: (weaponId: string) => boolean;
  unequipWeapon: (weaponId: string) => void;
}

export const DEFAULT_STATE = {
  nickname: '',
  level: 1,
  xp: 0,
  tikTik: 0,
  clickPower: 1,
  maxMultiTouch: 1,
  totalClicks: 0,
  totalMonstersDefeated: 0,
  totalTikTikEarned: 0,
  activeMonsterId: 1,
  unlockedMonsters: [1] as number[],
  purchasedIdleSystems: [] as string[],
  unlockedAchievements: [] as AchievementState[],
  offlineProgression: {
    lastSavedTimestamp: 0,
  } as OfflineProgression,
  language: 'tr' as 'tr' | 'en',
  idleXpBuffer: 0,
  kutsalKilicUnlocked: false,
  kutsalKilicPurchased: false,
  xpStorageLevel: 0,
  dailyStreak: 1,
  lastLoginDate: '',
  melekDefeatedCount: 0,
  tikGunLevel: 0,
  goblinKralDefeatedCount: 0,
  miniEjderhaDefeatedCount: 0,
  slimeDefeatedCount: 0,
  dovizciPurchased: false,
  silahTuccariPurchased: false,
  purchasedWeapons: [] as string[],
  equippedWeapons: [] as string[],
};

function checkAchievements(state: Partial<GameState>): AchievementState[] {
  const current = state.unlockedAchievements ?? [];
  const fieldMap: Record<string, number> = {
    totalClicks: state.totalClicks ?? 0,
    totalMonstersDefeated: state.totalMonstersDefeated ?? 0,
    level: state.level ?? 1,
    totalTikTikEarned: state.totalTikTikEarned ?? 0,
    unlockedMonstersCount: (state.unlockedMonsters ?? []).length,
    clickPower: state.clickPower ?? 1,
    maxMultiTouch: state.maxMultiTouch ?? 2,
  };

  const updated = [...current];
  for (const ach of ACHIEVEMENTS) {
    if (!updated.find((u) => u.id === ach.id) && fieldMap[ach.conditionField] >= ach.conditionValue) {
      updated.push({ id: ach.id, claimed: false });
    }
  }
  return updated;
}

function unlockMonsters(xp: number, current: number[]): number[] {
  const updated = [...current];
  for (const m of MONSTERS) {
    if (m.id === 20) continue; // sadece Melek yenilince açılır
    if (xp >= m.requiredXp && !updated.includes(m.id)) {
      updated.push(m.id);
    }
  }
  return updated;
}

export const useGameStore = create<GameState>()((set, get) => ({
  ...DEFAULT_STATE,

  setNickname: (nickname) => set({ nickname: nickname.trim() }),

  addXp: (amount) => {
    const s = get();
    const xp = s.xp + amount;
    const level = getLevelFromXp(xp);
    const unlockedMonsters = unlockMonsters(xp, s.unlockedMonsters);
    const next = { ...s, xp, level, unlockedMonsters };
    set({ xp, level, unlockedMonsters, unlockedAchievements: checkAchievements(next) });
  },

  addTikTik: (amount) => {
    const s = get();
    const streakBonus = 1 + Math.min(s.dailyStreak - 1, 10) * 0.1;
    const earned = Math.floor(amount * streakBonus);
    const tikTik = s.tikTik + earned;
    const totalTikTikEarned = s.totalTikTikEarned + earned;
    const next = { ...s, tikTik, totalTikTikEarned };
    set({ tikTik, totalTikTikEarned, unlockedAchievements: checkAchievements(next) });
  },

  spendTikTik: (amount) => {
    const { tikTik } = get();
    if (tikTik < amount) return false;
    set({ tikTik: tikTik - amount });
    return true;
  },

  spendXp: (amount) => {
    const { xp } = get();
    if (xp < amount) return false;
    set({ xp: xp - amount });
    return true;
  },

  upgradeClickPower: () => {
    const s = get();
    if (s.clickPower >= MAX_CLICK_POWER) return false;
    const cost = getClickPowerCost(s.clickPower);
    if (s.tikTik < cost) return false;
    const clickPower = s.clickPower + 1;
    const tikTik = s.tikTik - cost;
    const next = { ...s, clickPower, tikTik };
    set({ clickPower, tikTik, unlockedAchievements: checkAchievements(next) });
    return true;
  },

  upgradeMultiTouch: () => {
    const s = get();
    if (s.maxMultiTouch >= MAX_MULTI_TOUCH) return false;
    const cost = getMultiTouchCost(s.maxMultiTouch);
    if (s.tikTik < cost) return false;
    const maxMultiTouch = s.maxMultiTouch + 1;
    const tikTik = s.tikTik - cost;
    const next = { ...s, maxMultiTouch, tikTik };
    set({ maxMultiTouch, tikTik, unlockedAchievements: checkAchievements(next) });
    return true;
  },

  purchaseIdleSystem: (systemId) => {
    const s = get();
    if (s.purchasedIdleSystems.includes(systemId)) return false;
    const sysIndex = IDLE_SYSTEMS.findIndex((x) => x.id === systemId);
    if (sysIndex === -1) return false;
    const sys = IDLE_SYSTEMS[sysIndex];
    if (sysIndex > 0 && !s.purchasedIdleSystems.includes(IDLE_SYSTEMS[sysIndex - 1].id)) return false;
    if (s.xp < sys.xpCost) return false;
    set({ purchasedIdleSystems: [...s.purchasedIdleSystems, systemId], xp: s.xp - sys.xpCost });
    return true;
  },

  setActiveMonster: (monsterId) => {
    if (get().unlockedMonsters.includes(monsterId)) set({ activeMonsterId: monsterId });
  },

  recordMonsterDefeated: (tikTikReward, xpReward, monsterId) => {
    const s = get();
    const totalMonstersDefeated = s.totalMonstersDefeated + 1;
    const tikTik = s.tikTik + tikTikReward;
    const totalTikTikEarned = s.totalTikTikEarned + tikTikReward;
    const xp = s.xp + xpReward;
    const level = getLevelFromXp(xp);
    let unlockedMonsters = unlockMonsters(xp, s.unlockedMonsters);
    const melekDefeatedCount = monsterId === 10 ? s.melekDefeatedCount + 1 : s.melekDefeatedCount;
    const goblinKralDefeatedCount = monsterId === 11 ? s.goblinKralDefeatedCount + 1 : s.goblinKralDefeatedCount;
    const miniEjderhaDefeatedCount = monsterId === 14 ? s.miniEjderhaDefeatedCount + 1 : s.miniEjderhaDefeatedCount;
    const slimeDefeatedCount = monsterId === 1 ? s.slimeDefeatedCount + 1 : s.slimeDefeatedCount;
    // Melek 20 kez yenilince VE seviye 20'de Baş Melek (20) açılır + Kutsal Kılıç mağazada görünür
    const basMelekUnlocks = monsterId === 10 && melekDefeatedCount >= 20 && level >= 20 && !unlockedMonsters.includes(20);
    if (basMelekUnlocks) {
      unlockedMonsters = [...unlockedMonsters, 20];
    }
    const kutsalKilicUnlocked = basMelekUnlocks ? true : s.kutsalKilicUnlocked;
    const next = { ...s, totalMonstersDefeated, tikTik, totalTikTikEarned, xp, level, unlockedMonsters, kutsalKilicUnlocked, melekDefeatedCount, goblinKralDefeatedCount, miniEjderhaDefeatedCount, slimeDefeatedCount };
    set({ ...next, unlockedAchievements: checkAchievements(next) });
  },

  recordClicks: (count) => {
    const s = get();
    const totalClicks = s.totalClicks + count;
    const next = { ...s, totalClicks };
    set({ totalClicks, unlockedAchievements: checkAchievements(next) });
  },

  claimAchievement: (achievementId) => {
    const s = get();
    const achDef = ACHIEVEMENTS.find((a) => a.id === achievementId);
    const achState = s.unlockedAchievements.find((a) => a.id === achievementId);
    if (!achDef || !achState || achState.claimed) return;

    const unlockedAchievements = s.unlockedAchievements.map((a) =>
      a.id === achievementId ? { ...a, claimed: true } : a
    );
    const tikTik = s.tikTik + achDef.rewardTikTik;
    const totalTikTikEarned = s.totalTikTikEarned + achDef.rewardTikTik;
    const xp = s.xp + achDef.rewardXp;
    const level = getLevelFromXp(xp);
    const unlockedMonsters = unlockMonsters(xp, s.unlockedMonsters);
    set({ unlockedAchievements, tikTik, totalTikTikEarned, xp, level, unlockedMonsters });
  },

  checkAchievements: () => {
    const s = get();
    set({ unlockedAchievements: checkAchievements(s) });
  },

  saveTimestamp: () => {
    const s = get();
    set({ offlineProgression: { ...s.offlineProgression, lastSavedTimestamp: Date.now() } });
  },

  calculateOfflineProgress: () => {
    const s = get();
    const { lastSavedTimestamp } = s.offlineProgression;
    set({ offlineProgression: { lastSavedTimestamp: Date.now() } });
    if (!lastSavedTimestamp || s.purchasedIdleSystems.length === 0) return;
    const elapsed = Math.min((Date.now() - lastSavedTimestamp) / 1000, OFFLINE_CAP_SECONDS);
    if (elapsed < 10) return;
    const activeSys = [...IDLE_SYSTEMS].reverse().find((x) => s.purchasedIdleSystems.includes(x.id));
    if (!activeSys) return;
    const earnedXp = Math.floor(elapsed * activeSys.xpPerSec);
    if (earnedXp > 0) get().addIdleXpBuffer(earnedXp);
  },

  checkDailyStreak: () => {
    const s = get();
    const today = new Date().toISOString().slice(0, 10);
    if (s.lastLoginDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = s.lastLoginDate === yesterday ? Math.min(s.dailyStreak + 1, 11) : 1;
    set({ dailyStreak: newStreak, lastLoginDate: today });
  },

  setLanguage: (lang) => set({ language: lang }),

  resetGame: () => set({ ...DEFAULT_STATE }),

  addIdleXpBuffer: (amount) => {
    const s = get();
    const cap = getXpStorageCapacity(s.xpStorageLevel);
    set({ idleXpBuffer: Math.min(cap, s.idleXpBuffer + amount) });
  },

  collectIdleXpBuffer: () => {
    const s = get();
    const buffer = Math.floor(s.idleXpBuffer);
    if (buffer === 0) return;
    const xp = s.xp + buffer;
    const level = getLevelFromXp(xp);
    const unlockedMonsters = unlockMonsters(xp, s.unlockedMonsters);
    const next = { ...s, xp, level, unlockedMonsters, idleXpBuffer: 0 };
    set({ xp, level, unlockedMonsters, idleXpBuffer: 0, unlockedAchievements: checkAchievements(next) });
  },

  purchaseXpStorage: (level) => {
    const s = get();
    if (s.xpStorageLevel >= level) return false;
    if (s.xpStorageLevel !== level - 1) return false;
    const upgrade = XP_STORAGE_UPGRADES.find((u) => u.level === level);
    if (!upgrade || s.xp < upgrade.xpCost) return false;
    set({ xpStorageLevel: level, xp: s.xp - upgrade.xpCost });
    return true;
  },

  purchaseKutsalKilic: () => {
    const s = get();
    if (s.kutsalKilicPurchased || !s.kutsalKilicUnlocked) return false;
    if (s.level < 100) return false;
    if (s.tikTik < 1000000) return false;
    if (s.xp < 100000) return false;
    set({
      kutsalKilicPurchased: true,
      tikTik: s.tikTik - 1000000,
      xp: s.xp - 100000,
    });
    return true;
  },

  upgradeTikGun: () => {
    const s = get();
    const nextLevel = s.tikGunLevel + 1;
    if (nextLevel > TIKGUN_LEVELS.length) return false;
    const upgrade = TIKGUN_LEVELS[nextLevel - 1];
    if (upgrade.requiresGoblinKral && s.goblinKralDefeatedCount < 5) return false;
    if (s.tikTik < upgrade.cost) return false;
    set({ tikGunLevel: nextLevel, tikTik: s.tikTik - upgrade.cost });
    return true;
  },

  purchaseDovizci: () => {
    const s = get();
    if (s.dovizciPurchased) return false;
    if (s.tikTik < DOVIZCI_COST_TIKTIK || s.xp < DOVIZCI_COST_XP) return false;
    set({ dovizciPurchased: true, tikTik: s.tikTik - DOVIZCI_COST_TIKTIK, xp: s.xp - DOVIZCI_COST_XP });
    return true;
  },

  convertXpToTikTik: (amount) => {
    const s = get();
    if (!s.dovizciPurchased || amount <= 0 || s.xp < amount) return false;
    const { xpToTikTik } = getDovizciRates(s.level);
    const gain = amount * xpToTikTik;
    set({ xp: s.xp - amount, tikTik: s.tikTik + gain, totalTikTikEarned: s.totalTikTikEarned + gain });
    return true;
  },

  convertTikTikToXp: (amount) => {
    const s = get();
    if (!s.dovizciPurchased || amount <= 0 || s.tikTik < amount) return false;
    const { tikTikToXp } = getDovizciRates(s.level);
    if (!tikTikToXp) return false;
    const gain = Math.floor(amount / tikTikToXp);
    if (gain <= 0) return false;
    const xp = s.xp + gain;
    const level = getLevelFromXp(xp);
    const unlockedMonsters = unlockMonsters(xp, s.unlockedMonsters);
    set({ tikTik: s.tikTik - amount, xp, level, unlockedMonsters });
    return true;
  },

  purchaseSilahTuccari: () => {
    const s = get();
    if (s.silahTuccariPurchased) return false;
    if (s.tikTik < SILAH_TUCCARI_COST_TIKTIK || s.xp < SILAH_TUCCARI_COST_XP) return false;
    set({ silahTuccariPurchased: true, tikTik: s.tikTik - SILAH_TUCCARI_COST_TIKTIK, xp: s.xp - SILAH_TUCCARI_COST_XP });
    return true;
  },

  purchaseWeapon: (weaponId) => {
    const s = get();
    if (s.purchasedWeapons.includes(weaponId)) return false;
    const weapon = WEAPONS.find((w) => w.id === weaponId);
    if (!weapon) return false;
    if (weapon.requiresLevel && s.level < weapon.requiresLevel) return false;
    if (weapon.requiresMonsterDefeats) {
      const { monsterId, count } = weapon.requiresMonsterDefeats;
      const defeated = monsterId === 1  ? s.slimeDefeatedCount
        : monsterId === 10 ? s.melekDefeatedCount
        : monsterId === 11 ? s.goblinKralDefeatedCount
        : monsterId === 14 ? s.miniEjderhaDefeatedCount
        : 0;
      if (defeated < count) return false;
    }
    if (weapon.xpCost && s.xp < weapon.xpCost) return false;
    if (s.tikTik < weapon.cost) return false;
    set({
      purchasedWeapons: [...s.purchasedWeapons, weaponId],
      tikTik: s.tikTik - weapon.cost,
      ...(weapon.xpCost ? { xp: s.xp - weapon.xpCost } : {}),
      ...(weaponId === 'kutsal_kilic' ? { kutsalKilicPurchased: true } : {}),
    });
    return true;
  },

  equipWeapon: (weaponId) => {
    const s = get();
    if (!s.purchasedWeapons.includes(weaponId)) return false;
    if (s.equippedWeapons.includes(weaponId)) return false;
    if (s.equippedWeapons.length >= getEquipmentSlots(s.level)) return false;
    set({ equippedWeapons: [...s.equippedWeapons, weaponId] });
    return true;
  },

  unequipWeapon: (weaponId) => {
    const s = get();
    set({ equippedWeapons: s.equippedWeapons.filter((id) => id !== weaponId) });
  },
}));

// ─── Persistence (manual, no middleware) ──────────────────────────────────────
const STORAGE_KEY = 'tiktik-v01';

const PERSIST_KEYS: (keyof typeof DEFAULT_STATE)[] = [
  'nickname', 'level', 'xp', 'tikTik', 'clickPower', 'maxMultiTouch',
  'totalClicks', 'totalMonstersDefeated', 'totalTikTikEarned',
  'activeMonsterId', 'unlockedMonsters', 'purchasedIdleSystems',
  'unlockedAchievements', 'offlineProgression', 'language', 'idleXpBuffer', 'kutsalKilicUnlocked', 'kutsalKilicPurchased', 'xpStorageLevel',
  'dailyStreak', 'lastLoginDate', 'melekDefeatedCount', 'tikGunLevel', 'goblinKralDefeatedCount', 'miniEjderhaDefeatedCount', 'slimeDefeatedCount', 'dovizciPurchased',
  'silahTuccariPurchased', 'purchasedWeapons', 'equippedWeapons',
];

export async function loadPersistedState(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      useGameStore.setState(saved);
    }
  } catch (_) {
    // first launch or corrupt data — use defaults
  }
}

export async function saveState(): Promise<void> {
  try {
    const s = useGameStore.getState();
    const partial: Record<string, unknown> = {};
    for (const key of PERSIST_KEYS) {
      partial[key] = s[key as keyof GameState];
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(partial));
  } catch (_) {}
}
