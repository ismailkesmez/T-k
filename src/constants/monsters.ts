export interface Monster {
  id: number;
  name: string;
  emoji: string;
  image: number | null;    // require(...) sonucu — null ise emoji kullanılır
  bgImage: number | null;  // require(...) sonucu — null ise düz renk kullanılır
  imagePosition: 'center' | 'flex-start' | 'flex-end'; // oyun alanındaki dikey konum
  imageOffsetY: number; // px — pozitif: aşağı, negatif: yukarı
  imageScale: number;   // 1.0 = varsayılan boyut
  level: number;
  requiredXp: number;
  maxHp: number;
  rewardTikTik: number;
  rewardXp: number;
  hitRewardTikTik: number;
  hitRewardXp: number;
  bubbleEmoji: string;
  bubbleHeal: number;
  bubbleCount: number;
  hpRegenPerSec: number;
  color: string;
  bgColor: string;
  playBg: string;
}

export const MONSTERS: Monster[] = [
  {
    id: 1,
    name: 'Slime',
    emoji: '🟢',
    image: require('../../assets/monsters/monster_1.png'),
    bgImage: require('../../assets/monsters/bg_1.png'),
    imagePosition: 'center',
    imageOffsetY: 0,
    imageScale: 1,
    level: 1,
    requiredXp: 0,
    maxHp: 1000,
    rewardTikTik: 50,
    rewardXp: 50,
    hitRewardTikTik: 5,
    hitRewardXp: 1,
    bubbleEmoji: '🫧',
    bubbleHeal: 1,
    bubbleCount: 1,
    hpRegenPerSec: 1,
    color: '#2ED573',
    bgColor: 'rgba(46,213,115,0.12)',
    playBg: '#0a1f12',
  },
  {
    id: 2,
    name: 'Kurt',
    emoji: '🐺',
    image: require('../../assets/monsters/monster_2.png'),
    bgImage: require('../../assets/monsters/bg_2.png'),
    imagePosition: 'flex-end',
    imageOffsetY: 0,
    imageScale: 1,
    level: 2,
    requiredXp: 100,
    maxHp: 10000,
    rewardTikTik: 500,
    rewardXp: 100,
    hitRewardTikTik: 10,
    hitRewardXp: 2,
    bubbleEmoji: '🐾',
    bubbleHeal: 10,
    bubbleCount: 2,
    hpRegenPerSec: 2,
    color: '#B2BEC3',
    bgColor: 'rgba(178,190,195,0.12)',
    playBg: '#151a1c',
  },
  {
    id: 3,
    name: 'Golem',
    emoji: '🗿',
    image: require('../../assets/monsters/monster_3.png'),
    bgImage: require('../../assets/monsters/bg_3.png'),
    imagePosition: 'center',
    imageOffsetY: 40,
    imageScale: 1,
    level: 3,
    requiredXp: 1000,
    maxHp: 100000,
    rewardTikTik: 3000,
    rewardXp: 200,
    hitRewardTikTik: 20,
    hitRewardXp: 3,
    bubbleEmoji: '🪨',
    bubbleHeal: 100,
    bubbleCount: 3,
    hpRegenPerSec: 3,
    color: '#FDCB6E',
    bgColor: 'rgba(253,203,110,0.12)',
    playBg: '#231a08',
  },
  {
    id: 4,
    name: 'Yaratık Avcısı',
    emoji: '🏹',
    image: require('../../assets/monsters/monster_4.png'),
    bgImage: require('../../assets/monsters/bg_4.png'),
    imagePosition: 'center',
    imageOffsetY: 20,
    imageScale: 1,
    level: 4,
    requiredXp: 8000,
    maxHp: 200000,
    rewardTikTik: 8000,
    rewardXp: 300,
    hitRewardTikTik: 30,
    hitRewardXp: 4,
    bubbleEmoji: '🎯',
    bubbleHeal: 200,
    bubbleCount: 4,
    hpRegenPerSec: 4,
    color: '#00CEC9',
    bgColor: 'rgba(0,206,201,0.12)',
    playBg: '#04211f',
  },
  {
    id: 5,
    name: 'Cadı',
    emoji: '🧙‍♀️',
    image: require('../../assets/monsters/monster_5.png'),
    bgImage: require('../../assets/monsters/bg_5.png'),
    imagePosition: 'center',
    imageOffsetY: 0,
    imageScale: 1,
    level: 5,
    requiredXp: 10000,
    maxHp: 300000,
    rewardTikTik: 15000,
    rewardXp: 400,
    hitRewardTikTik: 40,
    hitRewardXp: 5,
    bubbleEmoji: '🔮',
    bubbleHeal: 300,
    bubbleCount: 5,
    hpRegenPerSec: 5,
    color: '#A29BFE',
    bgColor: 'rgba(162,155,254,0.12)',
    playBg: '#16143a',
  },
  {
    id: 6,
    name: 'Vampir',
    emoji: '🧛',
    image: require('../../assets/monsters/monster_6.png'),
    bgImage: require('../../assets/monsters/bg_6.png'),
    imagePosition: 'center',
    imageOffsetY: 20,
    imageScale: 1,
    level: 6,
    requiredXp: 12000,
    maxHp: 500000,
    rewardTikTik: 30000,
    rewardXp: 500,
    hitRewardTikTik: 50,
    hitRewardXp: 6,
    bubbleEmoji: '🩸',
    bubbleHeal: 500,
    bubbleCount: 6,
    hpRegenPerSec: 6,
    color: '#FF4757',
    bgColor: 'rgba(255,71,87,0.12)',
    playBg: '#250a0d',
  },
  {
    id: 7,
    name: 'Ölü Kral',
    emoji: '💀',
    image: require('../../assets/monsters/monster_7.png'),
    bgImage: require('../../assets/monsters/bg_7.png'),
    imagePosition: 'center',
    imageOffsetY: 0,
    imageScale: 1,
    level: 7,
    requiredXp: 14000,
    maxHp: 1000000,
    rewardTikTik: 70000,
    rewardXp: 1000,
    hitRewardTikTik: 60,
    hitRewardXp: 7,
    bubbleEmoji: '🦴',
    bubbleHeal: 1000,
    bubbleCount: 7,
    hpRegenPerSec: 7,
    color: '#DFE6E9',
    bgColor: 'rgba(223,230,233,0.12)',
    playBg: '#0d0f10',
  },
  {
    id: 8,
    name: 'İblis',
    emoji: '😈',
    image: require('../../assets/monsters/monster_8.png'),
    bgImage: require('../../assets/monsters/bg_8.png'),
    imagePosition: 'center',
    imageOffsetY: 30,
    imageScale: 1,
    level: 8,
    requiredXp: 16000,
    maxHp: 1500000,
    rewardTikTik: 120000,
    rewardXp: 1500,
    hitRewardTikTik: 70,
    hitRewardXp: 8,
    bubbleEmoji: '🔥',
    bubbleHeal: 1500,
    bubbleCount: 8,
    hpRegenPerSec: 8,
    color: '#E17055',
    bgColor: 'rgba(225,112,85,0.12)',
    playBg: '#241208',
  },
  {
    id: 9,
    name: 'İblis Kral',
    emoji: '👹',
    image: require('../../assets/monsters/monster_9.png'),
    bgImage: require('../../assets/monsters/bg_9.png'),
    imagePosition: 'center',
    imageOffsetY: 30,
    imageScale: 1,
    level: 9,
    requiredXp: 18000,
    maxHp: 3000000,
    rewardTikTik: 280000,
    rewardXp: 2000,
    hitRewardTikTik: 80,
    hitRewardXp: 9,
    bubbleEmoji: '💢',
    bubbleHeal: 3000,
    bubbleCount: 9,
    hpRegenPerSec: 50,
    color: '#FF6B9D',
    bgColor: 'rgba(255,107,157,0.12)',
    playBg: '#250d18',
  },
  {
    id: 10,
    name: 'Melek',
    emoji: '👼',
    image: require('../../assets/monsters/monster_10.png'),
    bgImage: require('../../assets/monsters/bg_10.png'),
    imagePosition: 'center',
    imageOffsetY: 30,
    imageScale: 1.3,
    level: 10,
    requiredXp: 20000,
    maxHp: 5000000,
    rewardTikTik: 600000,
    rewardXp: 5000,
    hitRewardTikTik: 90,
    hitRewardXp: 10,
    bubbleEmoji: '✨',
    bubbleHeal: 5000,
    bubbleCount: 10,
    hpRegenPerSec: 100,
    color: '#FFD700',
    bgColor: 'rgba(255,215,0,0.12)',
    playBg: '#231e00',
  },
  {
    id: 11,
    name: 'Baş Melek',
    emoji: '🌟',
    image: require('../../assets/monsters/monster_11.png'),
    bgImage: require('../../assets/monsters/bg_11.png'),
    imagePosition: 'center',
    imageOffsetY: 0,
    imageScale: 1,
    level: 11,
    requiredXp: 999999999,
    maxHp: 10000000,
    rewardTikTik: 1500000,
    rewardXp: 0,
    hitRewardTikTik: 100,
    hitRewardXp: 0,
    bubbleEmoji: '💠',
    bubbleHeal: 10000,
    bubbleCount: 15,
    hpRegenPerSec: 1000,
    color: '#B8E0FF',
    bgColor: 'rgba(184,224,255,0.12)',
    playBg: '#03090f',
  },
];

