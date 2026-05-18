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
  const sound = cache[monsterId];
  if (!sound) return;
  sound.setPositionAsync(0).then(() => sound.playAsync()).catch(() => {});
}

export async function unloadSounds(): Promise<void> {
  await Promise.all(Object.values(cache).map((s) => s.unloadAsync().catch(() => {})));
}
