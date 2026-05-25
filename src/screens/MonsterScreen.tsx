import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useGameStore } from '../store/gameStore';
import { getMonsterById, MONSTERS, getNextLevelXp } from '../constants/monsters';
import { IDLE_SYSTEMS, MULTI_TOUCH_MULTIPLIERS, getXpStorageCapacity, CLICK_POWER_DAMAGE, getTikGunPerHit, WEAPONS, SLIME_SWORD_EVOLUTION_COUNT, SLIME_SWORD_FINAL_COUNT, SLIME_SWORD_FUSION_COUNT } from '../constants/shop';
import { playMonsterSound } from '../utils/soundManager';
import HPBar from '../components/HPBar';
import FloatingText, { FloatingItem } from '../components/FloatingText';
import { t } from '../i18n';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

const HIT_TIKTIK_INTERVAL = 5;
const HIT_XP_INTERVAL = 10;

interface BubbleData {
  id: number;
  x: number;
  y: number;
}

let floatIdCounter = 0;

export default function MonsterScreen() {
  const lang = useGameStore((s) => s.language);
  const activeMonsterId = useGameStore((s) => s.activeMonsterId);
  const unlockedMonsters = useGameStore((s) => s.unlockedMonsters);
  const clickPower = useGameStore((s) => s.clickPower);
  const maxMultiTouch = useGameStore((s) => s.maxMultiTouch);
  const addTikTik = useGameStore((s) => s.addTikTik);
  const addXp = useGameStore((s) => s.addXp);
  const recordMonsterDefeated = useGameStore((s) => s.recordMonsterDefeated);
  const recordClicks = useGameStore((s) => s.recordClicks);
  const setActiveMonster = useGameStore((s) => s.setActiveMonster);
  const tikTik = useGameStore((s) => s.tikTik);
  const xp = useGameStore((s) => s.xp);
  const idleXpBuffer = useGameStore((s) => s.idleXpBuffer);
  const purchasedIdleSystems = useGameStore((s) => s.purchasedIdleSystems);
  const collectIdleXpBuffer = useGameStore((s) => s.collectIdleXpBuffer);
  const xpStorageLevel = useGameStore((s) => s.xpStorageLevel);
  const kutsalKilicUnlocked = useGameStore((s) => s.kutsalKilicUnlocked);
  const kutsalKilicPurchased = useGameStore((s) => s.kutsalKilicPurchased);
  const tikGunLevel = useGameStore((s) => s.tikGunLevel);
  const equippedWeapons = useGameStore((s) => s.equippedWeapons);
  const enhancedWeapons = useGameStore((s) => s.enhancedWeapons);
  const playerHp = useGameStore((s) => s.playerHp);
  const setPlayerHp = useGameStore((s) => s.setPlayerHp);
  const onPlayerDeath = useGameStore((s) => s.onPlayerDeath);
  const level = useGameStore((s) => s.level);
  const bonusHp = useGameStore((s) => s.bonusHp);
  const incrementSlimeSwordUse = useGameStore((s) => s.incrementSlimeSwordUse);
  const slimeSwordUseCount = useGameStore((s) => s.slimeSwordUseCount);
  const slimeKilledWithMutlakCount = useGameStore((s) => s.slimeKilledWithMutlakCount);
  const slimeKralDefeated = useGameStore((s) => s.slimeKralDefeated);
  const playerMaxHp = level * 100 + bonusHp;

  const [showKutsalKilic, setShowKutsalKilic] = useState(false);
  const [bubblesSuppressed, setBubblesSuppressed] = useState(false);
  const [crossMode, setCrossMode] = useState(false);
  const [fusionMode, setFusionMode] = useState(false);
  const [cursed, setCursed] = useState(false);
  const cursedRef = useRef(false);
  const crossModeRef = useRef(false);
  const fusionModeRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleSuppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crossModeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fusionModeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearCountdown = () => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    setSecondsLeft(0);
  };

  const startCountdown = (seconds: number) => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    setSecondsLeft(seconds);
    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(countdownRef.current!); countdownRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const monster = getMonsterById(activeMonsterId);
  const slimeKilicEquipped = equippedWeapons.some((id) => {
    if (id === 'slime_sword') return true;
    const enh = enhancedWeapons.find((e) => e.instanceId === id);
    return enh?.baseWeaponId === 'slime_sword';
  });
  const slimeSwordStage = (slimeKralDefeated && slimeKilledWithMutlakCount >= SLIME_SWORD_FUSION_COUNT) ? 3
    : slimeSwordUseCount >= SLIME_SWORD_FINAL_COUNT ? 2
    : slimeSwordUseCount >= SLIME_SWORD_EVOLUTION_COUNT ? 1 : 0;
  const slimeKilicEvolved = slimeKilicEquipped && slimeSwordStage >= 1;
  const slimeMutlakEquipped = slimeKilicEquipped && slimeSwordStage === 2;
  const slimeFusionEquipped = slimeKilicEquipped && slimeSwordStage === 3;
  const kutsalKilicEquipped = equippedWeapons.includes('kutsal_kilic');
  const gumusKilicEquipped = equippedWeapons.includes('gumus_kilic');

  const [hp, setHp] = useState(monster.maxHp);
  const slimeKralHpRatio = monster.id === 21 ? Math.max(0, hp / monster.maxHp) : 1;
  const activeBubbleCount = monster.id === 21
    ? Math.max(2, Math.min(25, Math.round(25 - slimeKralHpRatio * 23)))
    : monster.bubbleCount;
  const activeBubbleSize = monster.id === 21
    ? Math.max(20, Math.round(80 - ((activeBubbleCount - 2) / 23) * 60))
    : (monster.bubbleSizeOverride ?? Math.max(20, Math.round(58 - (monster.bubbleCount - 1) * 3)));
  const [showMonsterPicker, setShowMonsterPicker] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingItem[]>([]);
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [playAreaSize, setPlayAreaSize] = useState({ width: 0, height: 0 });
  const hitCounterRef = useRef(0);
  const kutsalHitCounterRef = useRef(0);
  const hpRef = useRef(monster.maxHp);
  const playerHpRef = useRef(playerHp);
  playerHpRef.current = playerHp;
  crossModeRef.current = crossMode;
  fusionModeRef.current = fusionMode;
  const monsterScaleAnim = useRef(new Animated.Value(1)).current;
  const defeatAnim = useRef(new Animated.Value(1)).current;
  const processedTouchIds = useRef(new Set<number | string>());

  // Reset HP when monster changes; also cancel any active bubble suppression
  useEffect(() => {
    const maxHp = getMonsterById(activeMonsterId).maxHp;
    hpRef.current = maxHp;
    setHp(maxHp);
    hitCounterRef.current = 0;
    kutsalHitCounterRef.current = 0;
    setBubblesSuppressed(false);
    crossModeRef.current = false;
    setCrossMode(false);
    cursedRef.current = false;
    setCursed(false);
    fusionModeRef.current = false;
    setFusionMode(false);
    clearCountdown();
    if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
    if (bubbleSuppressTimerRef.current) { clearTimeout(bubbleSuppressTimerRef.current); bubbleSuppressTimerRef.current = null; }
    if (crossModeTimerRef.current) { clearTimeout(crossModeTimerRef.current); crossModeTimerRef.current = null; }
    if (fusionModeTimerRef.current) { clearTimeout(fusionModeTimerRef.current); fusionModeTimerRef.current = null; }
  }, [activeMonsterId]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (bubbleSuppressTimerRef.current) clearTimeout(bubbleSuppressTimerRef.current);
      if (crossModeTimerRef.current) clearTimeout(crossModeTimerRef.current);
      if (fusionModeTimerRef.current) clearTimeout(fusionModeTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Monster HP regen
  useEffect(() => {
    const interval = setInterval(() => {
      if (hpRef.current <= 0 || hpRef.current >= monster.maxHp) return;
      const newHp = Math.min(monster.maxHp, hpRef.current + monster.hpRegenPerSec);
      hpRef.current = newHp;
      setHp(newHp);
    }, 1000);
    return () => clearInterval(interval);
  }, [monster.id]);

  // Player HP regen (level HP/sec) — blocked while cursed by monster 17
  useEffect(() => {
    const interval = setInterval(() => {
      if (cursedRef.current || playerHpRef.current >= playerMaxHp) return;
      const newHp = Math.min(playerMaxHp, playerHpRef.current + level);
      playerHpRef.current = newHp;
      setPlayerHp(newHp);
    }, 1000);
    return () => clearInterval(interval);
  }, [level, playerMaxHp]);

  // Spawn bubbles
  useEffect(() => {
    if (playAreaSize.width === 0) return;
    spawnBubbles();
    const interval = setInterval(spawnBubbles, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [activeBubbleCount, activeBubbleSize, playAreaSize]);

  const spawnBubbles = useCallback(() => {
    if (playAreaSize.width === 0) return;
    setBubbles(
      Array.from({ length: activeBubbleCount }, (_, i) => ({
        id: i,
        x: activeBubbleSize / 2 + Math.random() * (playAreaSize.width - activeBubbleSize * 2),
        y: activeBubbleSize / 2 + Math.random() * (playAreaSize.height - activeBubbleSize * 2),
      }))
    );
  }, [activeBubbleCount, activeBubbleSize, playAreaSize]);

  // Save timestamp when leaving screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        useGameStore.getState().saveTimestamp();
      };
    }, [])
  );

  const addFloating = (x: number, y: number, text: string, color?: string) => {
    const id = floatIdCounter++;
    setFloatingTexts((prev) => [...prev, { id, x, y, text, color }]);
  };

  const onPlayAreaLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPlayAreaSize({ width, height });
  };

  const touchMultiplier = MULTI_TOUCH_MULTIPLIERS[maxMultiTouch - 1] ?? 1;

  // When Gümüş Kılıç is equipped, only its own +10% applies; other weapon effects are disabled.
  // Slime Kılıcı's bubble suppression mechanic is unaffected (it has no damage bonus).
  const flatWeaponBonus = gumusKilicEquipped ? 0 : equippedWeapons.reduce((acc, id) => {
    const enhanced = enhancedWeapons.find((e) => e.instanceId === id);
    return enhanced ? acc + enhanced.enhancement : acc;
  }, 0);

  const weaponDamageMultiplier = 1 + equippedWeapons.reduce((acc, id) => {
    if (gumusKilicEquipped && id !== 'gumus_kilic') return acc;
    const base = WEAPONS.find((w) => w.id === id);
    if (base?.bonusType === 'damage_percent') return acc + base.bonusValue;
    if (!gumusKilicEquipped) {
      const enhanced = enhancedWeapons.find((e) => e.instanceId === id);
      if (enhanced) {
        const bw = WEAPONS.find((w) => w.id === enhanced.baseWeaponId);
        if (bw?.bonusType === 'damage_percent') return acc + bw.bonusValue;
      }
    }
    return acc;
  }, 0);

  const onTouchStart = (e: GestureResponderEvent) => {
    const changedTouches = Array.from(e.nativeEvent.changedTouches);

    // Long-press detection for Slime Kılıcı variants
    if (slimeKilicEquipped && processedTouchIds.current.size === 0 && !bubblesSuppressed && !crossModeRef.current && !fusionModeRef.current) {
      const holdDuration = slimeSwordStage >= 1 ? 2000 : 3000;
      longPressTimerRef.current = setTimeout(() => {
        longPressTimerRef.current = null;
        incrementSlimeSwordUse();
        if (slimeFusionEquipped) {
          // Füzyon: suppress bubbles 10s + 3× damage mode
          fusionModeRef.current = true;
          setFusionMode(true);
          setBubblesSuppressed(true);
          startCountdown(10);
          if (bubbleSuppressTimerRef.current) clearTimeout(bubbleSuppressTimerRef.current);
          if (fusionModeTimerRef.current) clearTimeout(fusionModeTimerRef.current);
          const endFusion = () => {
            fusionModeRef.current = false;
            setFusionMode(false);
            setBubblesSuppressed(false);
            clearCountdown();
          };
          fusionModeTimerRef.current = setTimeout(endFusion, 10000);
        } else if (slimeMutlakEquipped) {
          // Mutlak: cross mode — bubbles become ✕ attack targets for 10s
          crossModeRef.current = true;
          setCrossMode(true);
          startCountdown(10);
          if (crossModeTimerRef.current) clearTimeout(crossModeTimerRef.current);
          crossModeTimerRef.current = setTimeout(() => {
            crossModeRef.current = false;
            setCrossMode(false);
            clearCountdown();
          }, 10000);
        } else {
          // Slime / Çifte: suppress mode
          setBubblesSuppressed(true);
          if (bubbleSuppressTimerRef.current) clearTimeout(bubbleSuppressTimerRef.current);
          const suppressDuration = slimeSwordStage === 1 ? 20000 : 10000;
          startCountdown(suppressDuration / 1000);
          bubbleSuppressTimerRef.current = setTimeout(() => { setBubblesSuppressed(false); clearCountdown(); }, suppressDuration);
        }
      }, holdDuration);
    }

    const processable = changedTouches;

    let clickCount = 0;

    for (const touch of processable) {
      if (processedTouchIds.current.has(touch.identifier)) continue;
      processedTouchIds.current.add(touch.identifier);

      const tx = touch.locationX;
      const ty = touch.locationY;

      // Check bubble hit (skip when Slime Kılıcı suppression is active)
      const hitBubble = !bubblesSuppressed && bubbles.find(
        (b) => tx >= b.x - activeBubbleSize / 2 && tx <= b.x + activeBubbleSize / 2 &&
               ty >= b.y - activeBubbleSize / 2 && ty <= b.y + activeBubbleSize / 2
      );

      if (hitBubble) {
        if (crossModeRef.current) {
          // Mutlak Slime Kılıcı: ✕ bubble deals 2× current damage to monster
          const baseDmg = CLICK_POWER_DAMAGE[clickPower - 1] ?? clickPower;
          let normalDmg: number;
          if (kutsalKilicEquipped && !gumusKilicEquipped) {
            normalDmg = (baseDmg * touchMultiplier + 2000 + flatWeaponBonus) * 1.5 * weaponDamageMultiplier;
          } else {
            normalDmg = (baseDmg * touchMultiplier + flatWeaponBonus) * weaponDamageMultiplier;
          }
          const crossDmg = Math.round(normalDmg * 2);
          const newHp = Math.max(0, hpRef.current - crossDmg);
          hpRef.current = newHp;
          setHp(newHp);
          setBubbles((prev) => prev.filter((b) => b.id !== hitBubble.id));
          addFloating(tx, ty, `✕ ${crossDmg.toLocaleString()}`, '#A29BFE');
          if (newHp === 0) handleMonsterDefeated();
        } else if (monster.instakillBubble) {
          // Slime Kral: bubble instakills player
          setBubbles((prev) => prev.filter((b) => b.id !== hitBubble.id));
          addFloating(tx, ty, lang === 'tr' ? '☠️ Anlık Ölüm!' : '☠️ Instant Kill!', '#FF4757');
          playerHpRef.current = 0;
          setPlayerHp(0);
          const xpLostInstakill = onPlayerDeath(monster.id);
          playerHpRef.current = useGameStore.getState().playerHp;
          hpRef.current = monster.maxHp;
          setHp(monster.maxHp);
          cursedRef.current = false;
          setCursed(false);
          crossModeRef.current = false;
          setCrossMode(false);
          fusionModeRef.current = false;
          setFusionMode(false);
          setBubblesSuppressed(false);
          clearCountdown();
          if (crossModeTimerRef.current) { clearTimeout(crossModeTimerRef.current); crossModeTimerRef.current = null; }
          if (fusionModeTimerRef.current) { clearTimeout(fusionModeTimerRef.current); fusionModeTimerRef.current = null; }
          if (bubbleSuppressTimerRef.current) { clearTimeout(bubbleSuppressTimerRef.current); bubbleSuppressTimerRef.current = null; }
          addFloating(
            playAreaSize.width / 2,
            playAreaSize.height / 3,
            xpLostInstakill > 0 ? `💀 -${xpLostInstakill} XP` : '💀',
            COLORS.PRIMARY,
          );
        } else {
          // Normal bubble: monster heals, player takes damage
          const newHp = Math.min(monster.maxHp, hpRef.current + monster.bubbleHeal);
          hpRef.current = newHp;
          setHp(newHp);
          addFloating(tx, ty, `+${monster.bubbleHeal} HP`, COLORS.PRIMARY);

          const playerDmg = Math.max(1, Math.floor(monster.bubbleHeal / 2));
          const newPlayerHp = Math.max(0, playerHpRef.current - playerDmg);
          playerHpRef.current = newPlayerHp;
          setPlayerHp(newPlayerHp);
          addFloating(tx, ty + 24, `-${playerDmg} ❤️`, '#FF7675');

          // Monster 17: apply curse (block HP regen until defeated)
          if (monster.id === 17 && !cursedRef.current) {
            cursedRef.current = true;
            setCursed(true);
            addFloating(tx, ty + 48, lang === 'tr' ? '☠️ Lanet!' : '☠️ Cursed!', '#A29BFE');
          }

          if (newPlayerHp === 0) {
            const xpLost = onPlayerDeath(monster.id);
            playerHpRef.current = useGameStore.getState().playerHp;
            hpRef.current = monster.maxHp;
            setHp(monster.maxHp);
            cursedRef.current = false;
            setCursed(false);
            crossModeRef.current = false;
            setCrossMode(false);
            if (crossModeTimerRef.current) { clearTimeout(crossModeTimerRef.current); crossModeTimerRef.current = null; }
            fusionModeRef.current = false;
            setFusionMode(false);
            setBubblesSuppressed(false);
            clearCountdown();
            if (fusionModeTimerRef.current) { clearTimeout(fusionModeTimerRef.current); fusionModeTimerRef.current = null; }
            if (bubbleSuppressTimerRef.current) { clearTimeout(bubbleSuppressTimerRef.current); bubbleSuppressTimerRef.current = null; }
            addFloating(
              playAreaSize.width / 2,
              playAreaSize.height / 3,
              xpLost > 0 ? `💀 -${xpLost} XP` : '💀',
              COLORS.PRIMARY,
            );
          }
        }
      } else {
        clickCount++;
        hitCounterRef.current++;

        if (monster.id === 15 && !gumusKilicEquipped) {
          addFloating(tx, ty, lang === 'tr' ? '🥈 Gümüş Kılıç Gereklidir.' : '🥈 Silver Sword Required.', '#C0C0C0');
          continue;
        }

        if (monster.id === 20 && !kutsalKilicEquipped) {
          addFloating(tx, ty, lang === 'tr' ? '⚔️ Kutsal Kılıç Gereklidir.' : '⚔️ Holy Sword Required.', '#B8E0FF');
          continue;
        }

        let dmg: number;
        let isKutsalHit = false;
        if (kutsalKilicEquipped && !gumusKilicEquipped) {
          kutsalHitCounterRef.current++;
          isKutsalHit = kutsalHitCounterRef.current % 11 === 0;
          const clickDmg = CLICK_POWER_DAMAGE[clickPower - 1] ?? clickPower;
          const kutsalBase = (clickDmg * touchMultiplier + 2000 + flatWeaponBonus) * 1.5;
          dmg = (isKutsalHit ? kutsalBase * 2 : kutsalBase) * weaponDamageMultiplier;
        } else {
          const baseDmg = CLICK_POWER_DAMAGE[clickPower - 1] ?? clickPower;
          dmg = (baseDmg * touchMultiplier + flatWeaponBonus) * weaponDamageMultiplier;
        }
        if (fusionModeRef.current) dmg = Math.round(dmg * 3);

        const newHp = Math.max(0, hpRef.current - dmg);
        hpRef.current = newHp;
        setHp(newHp);

        playMonsterSound(monster.id);
        if (isKutsalHit) {
          addFloating(tx, ty, `⚔️`, '#B8E0FF');
        }

        const tikGunBonus = getTikGunPerHit(tikGunLevel);
        if (tikGunBonus > 0) {
          addTikTik(tikGunBonus);
        }

        if (hitCounterRef.current % HIT_TIKTIK_INTERVAL === 0) {
          addTikTik(monster.hitRewardTikTik);
          addFloating(tx - 40, ty - 30, `+${monster.hitRewardTikTik} TT`, COLORS.GOLD);
        }
        if (hitCounterRef.current % HIT_XP_INTERVAL === 0) {
          addXp(monster.hitRewardXp);
          addFloating(tx + 20, ty - 30, `+${monster.hitRewardXp} XP`, COLORS.SECONDARY);
        }

        if (newHp === 0) {
          handleMonsterDefeated();
        }

        Animated.sequence([
          Animated.timing(monsterScaleAnim, { toValue: 0.92, duration: 60, useNativeDriver: true }),
          Animated.timing(monsterScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
      }
    }

    if (clickCount > 0) {
      recordClicks(clickCount);
    }
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    for (const touch of e.nativeEvent.changedTouches) {
      processedTouchIds.current.delete(touch.identifier);
    }
    // Cancel long-press if all fingers lifted before 3 seconds
    if (processedTouchIds.current.size === 0 && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleMonsterDefeated = () => {
    const wasLocked20 = !unlockedMonsters.includes(20);
    const wasLocked21 = !unlockedMonsters.includes(21);
    recordMonsterDefeated(monster.rewardTikTik, monster.rewardXp, monster.id);
    const newUnlockedMonsters = useGameStore.getState().unlockedMonsters;
    const justUnlocked20 = wasLocked20 && newUnlockedMonsters.includes(20);
    const justUnlocked21 = wasLocked21 && newUnlockedMonsters.includes(21);
    if (justUnlocked20) {
      setShowKutsalKilic(true);
      setTimeout(() => setShowKutsalKilic(false), 3500);
    } else if (justUnlocked21) {
      addFloating(
        playAreaSize.width / 2,
        playAreaSize.height / 3,
        lang === 'tr' ? '👑 Slime Kral açıldı!' : '👑 Slime King unlocked!',
        '#00E56B'
      );
    } else {
      addFloating(
        playAreaSize.width / 2,
        playAreaSize.height / 3,
        `+${monster.rewardTikTik} TT!`,
        COLORS.GOLD
      );
    }

    // Monster 17 defeat lifts the curse
    if (monster.id === 17) {
      cursedRef.current = false;
      setCursed(false);
    }
    // Defeat always clears cross mode and fusion mode
    crossModeRef.current = false;
    setCrossMode(false);
    if (crossModeTimerRef.current) { clearTimeout(crossModeTimerRef.current); crossModeTimerRef.current = null; }
    fusionModeRef.current = false;
    setFusionMode(false);
    setBubblesSuppressed(false);
    if (fusionModeTimerRef.current) { clearTimeout(fusionModeTimerRef.current); fusionModeTimerRef.current = null; }

    // Show Füzyon unlock notification when Slime Kral is defeated
    if (monster.id === 21) {
      addFloating(
        playAreaSize.width / 2,
        playAreaSize.height / 3 + 50,
        lang === 'tr' ? '✨ Füzyon kilidi açıldı!' : '✨ Fusion unlocked!',
        '#00E56B'
      );
    }

    Animated.sequence([
      Animated.timing(defeatAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(defeatAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(defeatAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
    ]).start(() => {
      if (monster.id === 21) {
        setActiveMonster(1);
        return;
      }
      hpRef.current = monster.maxHp;
      setHp(monster.maxHp);
      hitCounterRef.current = 0;
      kutsalHitCounterRef.current = 0;
    });
  };

  const removeFloating = (id: number) => {
    setFloatingTexts((prev) => prev.filter((f) => f.id !== id));
  };

  const nextLevelXp = getNextLevelXp(unlockedMonsters.length);

  return (
    <View style={styles.container}>
      {/* Header info */}
      <View style={styles.header}>
        <View style={styles.headerStat}>
          <Text style={styles.statLabel}>TıkTık</Text>
          <Text style={styles.statValue}>{tikTik.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.monsterSelectBtn} onPress={() => setShowMonsterPicker(true)}>
          <Text style={styles.monsterSelectText}>{t(lang, 'monster_select')}</Text>
        </TouchableOpacity>
        <View style={styles.headerStat}>
          <Text style={styles.statLabel}>XP</Text>
          <Text style={styles.statValue}>{xp.toLocaleString()}</Text>
        </View>
      </View>

      {/* Idle XP Buffer Bar */}
      {purchasedIdleSystems.length > 0 && (
        <TouchableOpacity
          style={styles.xpBufferContainer}
          onPress={collectIdleXpBuffer}
          activeOpacity={idleXpBuffer > 0 ? 0.7 : 1}
        >
          <Text style={styles.xpBufferLabel}>
            🔮 {lang === 'tr' ? 'XP Havuzu' : 'XP Pool'}
          </Text>
          {(() => {
              const cap = getXpStorageCapacity(xpStorageLevel);
              const buffered = Math.floor(idleXpBuffer);
              const full = buffered >= cap;
              return (
                <>
                  <View style={styles.xpBufferTrack}>
                    <View
                      style={[
                        styles.xpBufferFill,
                        { width: `${(Math.min(buffered, cap) / cap) * 100}%` as any },
                        full && styles.xpBufferFull,
                      ]}
                    />
                  </View>
                  <Text style={[styles.xpBufferValue, full && { color: COLORS.GOLD }]}>
                    {buffered} / {cap} XP
                    {full ? (lang === 'tr' ? ' — DOLU! 👆' : ' — FULL! 👆') : ''}
                  </Text>
                </>
              );
            })()}
        </TouchableOpacity>
      )}

      {/* Monster info row */}
      <View style={styles.monsterInfo}>
        <View style={styles.monsterNameRow}>
          <Text style={[styles.monsterName, { color: monster.color }]}>
            {t(lang, monster.nameKey as any)}
          </Text>
          <Text style={styles.monsterLevel}>Lvl {monster.level}</Text>
        </View>
        <View style={styles.playerHpWidget}>
          <View style={styles.playerHpTrack}>
            <View
              style={[
                styles.playerHpFill,
                { width: `${Math.max(0, Math.min(1, playerHp / playerMaxHp)) * 100}%` as any },
              ]}
            />
            <Text style={styles.playerHpText}>
              ❤️ {Math.round(playerHp).toLocaleString()} / {playerMaxHp.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* HP Bar */}
      <View style={styles.hpContainer}>
        <HPBar current={hp} max={monster.maxHp} />
      </View>

      {/* Play area */}
      <ImageBackground
        source={monster.bgImage ?? undefined}
        style={[styles.playArea, { borderColor: monster.color + '44', backgroundColor: monster.playBg, justifyContent: monster.imagePosition }]}
        imageStyle={styles.playAreaBgImage}
        onLayout={onPlayAreaLayout}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Monster */}
        <Animated.View
          style={[styles.monsterWrapper, { transform: [{ scale: monsterScaleAnim }, { translateY: monster.imageOffsetY }] }]}
          pointerEvents="none"
        >
          <Animated.View style={{ transform: [{ scale: defeatAnim }] }}>
            {monster.image != null ? (
              <Image
                source={monster.image}
                style={[styles.monsterImage, { width: 360 * monster.imageScale, height: 360 * monster.imageScale }]}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.monsterEmoji}>{monster.emoji}</Text>
            )}
          </Animated.View>
        </Animated.View>

        {/* Bubbles — hidden during suppress; shown as ✕ during cross mode */}
        {!bubblesSuppressed && bubbles.map((b) => (
          <View
            key={b.id}
            style={[
              styles.bubble,
              {
                left: b.x - activeBubbleSize / 2,
                top: b.y - activeBubbleSize / 2,
                width: activeBubbleSize,
                height: activeBubbleSize,
              },
            ]}
            pointerEvents="none"
          >
            <Text style={[
              styles.bubbleEmoji,
              { fontSize: Math.round(activeBubbleSize * 0.65) },
              crossMode && styles.crossBubble,
            ]}>
              {crossMode ? '✕' : monster.bubbleEmoji}
            </Text>
          </View>
        ))}

        {/* Floating texts */}
        {floatingTexts.map((item) => (
          <FloatingText key={item.id} item={item} onDone={removeFloating} />
        ))}
      </ImageBackground>

      {/* Slime Kılıcı suppression indicator */}
      {bubblesSuppressed && !fusionMode && (
        <View style={styles.suppressBar}>
          <Text style={styles.suppressText}>
            🫧 {lang === 'tr'
              ? `Baloncuklar engellendi — ${secondsLeft}s`
              : `Bubbles suppressed — ${secondsLeft}s`}
          </Text>
        </View>
      )}

      {fusionMode && (
        <View style={styles.fusionModeBar}>
          <Text style={styles.fusionModeText}>
            ✨ {lang === 'tr' ? `Füzyon Mod — ${secondsLeft}s • Her vuruş 3× hasar` : `Fusion Mode — ${secondsLeft}s • Each hit deals 3× damage`}
          </Text>
        </View>
      )}

      {crossMode && (
        <View style={styles.crossModeBar}>
          <Text style={styles.crossModeText}>
            ✕ {lang === 'tr' ? `Mutlak Mod — ${secondsLeft}s • Her ✕ 2× hasar` : `Absolute Mode — ${secondsLeft}s • Each ✕ deals 2× damage`}
          </Text>
        </View>
      )}

      {cursed && (
        <View style={styles.cursedBar}>
          <Text style={styles.cursedText}>
            ☠️ {lang === 'tr' ? 'Lanetlisin — iyileşme engellendi' : 'Cursed — regeneration blocked'}
          </Text>
        </View>
      )}

      {/* Hint bar */}
      <View style={styles.hintBar}>
        <Text style={styles.hintText} numberOfLines={1}>
          {lang === 'tr'
            ? `Her 5 vuruşta +${monster.hitRewardTikTik} TT • Her 10 vuruşta +${monster.hitRewardXp} XP`
            : `Every 5 hits +${monster.hitRewardTikTik} TT • Every 10 hits +${monster.hitRewardXp} XP`}
        </Text>
        {(() => {
          const activeSys = [...IDLE_SYSTEMS].reverse().find((x) => purchasedIdleSystems.includes(x.id));
          return activeSys ? (
            <Text style={styles.hintIdle} numberOfLines={1}>
              {activeSys.emoji} {t(lang, activeSys.nameKey as any)}
            </Text>
          ) : null;
        })()}
      </View>

      {/* Click Power indicator */}
      <View style={styles.powerRow}>
        {kutsalKilicEquipped ? (() => {
          const clickDmg = CLICK_POWER_DAMAGE[clickPower - 1] ?? clickPower;
          const kutsalBase = Math.round((clickDmg * touchMultiplier + 2000 + flatWeaponBonus) * 1.5 * weaponDamageMultiplier);
          const kutsalCrit = Math.round((clickDmg * touchMultiplier + 2000 + flatWeaponBonus) * 3 * weaponDamageMultiplier);
          return (
            <>
              <Text style={styles.powerLabel}>⚔️ </Text>
              <Text style={[styles.powerValue, { color: '#B8E0FF' }]}>{kutsalBase.toLocaleString()}</Text>
              <Text style={styles.powerLabel}> / </Text>
              <Text style={[styles.powerValue, { color: COLORS.GOLD }]}>{kutsalCrit.toLocaleString()}</Text>
              <Text style={styles.powerLabel}>{lang === 'tr' ? ' (11. vuruş)' : ' (11th hit)'}</Text>
            </>
          );
        })() : (
          <>
            <Text style={styles.powerLabel}>⚡ {t(lang, 'shop_click_power')}: </Text>
            <Text style={styles.powerValue}>{(CLICK_POWER_DAMAGE[clickPower - 1] ?? clickPower) * touchMultiplier}</Text>
            {touchMultiplier > 1 && <Text style={styles.powerLabel}> ({touchMultiplier}x)</Text>}
          </>
        )}
      </View>

      {/* Equipped weapon effect chips */}
      {equippedWeapons.length > 0 && (
        <View style={styles.weaponEffectsRow}>
          {equippedWeapons.map((id) => {
            const baseWeapon = WEAPONS.find((w) => w.id === id);
            const enhanced = enhancedWeapons.find((e) => e.instanceId === id);
            const weapon = baseWeapon ?? (enhanced ? WEAPONS.find((w) => w.id === enhanced.baseWeaponId) : null);
            if (!weapon) return null;

            const isDisabled = gumusKilicEquipped && id !== 'gumus_kilic' && weapon.bonusType !== 'bubble_suppress';
            let label = '';
            let chipColor = '#E17055';

            if (weapon.bonusType === 'kutsal_kilic') {
              label = '+2000 • ×1.5';
              chipColor = '#B8E0FF';
            } else if (weapon.bonusType === 'damage_percent') {
              const pct = Math.round(weapon.bonusValue * 100);
              label = enhanced ? `+${enhanced.enhancement.toLocaleString()} • +${pct}%` : `+${pct}%`;
            } else if (weapon.bonusType === 'bubble_suppress') {
              const holdTime = slimeSwordStage >= 1 ? '2s' : '3s';
              const effect = slimeSwordStage === 3 ? '✨10s' : slimeSwordStage === 2 ? '✕10s' : slimeSwordStage === 1 ? '20s' : '10s';
              label = `${holdTime}→${effect}`;
              chipColor = '#2ED573';
            }

            return (
              <View key={id} style={[styles.weaponChip, isDisabled && styles.weaponChipDisabled]}>
                <Text style={styles.weaponChipEmoji}>{weapon.emoji}</Text>
                <Text style={[styles.weaponChipLabel, { color: isDisabled ? COLORS.TEXT_MUTED : chipColor }]}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Monster Picker Modal */}
      <Modal visible={showMonsterPicker} transparent animationType="slide" onRequestClose={() => setShowMonsterPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t(lang, 'monster_select')}</Text>
            <ScrollView>
              {MONSTERS.filter((m) => (m.id !== 20 || unlockedMonsters.includes(20)) && (m.id !== 21 || unlockedMonsters.includes(21))).map((m) => {
                const unlocked = unlockedMonsters.includes(m.id);
                const active = m.id === activeMonsterId;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.monsterRow,
                      active && { borderColor: m.color, borderWidth: 2 },
                      !unlocked && styles.lockedRow,
                    ]}
                    onPress={() => {
                      if (unlocked) {
                        setActiveMonster(m.id);
                        setShowMonsterPicker(false);
                      }
                    }}
                    activeOpacity={unlocked ? 0.7 : 1}
                  >
                    {unlocked && m.image != null ? (
                      <Image source={m.image} style={styles.monsterRowImage} resizeMode="contain" />
                    ) : (
                      <Text style={styles.monsterRowEmoji}>{unlocked ? m.emoji : '🔒'}</Text>
                    )}
                    <View style={styles.monsterRowInfo}>
                      <Text style={[styles.monsterRowName, { color: unlocked ? m.color : COLORS.TEXT_MUTED }]}>
                        {unlocked ? t(lang, m.nameKey as any) : t(lang, 'ach_locked')}
                      </Text>
                      <Text style={styles.monsterRowSub}>
                        {unlocked
                          ? `HP: ${m.maxHp.toLocaleString()} • Lvl ${m.level}`
                          : t(lang, 'monster_locked', { xp: m.requiredXp.toLocaleString() })}
                      </Text>
                    </View>
                    {active && <Text style={[styles.activeTag, { color: m.color }]}>▶</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowMonsterPicker(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Kutsal Kılıç victory overlay */}
      <Modal visible={showKutsalKilic} transparent animationType="fade">
        <View style={styles.kutsalOverlay}>
          <Text style={styles.kutsalEmoji}>⚔️</Text>
          <Text style={styles.kutsalTitle}>
            {lang === 'tr' ? 'KUTSAL KILIÇ AÇILDI!' : 'HOLY SWORD UNLOCKED!'}
          </Text>
          <Text style={styles.kutsalSub}>
            {lang === 'tr' ? 'Melek yenildi!' : 'Angel defeated!'}
          </Text>
          <Text style={styles.kutsalTikTik}>+1.500.000 TT</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_DARK,
    paddingTop: SPACING.SM,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingBottom: SPACING.SM,
  },
  headerStat: { alignItems: 'center', minWidth: 80 },
  statLabel: { fontSize: 11, color: COLORS.TEXT_MUTED, fontWeight: '600', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.GOLD },
  monsterSelectBtn: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.FULL,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  monsterSelectText: { color: COLORS.TEXT_SECONDARY, fontSize: 13, fontWeight: '600' },
  monsterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  monsterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    flex: 1,
  },
  monsterName: { fontSize: 20, fontWeight: '900' },
  monsterLevel: { fontSize: 13, color: COLORS.TEXT_SECONDARY, fontWeight: '600' },
  playerHpWidget: {
    alignItems: 'flex-end',
  },
  playerHpTrack: {
    width: 110,
    height: 18,
    backgroundColor: COLORS.BG_ELEVATED,
    borderRadius: RADIUS.FULL,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerHpFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#FF7675',
    borderRadius: RADIUS.FULL,
  },
  playerHpText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  } as const,
  xpBufferContainer: {
    marginHorizontal: SPACING.MD,
    marginBottom: SPACING.SM,
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.MD,
    padding: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  xpBufferLabel: { fontSize: 12, color: COLORS.PURPLE, fontWeight: '700', minWidth: 72 },
  xpBufferTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.BG_ELEVATED,
    borderRadius: RADIUS.FULL,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  xpBufferFill: {
    height: '100%',
    backgroundColor: COLORS.PURPLE,
    borderRadius: RADIUS.FULL,
  },
  xpBufferFull: { backgroundColor: COLORS.GOLD },
  xpBufferValue: { fontSize: 11, color: COLORS.TEXT_SECONDARY, fontWeight: '600', minWidth: 60, textAlign: 'right' },
  hpContainer: { paddingHorizontal: SPACING.MD, marginBottom: SPACING.SM },
  playArea: {
    flex: 1,
    marginHorizontal: SPACING.MD,
    borderRadius: RADIUS.LG,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: COLORS.BG_CARD,
    alignItems: 'center',
  },
  playAreaBgImage: {
    borderRadius: RADIUS.LG,
    opacity: 0.6,
  },
  monsterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monsterGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  monsterEmoji: {
    fontSize: 270,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  monsterImage: {
    width: 360,
    height: 360,
  },
  // imageScale monsters.ts'den okunur, inline style olarak uygulanır
  bubble: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleEmoji: {},
  suppressBar: {
    marginHorizontal: SPACING.MD,
    marginBottom: 2,
    backgroundColor: 'rgba(46,213,115,0.15)',
    borderRadius: RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#2ED57366',
    alignItems: 'center',
  },
  suppressText: { fontSize: 12, color: '#2ED573', fontWeight: '800' },
  crossModeBar: {
    marginHorizontal: SPACING.MD,
    marginBottom: 2,
    backgroundColor: 'rgba(162,155,254,0.2)',
    borderRadius: RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#A29BFE88',
    alignItems: 'center',
  },
  crossModeText: { fontSize: 12, color: '#A29BFE', fontWeight: '800' },
  fusionModeBar: {
    marginHorizontal: SPACING.MD,
    marginBottom: 2,
    backgroundColor: 'rgba(0,229,107,0.15)',
    borderRadius: RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#00E56B88',
    alignItems: 'center',
  },
  fusionModeText: { fontSize: 12, color: '#00E56B', fontWeight: '800' } as const,
  crossBubble: { color: '#A29BFE', fontWeight: '900' },
  cursedBar: {
    marginHorizontal: SPACING.MD,
    marginBottom: 2,
    backgroundColor: 'rgba(162,155,254,0.15)',
    borderRadius: RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#A29BFE66',
    alignItems: 'center',
  },
  cursedText: { fontSize: 12, color: '#A29BFE', fontWeight: '800' },
  hintBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
  },
  hintText: { fontSize: 11, color: COLORS.SECONDARY, fontWeight: '600', flex: 1 },
  hintIdle: { fontSize: 11, color: COLORS.PURPLE, fontWeight: '700', marginLeft: SPACING.SM },
  powerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.SM,
  },
  powerLabel: { fontSize: 12, color: COLORS.TEXT_MUTED },
  powerValue: { fontSize: 14, color: COLORS.CYAN, fontWeight: '800' },
  weaponEffectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: SPACING.MD,
    paddingBottom: SPACING.XS,
  },
  weaponChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.FULL,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  weaponChipDisabled: { opacity: 0.35 },
  weaponChipEmoji: { fontSize: 13 },
  weaponChipLabel: { fontSize: 11, fontWeight: '800' },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.BG_CARD,
    borderTopLeftRadius: RADIUS.XL,
    borderTopRightRadius: RADIUS.XL,
    padding: SPACING.MD,
    maxHeight: '75%',
  },
  modalTitle: { ...FONTS.HEADING, textAlign: 'center', marginBottom: SPACING.MD },
  modalClose: {
    position: 'absolute',
    top: SPACING.MD,
    right: SPACING.MD,
    padding: SPACING.SM,
  },
  modalCloseText: { color: COLORS.TEXT_SECONDARY, fontSize: 18, fontWeight: '700' },
  monsterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD2,
    borderRadius: RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  lockedRow: { opacity: 0.5 },
  monsterRowEmoji: { fontSize: 36, marginRight: SPACING.MD },
  monsterRowImage: { width: 48, height: 48, marginRight: SPACING.MD },
  monsterRowInfo: { flex: 1 },
  monsterRowName: { fontSize: 16, fontWeight: '800' },
  monsterRowSub: { fontSize: 12, color: COLORS.TEXT_MUTED, marginTop: 2 },
  activeTag: { fontSize: 20, fontWeight: '900' },
  kutsalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.MD,
  },
  kutsalEmoji: { fontSize: 80 },
  kutsalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#B8E0FF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  kutsalSub: { fontSize: 16, color: COLORS.TEXT_SECONDARY, fontWeight: '600' },
  kutsalTikTik: { fontSize: 22, fontWeight: '900', color: COLORS.GOLD },
});