export const LEVEL_XP_THRESHOLDS: number[] = [
  // Level 1-10
  0, 100, 1000, 8000, 10000, 12000, 14000, 16000, 18000, 20000,
  // Level 11-20
  25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000,
  // Level 21-30
  75000, 80000, 85000, 90000, 95000, 100000, 105000, 110000, 115000, 120000,
  // Level 31-40
  125000, 130000, 135000, 140000, 145000, 150000, 155000, 160000, 165000, 170000,
  // Level 41-50
  175000, 180000, 185000, 190000, 195000, 200000, 205000, 210000, 215000, 220000,
  // Level 51-60
  225000, 230000, 235000, 240000, 245000, 250000, 255000, 260000, 265000, 270000,
  // Level 61-70
  275000, 280000, 285000, 290000, 295000, 300000, 305000, 310000, 315000, 320000,
  // Level 71-80
  325000, 330000, 335000, 340000, 345000, 350000, 355000, 360000, 365000, 370000,
  // Level 81-90
  375000, 380000, 385000, 390000, 395000, 400000, 405000, 410000, 415000, 420000,
  // Level 91-100
  425000, 430000, 435000, 440000, 445000, 450000, 455000, 460000, 465000, 470000,
];

export const getMonsterById = (id: number): Monster =>
  MONSTERS.find((m) => m.id === id) ?? MONSTERS[0];

export const getLevelFromXp = (xp: number): number => {
  let level = 1;
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
};

export const getNextLevelXp = (level: number): number =>
  LEVEL_XP_THRESHOLDS[level] ?? LEVEL_XP_THRESHOLDS[LEVEL_XP_THRESHOLDS.length - 1];
