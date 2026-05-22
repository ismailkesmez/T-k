import { Audio } from 'expo-av';

const soundFiles: Record<number, number> = {
  1:  require('../../assets/sounds/monster_1.wav'),
  2:  require('../../assets/sounds/monster_2.wav'),
  3:  require('../../assets/sounds/monster_3.wav'),
  4:  require('../../assets/sounds/monster_4.wav'),
  5:  require('../../assets/sounds/monster_5.wav'),
  6:  require('../../assets/sounds/monster_6.wav'),
  7:  require('../../assets/sounds/monster_7.wav'),
  8:  require('../../assets/sounds/monster_8.wav'),
  9:  require('../../assets/sounds/monster_9.wav'),
  10: require('../../assets/sounds/monster_10.wav'),
  11: require('../../assets/sounds/monster_11.wav'),
};

// Monsters without dedicated sound files are aliased to the closest thematic match
const soundAliases: Record<number, number> = {
  12: 9,  // Trol        → İblis Kral (ağır yaratık)
  13: 5,  // Elemental   → Cadı (büyülü/elektrikli)
  14: 8,  // Mini Ejderha → İblis (ateş/ejderha)
  15: 2,  // Kurtadam   → Kurt
  16: 3,  // Minotor    → Golem (ağır taş darbesi)
  17: 4,  // Canlı Ağaç → Yaratık Avcısı
  18: 9,  // Ogre       → İblis Kral (dev yaratık)
  19: 8,  // Ejderha    → İblis (ateş/ejderha)
  20: 10, // Baş Melek  → Melek
};

const cache: Record<number, Audio.Sound> = {};

export async function preloadSounds(): Promise<void> {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: false, staysActiveInBackground: false });
  await Promise.all(
    Object.entries(soundFiles).map(async ([id, file]) => {
      const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: false });
      cache[Number(id)] = sound;
    })
  );
}

export function playMonsterSound(monsterId: number): void {
  const resolvedId = soundAliases[monsterId] ?? monsterId;
  const sound = cache[resolvedId];
  if (!sound) return;
  sound.setPositionAsync(0).then(() => sound.playAsync()).catch(() => {});
}

export async function unloadSounds(): Promise<void> {
  await Promise.all(Object.values(cache).map((s) => s.unloadAsync().catch(() => {})));
}
