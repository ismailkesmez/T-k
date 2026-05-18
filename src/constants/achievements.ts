export type AchievementConditionField =
  | 'totalClicks'
  | 'totalMonstersDefeated'
  | 'level'
  | 'totalTikTikEarned'
  | 'unlockedMonstersCount'
  | 'clickPower'
  | 'maxMultiTouch';

export interface Achievement {
  id: number;
  nameKey: string;
  descKey: string;
  conditionField: AchievementConditionField;
  conditionValue: number;
  rewardTikTik: number;
  rewardXp: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    nameKey: 'ach_first_tap',
    descKey: 'ach_first_tap_desc',
    conditionField: 'totalClicks',
    conditionValue: 1,
    rewardTikTik: 50,
    rewardXp: 5,
  },
  {
    id: 2,
    nameKey: 'ach_100_clicks',
    descKey: 'ach_100_clicks_desc',
    conditionField: 'totalClicks',
    conditionValue: 100,
    rewardTikTik: 200,
    rewardXp: 20,
  },
  {
    id: 3,
    nameKey: 'ach_1000_clicks',
    descKey: 'ach_1000_clicks_desc',
    conditionField: 'totalClicks',
    conditionValue: 1000,
    rewardTikTik: 1000,
    rewardXp: 100,
  },
  {
    id: 4,
    nameKey: 'ach_10000_clicks',
    descKey: 'ach_10000_clicks_desc',
    conditionField: 'totalClicks',
    conditionValue: 10000,
    rewardTikTik: 5000,
    rewardXp: 400,
  },
  {
    id: 5,
    nameKey: 'ach_first_monster',
    descKey: 'ach_first_monster_desc',
    conditionField: 'totalMonstersDefeated',
    conditionValue: 1,
    rewardTikTik: 500,
    rewardXp: 50,
  },
  {
    id: 6,
    nameKey: 'ach_10_monsters',
    descKey: 'ach_10_monsters_desc',
    conditionField: 'totalMonstersDefeated',
    conditionValue: 10,
    rewardTikTik: 100000,
    rewardXp: 1000,
  },
  {
    id: 7,
    nameKey: 'ach_level_2',
    descKey: 'ach_level_2_desc',
    conditionField: 'level',
    conditionValue: 2,
    rewardTikTik: 300,
    rewardXp: 0,
  },
  {
    id: 8,
    nameKey: 'ach_level_5',
    descKey: 'ach_level_5_desc',
    conditionField: 'level',
    conditionValue: 5,
    rewardTikTik: 5000,
    rewardXp: 0,
  },
  {
    id: 9,
    nameKey: 'ach_1000_tiktik',
    descKey: 'ach_1000_tiktik_desc',
    conditionField: 'totalTikTikEarned',
    conditionValue: 1000,
    rewardTikTik: 500,
    rewardXp: 25,
  },
  {
    id: 10,
    nameKey: 'ach_10000_tiktik',
    descKey: 'ach_10000_tiktik_desc',
    conditionField: 'totalTikTikEarned',
    conditionValue: 10000,
    rewardTikTik: 3000,
    rewardXp: 100,
  },
  {
    id: 11,
    nameKey: 'ach_max_click',
    descKey: 'ach_max_click_desc',
    conditionField: 'clickPower',
    conditionValue: 10,
    rewardTikTik: 20000,
    rewardXp: 500,
  },
  {
    id: 12,
    nameKey: 'ach_multitouch',
    descKey: 'ach_multitouch_desc',
    conditionField: 'maxMultiTouch',
    conditionValue: 3,
    rewardTikTik: 2000,
    rewardXp: 80,
  },
  {
    id: 13,
    nameKey: 'ach_unlock_5_monsters',
    descKey: 'ach_unlock_5_monsters_desc',
    conditionField: 'unlockedMonstersCount',
    conditionValue: 5,
    rewardTikTik: 8000,
    rewardXp: 200,
  },
  {
    id: 14,
    nameKey: 'ach_all_monsters',
    descKey: 'ach_all_monsters_desc',
    conditionField: 'unlockedMonstersCount',
    conditionValue: 10,
    rewardTikTik: 50000,
    rewardXp: 1000,
  },
];
